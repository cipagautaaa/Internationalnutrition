const nodemailer = require('nodemailer');
const axios = require('axios');
const { google } = require('googleapis');
const EmailOutbox = require('../models/EmailOutbox');
const Order = require('../models/Order');

console.log('📧 EmailService v2 con SendGrid cargado');
console.log(`📧 EMAIL_PROVIDER=${process.env.EMAIL_PROVIDER || 'NO_CONFIGURADO'}`);
console.log(`📧 SENDGRID_API_KEY=${process.env.SENDGRID_API_KEY ? '✅ PRESENTE' : '❌ FALTANTE'}`);
console.log(`📧 EMAIL_FROM=${process.env.EMAIL_FROM || 'no configurado'}`);
try {
  const envKeys = Object.keys(process.env || {});
  const relevant = envKeys.filter(k => /SENDGRID|EMAIL_PROVIDER|EMAIL_FROM/i.test(k));
  console.log('📧 Env keys presentes (parciales):', relevant);
} catch {}

// Helper: base64url encode for Gmail API
const encodeGmailMessage = (message) => Buffer.from(message)
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

// Helper: detect if email creds are properly configured
const canSendEmails = () => {
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  if (provider === 'gmail-oauth' || provider === 'gmail_oauth') {
    return Boolean(
      process.env.GMAIL_CLIENT_ID &&
      process.env.GMAIL_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN &&
      process.env.EMAIL_USER
    );
  }
  if (provider === 'gmail') {
    return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  }
  if (provider === 'resend') {
    return Boolean(process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY);
  }
  if (provider === 'sendgrid') {
    return Boolean(process.env.SENDGRID_API_KEY);
  }
  if (provider === 'ethereal') {
    return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  }
  // custom SMTP
  if (provider === 'custom' || provider === '') {
    return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
  }
  return false;
};

const OUTBOX_INSTANCE_ID = process.env.EMAIL_OUTBOX_INSTANCE_ID || process.env.RAILWAY_SERVICE_ID || String(process.pid);

const computeBackoffMs = (attempts) => {
  // Backoff progresivo con tope. attempts empieza en 1.
  const schedule = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 6 * 60 * 60_000, 24 * 60 * 60_000];
  const idx = Math.min(Math.max(attempts - 1, 0), schedule.length - 1);
  return schedule[idx];
};

const enqueueEmailOutboxJob = async ({ kind, orderId, mailOptions, lastError }) => {
  if (!kind || !orderId || !mailOptions) return null;

  try {
    const now = new Date();
    const job = await EmailOutbox.findOneAndUpdate(
      { kind, orderId },
      {
        $set: {
          payload: {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            replyTo: mailOptions.replyTo
          },
          status: 'pending',
          nextAttemptAt: now,
          lastError: lastError ? String(lastError).slice(0, 4000) : null,
          lockedAt: null,
          lockedBy: null
        },
        $setOnInsert: {
          attempts: 0
        }
      },
      { upsert: true, new: true }
    );

    console.log('📮 [EmailOutbox] Encolado/actualizado', {
      kind,
      orderId: String(orderId),
      jobId: String(job._id)
    });
    return job;
  } catch (err) {
    console.error('❌ [EmailOutbox] Error encolando job:', err?.message || err);
    return null;
  }
};

