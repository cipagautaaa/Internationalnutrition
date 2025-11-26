const nodemailer = require('nodemailer');

// EMAIL_PROVIDER options:
//  - gmail (recomendado con App Password)
//  - custom (usa EMAIL_HOST/EMAIL_PORT)
//  - ethereal (testing)
const createTransporter = () => {
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();

  if (provider === 'gmail') {
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

  if (provider === 'ethereal') {
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

  // Fallback a configuración custom
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
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Verificación de Email - SportSupps',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">¡Bienvenido a SportSupps!</h2>
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
    return info;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw new Error(`Error enviando email de verificación: ${error.message || error}`);
  }
};

module.exports = { sendVerificationEmail };
// Export para debug
module.exports.verifyTransport = async () => {
  const transporter = createTransporter();
  return transporter.verify();
};
