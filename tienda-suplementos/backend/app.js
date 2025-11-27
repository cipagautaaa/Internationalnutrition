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

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/wompi', wompiRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/combos', combosRoutes);
app.use('/api/implements', implementsRoutes);
app.use('/api/contact', contactRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ message: 'Servidor funcionando correctamente' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

module.exports = app;
