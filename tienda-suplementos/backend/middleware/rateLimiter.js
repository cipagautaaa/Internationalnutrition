const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

// Limitar intentos de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 5 intentos por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de login, por favor intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limitar solicitudes de código
const codeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos por hora
  message: {
    success: false,
    message: 'Demasiados códigos solicitados, por favor intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginLimiter,
  codeLimiter
};