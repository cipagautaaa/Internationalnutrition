/**
 * Script de recuperación: reenvía la notificación de una orden al administrador.
 *
 * Uso:
 *   node scripts/recover-order-email.js
 *     → Envía la orden ORDER_6a0b84d21c8476b6f7412c24 (la del problema reportado)
 *
 *   node scripts/recover-order-email.js ORDER_<id>
 *     → Envía cualquier otra orden por su referencia Wompi
 *
 *   node scripts/recover-order-email.js --to otro@correo.com ORDER_<id>
 *     → Envía a un correo distinto al del .env
 *
 * El script omite el control de idempotencia (emailNotifications.adminNewOrderSentAt)
 * para forzar el reenvío aunque el flag ya esté marcado.
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const axios = require('axios');

// ── Datos de la transacción conocida (imagen 1 del reporte) ──────────────────
const KNOWN_TRANSACTION = {
  reference:     'ORDER_6a0b84d21c8476b6f7412c24',
  wompiId:       '1363419-1779139953-87753',
  amount:        238500,
  currency:      'COP',
  status:        'APPROVED',
  date:          '18 de mayo de 2026, 4:32 PM',
  paymentMethod: 'Mastercard terminada en 0374',
  customer: {
    fullName:  'JULIO CESAR OLARTE GONZALEZ',
    email:     'juliocesaro123567@gmail.com',
    phone:     '+573219013562',
  },
};

// ── Parse de argumentos ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
let reference = KNOWN_TRANSACTION.reference;
let overrideEmail = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--to' && args[i + 1]) {
    overrideEmail = args[++i];
  } else if (args[i].startsWith('ORDER_')) {
    reference = args[i];
  }
}

const adminEmailTarget =
  overrideEmail ||
  process.env.ADMIN_EMAIL ||
  process.env.EMAIL_USER ||
  'internationalnutritioncol@gmail.com';

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n════════════════════════════════════════════════');
  console.log('  Script de recuperación de email de orden');
  console.log('════════════════════════════════════════════════');
  console.log(`  Referencia : ${reference}`);
  console.log(`  Destinatario: ${adminEmailTarget}`);
  console.log('════════════════════════════════════════════════\n');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI no está configurado en .env');
    process.exit(1);
  }

  const mongoOpts = process.env.MONGODB_DB_NAME ? { dbName: process.env.MONGODB_DB_NAME } : {};
  await mongoose.connect(mongoUri, mongoOpts);
  console.log('✅ Conectado a MongoDB\n');

  // Cargar modelos DESPUÉS de conectar
  // `mongoose.model('Order')` throws when the model has not been registered
  // yet, so load the model module directly for this standalone script.
  const Order = require('../models/Order');
  // Register the referenced models so `populate` can resolve each order item.
  require('../models/Product');
  require('../models/Combo');
  require('../models/Implement');
  require('../models/User');

  let order = null;
  try {
    order = await Order
      .findOne({ wompiReference: reference })
      .populate({ path: 'items.product', strictPopulate: false })
      .populate('user');
  } catch (e) {
    console.warn('⚠️ Error populando orden:', e.message);
    order = await Order.findOne({ wompiReference: reference });
  }

  if (order) {
    console.log(`✅ Orden encontrada en MongoDB:`);
    console.log(`   ID          : ${order._id}`);
    console.log(`   Cliente     : ${order.customerData?.fullName || order.customerData?.email}`);
    console.log(`   Total       : $${order.totalAmount?.toLocaleString('es-CO')} COP`);
    console.log(`   Estado pago : ${order.paymentStatus}`);
    console.log(`   Email admin ya enviado: ${order.emailNotifications?.adminNewOrderSentAt ? 'SÍ (' + order.emailNotifications.adminNewOrderSentAt + ')' : 'NO'}`);
    console.log('');
  } else {
    console.log(`⚠️ Orden no encontrada en MongoDB con referencia: ${reference}`);
    console.log('   Se usarán los datos conocidos de la transacción Wompi.\n');
  }

  const html = buildOrderHtml(order, reference);
  const subject = order
    ? `[RECUPERACIÓN] Nueva Orden #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()} — $${order.totalAmount?.toLocaleString('es-CO')} COP`
    : `[RECUPERACIÓN] Orden Aprobada ${reference} — COP $${KNOWN_TRANSACTION.amount.toLocaleString('es-CO')}`;

  await sendEmail(adminEmailTarget, subject, html);

  // Marcar en DB que el admin fue notificado (si la orden existe)
  if (order) {
    try {
      order.emailNotifications = order.emailNotifications || {};
      order.emailNotifications.adminNewOrderSentAt = new Date();
      await order.save();
      console.log('✅ Flag adminNewOrderSentAt actualizado en la orden.');
    } catch (e) {
      console.warn('⚠️ No se pudo actualizar el flag en la orden:', e.message);
    }
  }

  await mongoose.disconnect();
  console.log('\n✅ Script completado correctamente.');
}

// ── Envío de email ────────────────────────────────────────────────────────────
async function sendEmail(to, subject, html) {
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'internationalnutritioncol@gmail.com';
  const fromName  = process.env.EMAIL_FROM_NAME || 'International Nutrition';

  console.log(`📧 Intentando enviar email...`);
  console.log(`   Provider : ${provider || 'AUTO-DETECT'}`);
  console.log(`   De       : ${fromName} <${fromEmail}>`);
  console.log(`   Para     : ${to}`);

  // ── Gmail OAuth ──────────────────────────────────────────────────────────
  if (provider === 'gmail-oauth' || provider === 'gmail_oauth') {
    const { google } = require('googleapis');
    const oauth2 = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
    );
    oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    const gmail = google.gmail({ version: 'v1', auth: oauth2 });

    const raw = encodeMessage([
      `From: ${fromName} <${fromEmail}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      html,
    ].join('\n'));

    const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
    console.log('✅ Email enviado vía Gmail OAuth. ID:', res.data?.id);
    return;
  }

  // ── SendGrid HTTP ────────────────────────────────────────────────────────
  if (provider === 'sendgrid' || process.env.SENDGRID_API_KEY) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error('SENDGRID_API_KEY no configurado');
    const payload = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [{ type: 'text/html', value: html }],
    };
    const resp = await axios.post('https://api.sendgrid.com/v3/mail/send', payload, {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    console.log('✅ Email enviado vía SendGrid. Status:', resp.status);
    return;
  }

  // ── Gmail SMTP (App Password) ────────────────────────────────────────────
  if (provider === 'gmail' || (process.env.EMAIL_USER && process.env.EMAIL_PASS)) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) throw new Error('EMAIL_USER / EMAIL_PASS no configurados');
    const t = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    const info = await t.sendMail({ from: `${fromName} <${fromEmail}>`, to, subject, html });
    console.log('✅ Email enviado vía Gmail SMTP. MessageId:', info.messageId);
    return;
  }

  // ── Resend HTTP ──────────────────────────────────────────────────────────
  if (provider === 'resend' || process.env.RESEND_API_KEY) {
    const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY no configurado');
    const resp = await axios.post('https://api.resend.com/emails',
      { from: `${fromName} <${fromEmail}>`, to: [to], subject, html },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 },
    );
    console.log('✅ Email enviado vía Resend. ID:', resp.data?.id);
    return;
  }

  throw new Error(
    'No hay proveedor de email configurado. Configura EMAIL_PROVIDER + credenciales en .env:\n' +
    '  - Gmail OAuth: EMAIL_PROVIDER=gmail-oauth + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN\n' +
    '  - Gmail SMTP:  EMAIL_PROVIDER=gmail + EMAIL_USER + EMAIL_PASS (App Password)\n' +
    '  - SendGrid:    EMAIL_PROVIDER=sendgrid + SENDGRID_API_KEY\n' +
    '  - Resend:      EMAIL_PROVIDER=resend + RESEND_API_KEY',
  );
}

// ── Construcción del HTML ─────────────────────────────────────────────────────
function buildOrderHtml(order, reference) {
  if (order) {
    const cust = order.customerData || order.user || {};
    const addr = order.shippingAddress || {};
    const items = (order.items || []).map(item => {
      const name = item.product?.name || item.product?.toString?.() || 'Producto';
      const qty  = item.quantity || 1;
      const price = item.price || 0;
      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">${name}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${qty}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">$${price.toLocaleString('es-CO')}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">$${(qty * price).toLocaleString('es-CO')}</td>
        </tr>`;
    }).join('');

    return `
<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;border:1px solid #ddd;border-radius:8px;">
  <div style="background:#3b82f6;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:22px;">🛒 [RECUPERACIÓN] Nueva Orden Recibida</h1>
  </div>
  <div style="padding:20px;">
    <div style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:20px;">
      <h2 style="color:#333;margin-top:0;">Información de la Orden</h2>
      <p><strong>Número de Orden:</strong> #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}</p>
      <p><strong>Referencia Wompi:</strong> ${reference}</p>
      <p><strong>Total:</strong> $${order.totalAmount.toLocaleString('es-CO')} COP</p>
      <p><strong>Método de Pago:</strong> ${order.paymentMethod}</p>
      <p><strong>Estado de Pago:</strong> ${order.paymentStatus}</p>
      <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString('es-CO', { dateStyle:'long', timeStyle:'short' })}</p>
    </div>

    <div style="margin-bottom:20px;">
      <h2 style="color:#333;">Información del Cliente</h2>
      ${cust.email    ? `<p><strong>Email:</strong> ${cust.email}</p>` : ''}
      ${cust.fullName ? `<p><strong>Nombre:</strong> ${cust.fullName}</p>` : ''}
      ${cust.phoneNumber ? `<p><strong>Teléfono:</strong> ${cust.phoneNumber}</p>` : ''}
      ${cust.legalId  ? `<p><strong>Documento:</strong> ${cust.legalIdType || 'CC'} ${cust.legalId}</p>` : ''}
    </div>

    <div style="margin-bottom:20px;">
      <h2 style="color:#333;">Dirección de Envío</h2>
      ${cust.fullName    ? `<p><strong>Nombre:</strong> ${cust.fullName}</p>` : ''}
      ${cust.phoneNumber ? `<p><strong>Teléfono:</strong> ${cust.phoneNumber}</p>` : ''}
      <p><strong>Dirección:</strong> ${addr.street || 'N/A'}</p>
      <p><strong>Ciudad:</strong> ${addr.city || 'N/A'}, ${addr.state || 'N/A'}</p>
      <p><strong>Código Postal:</strong> ${addr.zipCode || 'N/A'}</p>
      <p><strong>País:</strong> ${addr.country || 'Colombia'}</p>
    </div>

    <div>
      <h2 style="color:#333;">Productos Ordenados</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="padding:12px;text-align:left;border-bottom:2px solid #ddd;">Producto</th>
            <th style="padding:12px;text-align:center;border-bottom:2px solid #ddd;">Cant.</th>
            <th style="padding:12px;text-align:right;border-bottom:2px solid #ddd;">Precio Unit.</th>
            <th style="padding:12px;text-align:right;border-bottom:2px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items}
          <tr style="background:#f8f9fa;font-weight:bold;">
            <td colspan="3" style="padding:15px;text-align:right;border-top:2px solid #ddd;">TOTAL:</td>
            <td style="padding:15px;text-align:right;border-top:2px solid #ddd;">$${order.totalAmount.toLocaleString('es-CO')} COP</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top:30px;padding:15px;background:#fff3cd;border:1px solid #ffeaa7;border-radius:5px;">
      <p style="margin:0;color:#856404;">
        <strong>⚠️ Acción Requerida:</strong> Este email fue regenerado manualmente (script de recuperación). Revisa la orden y procesa el envío.
      </p>
    </div>
  </div>
</div>`;
  }

  // Fallback: datos conocidos de la transacción Wompi (sin orden en BD)
  const t = KNOWN_TRANSACTION;
  return `
<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;border:1px solid #ddd;border-radius:8px;">
  <div style="background:#dc2626;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:22px;">🛒 [RECUPERACIÓN MANUAL] Orden Aprobada</h1>
  </div>
  <div style="padding:20px;">
    <div style="background:#fef2f2;padding:15px;border-radius:5px;margin-bottom:20px;border:1px solid #fca5a5;">
      <p style="margin:0;color:#dc2626;"><strong>⚠️ La orden no fue encontrada en la base de datos.</strong><br>
      Los datos a continuación provienen directamente del dashboard de Wompi.</p>
    </div>

    <div style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:20px;">
      <h2 style="color:#333;margin-top:0;">Detalles de la Transacción Wompi</h2>
      <p><strong>Referencia:</strong> ${t.reference}</p>
      <p><strong>ID Transacción:</strong> ${t.wompiId}</p>
      <p><strong>Monto:</strong> ${t.currency} $${t.amount.toLocaleString('es-CO')}</p>
      <p><strong>Estado:</strong> ✅ ${t.status}</p>
      <p><strong>Fecha:</strong> ${t.date}</p>
      <p><strong>Método de Pago:</strong> ${t.paymentMethod}</p>
    </div>

    <div style="margin-bottom:20px;">
      <h2 style="color:#333;">Información del Cliente</h2>
      <p><strong>Nombre:</strong> ${t.customer.fullName}</p>
      <p><strong>Email:</strong> ${t.customer.email}</p>
      <p><strong>Teléfono:</strong> ${t.customer.phone}</p>
    </div>

    <div style="padding:15px;background:#fff3cd;border:1px solid #ffeaa7;border-radius:5px;">
      <p style="margin:0;color:#856404;">
        <strong>⚠️ Importante:</strong> Para ver los productos y dirección de envío completos,
        busca en la base de datos MongoDB la referencia <code>${t.reference}</code>
        o contacta al cliente en <a href="mailto:${t.customer.email}">${t.customer.email}</a> / ${t.customer.phone}.
      </p>
    </div>
  </div>
</div>`;
}

function encodeMessage(raw) {
  return Buffer.from(raw).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message || err);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
