const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ override: true });

const app = express();

// Middleware de seguridad
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.' });
app.use('/api/', limiter);

// CORS
app.use(cors({ origin: (origin, callback) => { if (!origin) return callback(null, true); return callback(null, true); }, credentials: true }));

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
