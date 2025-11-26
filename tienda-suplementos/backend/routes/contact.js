const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../utils/emailService');
const rateLimit = require('express-rate-limit');

// Rate limit específico para contacto (máx 10 por hora por IP)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/', contactLimiter, async (req, res) => {
  try {
    const { nombre, apellido, email, mensaje } = req.body || {};
    // Validaciones básicas
    if (!nombre || !apellido || !email || !mensaje) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }
    if (mensaje.length < 5) {
      return res.status(400).json({ success: false, message: 'El mensaje es demasiado corto' });
    }
    if (mensaje.length > 4000) {
      return res.status(400).json({ success: false, message: 'El mensaje excede el límite de 4000 caracteres' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Formato de correo inválido' });
    }

    await sendContactMessage({ nombre, apellido, email, mensaje });
    return res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error enviando mensaje' });
  }
});

module.exports = router;
