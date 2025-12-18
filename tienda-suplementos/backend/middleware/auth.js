const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado, token faltante'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware de autenticación opcional
 * Permite continuar sin autenticación, pero si hay token válido, lo decodifica
 * Útil para rutas que funcionan tanto para usuarios autenticados como invitados
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Si no hay header de autorización, continuar sin usuario
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Token inválido, pero permitimos continuar como invitado
    req.user = null;
  }
  
  next();
};

module.exports = { protect, optionalAuth };