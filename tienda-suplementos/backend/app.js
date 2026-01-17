const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Solo cargar .env en desarrollo, no en producción
// En producción, las variables vienen del dashboard de Railway/etc
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ override: true });
}

const app = express();

// Middleware de seguridad
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('combined'));

// Detrás de proxy (Railway/Vercel/etc.) para que express-rate-limit lea X-Forwarded-For
// y no lance errores/invalidaciones
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.' });
app.use('/api/', limiter);

// CORS - Configurar orígenes permitidos
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
console.log('[CORS] Allowed origins:', allowedOrigins);
console.log('[Server] Starting with CORS configuration...');

app.use(cors({
  origin: (origin, callback) => {
    // Permitir sin origin (requests desde el mismo servidor, Postman, etc.)
    if (!origin) return callback(null, true);
    // Permitir si está en la lista blanca
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Si no hay lista configurada, permitir todo (fallback)
    if (allowedOrigins.length === 0) return callback(null, true);
    // Si no está en la lista, rechazar
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir uploads
const path = require('path');
const fs = require('fs');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rutas
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const paymentsRoutes = require('./routes/payments');
const wompiRoutes = require('./routes/wompi');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const combosRoutes = require('./routes/combos');
const implementsRoutes = require('./routes/implements');
const contactRoutes = require('./routes/contact');
const discountCodesRoutes = require('./routes/discountCodes');
const wheelRoutes = require('./routes/wheel');

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/wompi', wompiRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/combos', combosRoutes);
app.use('/api/implements', implementsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/discount-codes', discountCodesRoutes);
app.use('/api/wheel', wheelRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ message: 'Servidor funcionando correctamente' }));

// Email Status (para diagnóstico)
app.get('/api/email-status', (req, res) => {
  const provider = process.env.EMAIL_PROVIDER || 'NO_CONFIGURADO';
  const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY);
  const hasGmail = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  const hasGmailOauth = Boolean(
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN &&
    process.env.EMAIL_USER
  );
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const emailFrom = process.env.EMAIL_FROM || 'NO_CONFIGURADO';
  const adminEmail = process.env.ADMIN_EMAIL || 'NO_CONFIGURADO';
  
  // Determinar estado
  let status = 'ERROR';
  let message = 'Configuración de email incompleta';
  
  if (provider === 'sendgrid' && hasSendGrid) {
    status = 'OK';
    message = 'SendGrid configurado correctamente';
  } else if ((provider === 'gmail-oauth' || provider === 'gmail_oauth') && hasGmailOauth) {
    status = 'OK';
    message = 'Gmail OAuth configurado correctamente';
  } else if (provider === 'gmail' && hasGmail) {
    status = 'OK';
    message = 'Gmail configurado correctamente';
  } else if (provider === 'resend' && hasResend) {
    status = 'OK';
    message = 'Resend configurado correctamente';
  } else if (provider === 'ethereal') {
    status = 'TEST';
    message = 'Usando Ethereal (solo pruebas)';
  }
  
  res.json({
    status,
    message,
    config: {
      provider,
      sendgrid: hasSendGrid ? '✅ API Key presente' : '❌ Faltante',
      gmail: hasGmail ? '✅ Credenciales presentes' : '❌ Faltante',
      gmailOauth: hasGmailOauth ? '✅ Credenciales presentes' : '❌ Faltante',
      resend: hasResend ? '✅ API Key presente' : '❌ Faltante',
      emailFrom: emailFrom ? emailFrom.substring(0, 20) + '...' : 'NO_CONFIGURADO',
      adminEmail: adminEmail ? adminEmail.substring(0, 10) + '...' : 'NO_CONFIGURADO'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

module.exports = app;