const processEmailOutboxOnce = async () => {
  const enabled = String(process.env.EMAIL_OUTBOX_WORKER || (process.env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true';
  if (!enabled) return { skipped: true, reason: 'worker_disabled' };

  const now = new Date();
  const staleMs = Number(process.env.EMAIL_OUTBOX_LOCK_STALE_MS || 10 * 60_000);
  const staleBefore = new Date(Date.now() - staleMs);
  const maxAttempts = Number(process.env.EMAIL_OUTBOX_MAX_ATTEMPTS || 10);

  const job = await EmailOutbox.findOneAndUpdate(
    {
      $or: [
        { status: { $in: ['pending', 'failed'] }, nextAttemptAt: { $lte: now } },
        { status: 'processing', lockedAt: { $lte: staleBefore } }
      ]
    },
    {
      $set: { status: 'processing', lockedAt: now, lockedBy: OUTBOX_INSTANCE_ID },
      $inc: { attempts: 1 }
    },
    { new: true, sort: { nextAttemptAt: 1, updatedAt: 1 } }
  );

  if (!job) return { skipped: true, reason: 'no_jobs' };
  if (job.attempts > maxAttempts) {
    await EmailOutbox.updateOne(
      { _id: job._id },
      { $set: { status: 'dead', lastError: `Max attempts exceeded (${maxAttempts})`, lockedAt: null, lockedBy: null } }
    );
    return { dead: true, jobId: String(job._id) };
  }

  try {
    const transporter = await createTransporterAsync();
    const info = await transporter.sendMail(job.payload);
    if (info?.skipped) throw new Error('Email skipped by transporter (no provider configured)');

    await EmailOutbox.updateOne(
      { _id: job._id },
      {
        $set: {
          status: 'sent',
          sentAt: new Date(),
          messageId: info?.messageId || null,
          lastError: null,
          lockedAt: null,
          lockedBy: null
        }
      }
    );

    const orderUpdate = { 'emailNotifications.lastEmailError': null };
    if (job.kind === 'admin_new_order') orderUpdate['emailNotifications.adminNewOrderSentAt'] = new Date();
    if (job.kind === 'customer_order_confirmation') orderUpdate['emailNotifications.customerConfirmationSentAt'] = new Date();
    await Order.updateOne({ _id: job.orderId }, { $set: orderUpdate }).catch(() => {});

    console.log('✅ [EmailOutbox] Job enviado', { jobId: String(job._id), kind: job.kind, orderId: String(job.orderId) });
    return { sent: true, jobId: String(job._id) };
  } catch (err) {
    const msg = err?.message || String(err);
    const nextAttemptAt = new Date(Date.now() + computeBackoffMs(job.attempts));

    await EmailOutbox.updateOne(
      { _id: job._id },
      { $set: { status: 'failed', lastError: msg.slice(0, 4000), nextAttemptAt, lockedAt: null, lockedBy: null } }
    );
    await Order.updateOne(
      { _id: job.orderId },
      { $set: { 'emailNotifications.lastEmailError': msg.slice(0, 4000) } }
    ).catch(() => {});

    console.warn('⚠️ [EmailOutbox] Job falló, reintento programado', {
      jobId: String(job._id),
      kind: job.kind,
      attempts: job.attempts,
      nextAttemptAt: nextAttemptAt.toISOString(),
      error: msg
    });
    return { failed: true, jobId: String(job._id) };
  }
};

let outboxIntervalHandle = null;
const startEmailOutboxWorker = () => {
  const enabled = String(process.env.EMAIL_OUTBOX_WORKER || (process.env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true';
  if (!enabled) return;
  if (outboxIntervalHandle) return;

  const intervalMs = Number(process.env.EMAIL_OUTBOX_INTERVAL_MS || 30_000);
  console.log('📮 [EmailOutbox] Worker iniciado', { intervalMs, instance: OUTBOX_INSTANCE_ID });
  processEmailOutboxOnce().catch((e) => console.warn('⚠️ [EmailOutbox] Kick error:', e?.message || e));
  outboxIntervalHandle = setInterval(() => {
    processEmailOutboxOnce().catch((e) => console.warn('⚠️ [EmailOutbox] Tick error:', e?.message || e));
  }, intervalMs);
};

// EMAIL_PROVIDER options:
//  - gmail (recomendado con App Password)
//  - custom (usa EMAIL_HOST/EMAIL_PORT)
//  - ethereal (testing)
//  - sendgrid (HTTP API, recomendado para Railway)
// Devuelve un transporter. En desarrollo, si no hay provider configurado creamos
// automáticamente una cuenta de prueba (Ethereal) para facilitar pruebas locales.
const createTransporterAsync = async () => {
  let provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();

  // Si está vacío, intentar auto-detect
  if (!provider) {
    if (process.env.SENDGRID_API_KEY) {
      console.log('📧 AUTO-DETECT: Usando SendGrid (SENDGRID_API_KEY presente)');
      provider = 'sendgrid';
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('📧 AUTO-DETECT: Usando Gmail (EMAIL_USER/PASS presente)');
      provider = 'gmail';
    } else if (process.env.NODE_ENV === 'production') {
      console.log('📧 AUTO-DETECT: Fallback a SendGrid en producción');
      provider = 'sendgrid';
    } else {
      console.log('📧 AUTO-DETECT: Usando Ethereal para testing');
      provider = 'ethereal';
    }
  }

  // Gmail con OAuth2 vía API HTTP (evita SMTP bloqueado en Railway)
  if (provider === 'gmail-oauth' || provider === 'gmail_oauth') {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.EMAIL_USER;
    const fromEmail = process.env.EMAIL_FROM || user;
    const fromName = process.env.EMAIL_FROM_NAME || 'International Nutrition';

    if (!clientId || !clientSecret || !refreshToken || !user) {
      console.warn('⚠️ EMAIL_PROVIDER=gmail-oauth pero faltan credenciales OAuth. Fallback a SendGrid.');
      provider = 'sendgrid';
    } else {
      console.log('📧 Usando Gmail OAuth2 vía API HTTP');
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      return {
        sendMail: async (opts) => {
          const to = Array.isArray(opts.to) ? opts.to[0] : opts.to;
          const replyToEmail = process.env.EMAIL_REPLY_TO || fromEmail;
          const subject = opts.subject || '';
          const html = opts.html || '';

          const headers = [
            `From: ${fromName} <${fromEmail}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            replyToEmail ? `Reply-To: ${replyToEmail}` : null,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset="UTF-8"'
          ].filter(Boolean);

          const message = [...headers, '', html].join('\n');

          const raw = encodeGmailMessage(message);

          // Intentar enviar con reintentos (max 2)
          const maxRetries = 2;
          let lastError = null;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
              const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
              console.log(`✅ [Gmail OAuth] Email enviado a ${to} (intento ${attempt})`);
              return { messageId: res.data?.id || 'gmail-api', accepted: [to], rejected: [] };
            } catch (err) {
              lastError = err;
              const errCode = err.response?.data?.error?.code || err.code;
              const errMsg = err.response?.data?.error?.message || err.message || String(err);
              
              console.error(`❌ [Gmail OAuth] Error intento ${attempt}/${maxRetries}:`, errCode, errMsg);
              
              // Si es error de token expirado/revocado, no reintentar
              if (errCode === 401 || errCode === 403 || errMsg.includes('invalid_grant') || errMsg.includes('Token has been expired or revoked')) {
                console.error('🔴 [Gmail OAuth] Token expirado o revocado. Necesitas regenerar GMAIL_REFRESH_TOKEN.');
                break;
              }
              
              // Esperar antes de reintentar (backoff)
              if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
              }
            }
          }
          
          throw lastError;
        },
        verify: async () => true
      };
    }
  }

  if (provider === 'gmail') {
    // Verificar que tiene credenciales válidas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ EMAIL_PROVIDER=gmail pero sin EMAIL_USER/EMAIL_PASS. Fallback a SendGrid.');
      provider = 'sendgrid';
    } else {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // tu correo @gmail.com
          pass: process.env.EMAIL_PASS  // App Password (16 caracteres)
        },
        logger: String(process.env.EMAIL_DEBUG || 'false') === 'true',
        debug: String(process.env.EMAIL_DEBUG || 'false') === 'true'
      });
    }
  }

  // Proveedor Resend (HTTP API). Útil en Railway donde SMTP puede estar bloqueado.
  if (provider === 'resend') {
    return {
      sendMail: async (opts) => {
        const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
        if (!apiKey) throw new Error('RESEND_API_KEY faltante');
        const payload = {
          from: opts.from || process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: Array.isArray(opts.to) ? opts.to : [opts.to],
          subject: opts.subject,
          html: opts.html
        };
        const res = await axios.post('https://api.resend.com/emails', payload, {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 15000
        });
        return { messageId: res.data?.id, accepted: payload.to, rejected: [] };
      },
      // Compat nodemailer.verify
      verify: async () => true
    };
  }

  // SendGrid (HTTP API). Gratuito hasta 100 emails/día, recomendado para Railway.
  if (provider === 'sendgrid') {
    const apiKey = process.env.SENDGRID_API_KEY;
    console.log(`📧 [createTransporter] SendGrid provider. API Key: ${apiKey ? '✅ PRESENTE' : '❌ FALTANTE'}`);

    // En desarrollo, si alguien fuerza EMAIL_PROVIDER=sendgrid pero no configuró API key,
    // es mejor caer a Ethereal automáticamente para que las pruebas no “parezcan” funcionar.
    if (!apiKey && process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ [SendGrid] SENDGRID_API_KEY faltante en desarrollo. Fallback a Ethereal para pruebas.');
      provider = 'ethereal';
    } else {
      return {
        sendMail: async (opts) => {
          if (!apiKey) {
            // En producción esto debe verse como error (pero no necesariamente romper el flujo)
            throw new Error('SENDGRID_API_KEY faltante');
          }
        
        const fromEmail = opts.from || process.env.EMAIL_FROM || 'noreply@example.com';
        const fromName = process.env.EMAIL_FROM_NAME || 'International Nutrition';
        const replyToEmail = process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || fromEmail;
        
        const payload = {
          personalizations: [{ to: [{ email: Array.isArray(opts.to) ? opts.to[0] : opts.to }] }],
          from: { email: fromEmail, name: fromName },
          reply_to: { email: replyToEmail, name: fromName },
          subject: opts.subject,
          content: [{ type: 'text/html', value: opts.html }],
          // Headers adicionales para mejorar deliverability y evitar spam
          headers: {
            'X-Priority': '1',
            'X-Mailer': 'INTSUPPS-Ecommerce'
          },
          // Categorías para tracking en SendGrid
          categories: ['order-notification', 'intsupps'],
          // Mail settings para mejorar reputación
          mail_settings: {
            bypass_list_management: { enable: false },
            bypass_spam_management: { enable: false },
            bypass_bounce_management: { enable: false }
          }
        };
        const res = await axios.post('https://api.sendgrid.com/v3/mail/send', payload, {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 15000
        });
        return { messageId: res.headers['x-message-id'] || 'ok', accepted: [opts.to], rejected: [] };
        },
        verify: async () => true
      };
    }
  }

  // Ethereal o desarrollo sin provider: crear cuenta automática si no hay credenciales
  if (provider === 'ethereal' || (!provider && process.env.NODE_ENV !== 'production')) {
    // Si hay credenciales Ethereal manuales, usarlas
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('[Email] Usando credenciales Ethereal manuales:', process.env.EMAIL_USER);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        logger: String(process.env.EMAIL_DEBUG || 'false') === 'true',
        debug: String(process.env.EMAIL_DEBUG || 'false') === 'true'
      });
    }
    
    // Si no hay credenciales, crear cuenta de prueba automática
    console.log('[Email] Creando cuenta Ethereal automática para pruebas...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('[Email] Usando cuenta Ethereal de prueba:', testAccount.user);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      },
      logger: String(process.env.EMAIL_DEBUG || 'false') === 'true',
      debug: String(process.env.EMAIL_DEBUG || 'false') === 'true'
    });
  }

  // En producción sin provider válido, devolver transporter que skipea silenciosamente
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ [Email] En producción sin provider válido. Emails se skipearán.');
    return {
      sendMail: async (opts) => {
        console.warn('⚠️ [Email] Email skipped (no valid provider configured)');
        return { skipped: true, messageId: 'skipped' };
      },
      verify: async () => true
    };
  }

  // Fallback a configuración custom (solo en desarrollo)
  console.warn('⚠️ [Email] Fallback a configuración custom');
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE || 'false') === 'true', // true si usas 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    logger: String(process.env.EMAIL_DEBUG || 'false') === 'true',
    debug: String(process.env.EMAIL_DEBUG || 'false') === 'true'
  });
};

const sendVerificationEmail = async (email, verificationCode) => {
  // In producción, si no hay configuración de email, no bloquear el flujo.
  if (process.env.NODE_ENV === 'production' && !canSendEmails()) {
    console.warn('[Email] Configuración de correo faltante en producción. Saltando envío y respondiendo ok.');
    return { skipped: true };
  }
  
  console.log(`📧 [sendVerificationEmail] Iniciando envío a ${email}`);
  console.log(`📧 [sendVerificationEmail] Provider=${process.env.EMAIL_PROVIDER || 'NONE'}`);
  
  const transporter = await createTransporterAsync();
  console.log(`📧 [sendVerificationEmail] Transporter creado, intentando sendMail`);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'internationalnutritioncol@gmail.com',
    to: email,
    subject: 'Verificación de Email - INTSUPPS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b91c1c;">¡Bienvenido a INTSUPPS!</h2>
        <p>Gracias por registrarte en nuestra tienda de suplementos deportivos.</p>
        <p>Para completar tu registro, por favor ingresa el siguiente código de verificación:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #3b82f6; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
        </div>
        <p>Este código expirará en 10 minutos.</p>
        <p>Si no solicitaste este registro, puedes ignorar este email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de verificación enviado a:', email, {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected
    });
    // Si es Ethereal, mostrar URL de previsualización
    try {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('🔍 Preview URL:', preview);
    } catch (e) {
      // no-op
    }
    return info;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    // En producción, no bloquear el login/registro por fallo de correo. Devolver skip.
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Email] Fallo enviando correo en producción. Continuando sin bloquear.');
      return { skipped: true, error: error.message || String(error) };
    }
    throw new Error(`Error enviando email de verificación: ${error.message || error}`);
  }
};

const sendPasswordResetEmail = async (email, verificationCode) => {
  if (process.env.NODE_ENV === 'production' && !canSendEmails()) {
    console.warn('[Email] Configuración de correo faltante en producción. Saltando envío y respondiendo ok.');
    return { skipped: true };
  }

  const transporter = await createTransporterAsync();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'internationalnutritioncol@gmail.com',
    to: email,
    subject: 'Recupera tu contraseña - INTSUPPS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b91c1c;">Recupera tu acceso en INTSUPPS</h2>
        <p>Usa el siguiente código para restablecer tu contraseña. Si no solicitaste este cambio, ignora este correo.</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #3b82f6; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
        </div>
        <p>El código expira en 10 minutos.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado a:', email, {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected
    });
    try {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('🔍 Preview URL:', preview);
    } catch (e) {}
    return info;
  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error);
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Email] Fallo enviando correo en producción. Continuando sin bloquear.');
      return { skipped: true, error: error.message || String(error) };
    }
    throw new Error(`Error enviando email de recuperación: ${error.message || error}`);
  }
};

// Enviar notificación de nueva orden al administrador
const sendNewOrderNotificationToAdmin = async (order, userInfo) => {
  console.log('📧 [sendNewOrderNotificationToAdmin] INICIANDO...');
  console.log('📧 [sendNewOrderNotificationToAdmin] Order ID:', order._id);
  console.log('📧 [sendNewOrderNotificationToAdmin] User Info:', {
    email: userInfo?.email,
    firstName: userInfo?.firstName,
    lastName: userInfo?.lastName
  });
  
  const transporter = await createTransporterAsync();

  const customerEmail = userInfo?.email || order?.customerData?.email || '';
  const customerFullName =
    userInfo?.fullName ||
    [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(' ') ||
    order?.customerData?.fullName ||
    '';
  const customerPhone = userInfo?.phone || userInfo?.phoneNumber || order?.customerData?.phoneNumber || '';
  const customerLegalIdType = userInfo?.legalIdType || order?.customerData?.legalIdType || '';
  const customerLegalId = userInfo?.legalId || order?.customerData?.legalId || '';
  
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  console.log('📧 [sendNewOrderNotificationToAdmin] Admin Email:', adminEmail);
  console.log('📧 [sendNewOrderNotificationToAdmin] Email From:', process.env.EMAIL_FROM || process.env.EMAIL_USER);

  if (!adminEmail) {
    console.error('❌ [sendNewOrderNotificationToAdmin] ADMIN_EMAIL/EMAIL_USER no configurado. No se puede enviar notificación.');
    return { skipped: true, reason: 'missing_admin_email' };
  }
  
  const orderItemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.product?.name || 'Producto eliminado'}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${item.price.toLocaleString('es-CO')}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.quantity * item.price).toLocaleString('es-CO')}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: adminEmail,
    subject: `Orden #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()} - $${order.totalAmount.toLocaleString('es-CO')} COP`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🛒 Nueva Orden Recibida</h1>
        </div>
        
        <div style="padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Información de la Orden</h2>
            <p><strong>Número de Orden:</strong> #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Total:</strong> $${order.totalAmount.toLocaleString('es-CO')}</p>
            <p><strong>Método de Pago:</strong> ${order.paymentMethod}</p>
            <p><strong>Estado de Pago:</strong> ${order.paymentStatus}</p>
            <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-CO', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="color: #333;">Información del Cliente</h2>
            ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
            ${customerFullName ? `<p><strong>Nombre:</strong> ${customerFullName}</p>` : ''}
            ${customerPhone ? `<p><strong>Teléfono:</strong> ${customerPhone}</p>` : ''}
            ${customerLegalId ? `<p><strong>Documento:</strong> ${customerLegalIdType ? `${customerLegalIdType} ` : ''}${customerLegalId}</p>` : ''}
          </div>

          ${order.shippingAddress ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: #333;">Dirección de Envío</h2>
            <p><strong>Nombre:</strong> ${order.shippingAddress.fullName}</p>
            <p><strong>Teléfono:</strong> ${order.shippingAddress.phoneNumber}</p>
            <p><strong>Dirección:</strong> ${order.shippingAddress.street}</p>
            ${order.shippingAddress.addressLine2 ? `<p><strong>Complemento:</strong> ${order.shippingAddress.addressLine2}</p>` : ''}
            <p><strong>Ciudad:</strong> ${order.shippingAddress.city}, ${order.shippingAddress.region}</p>
            <p><strong>Código Postal:</strong> ${order.shippingAddress.zipCode || 'N/A'}</p>
          </div>
          ` : ''}

          <div>
            <h2 style="color: #333;">Productos Ordenados</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Cantidad</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Precio Unit.</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                  <td colspan="3" style="padding: 15px; text-align: right; border-top: 2px solid #ddd;">TOTAL:</td>
                  <td style="padding: 15px; text-align: right; border-top: 2px solid #ddd;">$${order.totalAmount.toLocaleString('es-CO')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Acción Requerida:</strong> Revisa esta orden y procesa el envío cuando sea apropiado.</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (info?.skipped) {
      console.warn('⚠️ Notificación de orden SKIPPED al admin. Encolando para reintento...', adminEmail, {
        orderId: order._id
      });
      const job = await enqueueEmailOutboxJob({
        kind: 'admin_new_order',
        orderId: order._id,
        mailOptions,
        lastError: 'skipped'
      });
      return { queued: true, jobId: job?._id, skipped: true };
    }

    console.log('✅ Notificación de orden enviada al admin:', adminEmail, {
      orderId: order._id,
      messageId: info?.messageId
    });
    try {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('🔍 Preview URL (admin):', preview);
    } catch (e) {}
    return info;
  } catch (error) {
    console.error('❌ Error enviando notificación al admin:', error);
    if (process.env.NODE_ENV === 'production') {
      const job = await enqueueEmailOutboxJob({
        kind: 'admin_new_order',
        orderId: order._id,
        mailOptions,
        lastError: error?.message || error
      });
      return { queued: true, jobId: job?._id, error: error?.message || String(error) };
    }
    throw new Error(`Error enviando notificación de orden: ${error.message || error}`);
  }
};

// Enviar confirmación de orden al cliente
const sendOrderConfirmationToCustomer = async (order, userInfo) => {
  console.log('📧 [sendOrderConfirmationToCustomer] INICIANDO...');
  console.log('📧 [sendOrderConfirmationToCustomer] Order ID:', order._id);
  console.log('📧 [sendOrderConfirmationToCustomer] Sending to:', userInfo?.email || order?.customerData?.email);
  
  const transporter = await createTransporterAsync();

  const customerEmail = userInfo?.email || order?.customerData?.email || '';
  const customerFullName =
    userInfo?.fullName ||
    [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(' ') ||
    order?.customerData?.fullName ||
    '';
    if (!customerEmail) {
      console.error('❌ [sendOrderConfirmationToCustomer] Email de cliente vacío. No se puede enviar confirmación.', {
        orderId: order?._id,
        userEmail: userInfo?.email,
        customerDataEmail: order?.customerData?.email
      });
      return { skipped: true, reason: 'missing_customer_email' };
    }

  const customerPhone = userInfo?.phone || userInfo?.phoneNumber || order?.customerData?.phoneNumber || '';
  const customerLegalIdType = userInfo?.legalIdType || order?.customerData?.legalIdType || '';
  const customerLegalId = userInfo?.legalId || order?.customerData?.legalId || '';
  
  const orderItemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.product?.name || 'Producto eliminado'}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${item.price.toLocaleString('es-CO')}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.quantity * item.price).toLocaleString('es-CO')}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: customerEmail,
    subject: `✅ Confirmación de Orden - SportSupps #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">✅ ¡Orden Confirmada!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Gracias por tu compra en SportSupps</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hola <strong>${customerFullName || userInfo?.firstName || 'cliente'}</strong>,</p>
          <p>Hemos recibido tu orden y la estamos procesando. Te notificaremos cuando sea enviada.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Detalles de tu Orden</h2>
            <p><strong>Número de Orden:</strong> #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Total:</strong> $${order.totalAmount.toLocaleString('es-CO')}</p>
            <p><strong>Método de Pago:</strong> ${order.paymentMethod}</p>
            <p><strong>Estado:</strong> ${order.paymentStatus === 'pending' ? 'Pendiente de pago' : 'Pagado'}</p>
            <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-CO', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })}</p>
          </div>

          <div style="margin: 20px 0;">
            <h2 style="color: #333;">Productos Ordenados</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Producto</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Cant.</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Precio</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
                <tr style="font-weight: bold; background-color: #f8f9fa;">
                  <td colspan="3" style="padding: 15px; text-align: right; border-top: 1px solid #ddd;">TOTAL:</td>
                  <td style="padding: 15px; text-align: right; border-top: 1px solid #ddd;">$${order.totalAmount.toLocaleString('es-CO')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${order.paymentMethod === 'transferencia' ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #856404;">💳 Instrucciones de Pago</h3>
            <p style="margin: 0; color: #856404;">Has elegido pago por transferencia. Te contactaremos pronto con los detalles bancarios para completar el pago.</p>
          </div>
          ` : ''}

          <div style="margin: 30px 0; text-align: center;">
            <p>¿Tienes preguntas sobre tu orden?</p>
            <p>Contáctanos: <strong>${process.env.EMAIL_USER}</strong></p>
          </div>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (info?.skipped) {
      console.warn('⚠️ Confirmación SKIPPED al cliente. Encolando para reintento...', mailOptions.to, {
        orderId: order._id
      });
      const job = await enqueueEmailOutboxJob({
        kind: 'customer_order_confirmation',
        orderId: order._id,
        mailOptions,
        lastError: 'skipped'
      });
      return { queued: true, jobId: job?._id, skipped: true };
    }

    console.log('✅ Confirmación de orden enviada al cliente:', mailOptions.to, {
      orderId: order._id,
      messageId: info?.messageId
    });
    try {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('🔍 Preview URL (customer):', preview);
    } catch (e) {}
    return info;
  } catch (error) {
    console.error('❌ Error enviando confirmación al cliente:', error);
    if (process.env.NODE_ENV === 'production') {
      const job = await enqueueEmailOutboxJob({
        kind: 'customer_order_confirmation',
        orderId: order._id,
        mailOptions,
        lastError: error?.message || error
      });
      return { queued: true, jobId: job?._id, error: error?.message || String(error) };
    }
    throw new Error(`Error enviando confirmación de orden: ${error.message || error}`);
  }
};

module.exports = { 
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewOrderNotificationToAdmin,
  sendOrderConfirmationToCustomer,
  processEmailOutboxOnce,
  startEmailOutboxWorker,
  sendContactMessage: async (payload) => {
    const { nombre, apellido, email, mensaje } = payload || {};
    if (!nombre || !apellido || !email || !mensaje) {
      throw new Error('Campos incompletos para mensaje de contacto');
    }
    // Sanitizar inputs para prevenir inyección HTML en emails
    const esc = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const sNombre = esc(nombre);
    const sApellido = esc(apellido);
    const sEmail = esc(email);
    const sMensaje = esc(mensaje);
    const transporter = await createTransporterAsync();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'internationalnutritioncol@gmail.com';
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: adminEmail,
      replyTo: email,
      subject: `📩 [Mensaje de cliente] ${sNombre} ${sApellido}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
          <h2 style="color:#dc2626;">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${sNombre} ${sApellido}</p>
          <p><strong>Email:</strong> ${sEmail}</p>
          <p style="white-space:pre-wrap; line-height:1.5;"><strong>Mensaje:</strong><br/>${sMensaje}</p>
          <hr style="margin:24px 0; border:none; border-top:1px solid #eee;"/>
          <p style="font-size:12px;color:#555;">Este correo fue generado desde el formulario de contacto.</p>
        </div>
      `
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Mensaje de contacto enviado:', { from: email, to: adminEmail, id: info?.messageId });
      return info;
    } catch (err) {
      console.error('❌ Error enviando mensaje de contacto:', err);
      throw new Error('Error enviando mensaje de contacto');
    }
  }
};
// Export para debug
module.exports.verifyTransport = async () => {
  const transporter = await createTransporterAsync();
  return transporter.verify();
};