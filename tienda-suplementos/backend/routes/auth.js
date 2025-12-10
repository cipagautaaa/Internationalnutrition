const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { generateVerificationCode } = require('../utils/generateCode');
const { protect } = require('../middleware/auth');
const { validateEmail, validateVerifyEmail } = require('../middleware/validation');
const { loginLimiter, codeLimiter } = require('../middleware/rateLimiter');
// (Revertido) TOTP eliminado
const bcrypt = require('bcryptjs');

const passwordMeetsPolicy = (password) => {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password || '');
};

// Login con email + contraseña (requiere email verificado)
router.post('/login', loginLimiter, validateEmail, async (req, res) => {
  const requestId = Math.random().toString(36).slice(2);
  try {
    const { email, password } = req.body;
    console.log(`[login:${requestId}] INICIO email=${email}`);

    if (!password) {
      return res.status(400).json({ success: false, message: 'Contraseña requerida' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[login:${requestId}] ❌ Usuario no encontrado`);
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Si es admin y tiene PIN pero no contraseña, sincroniza la contraseña con el PIN
    if (!user.passwordHash) {
      if (user.role === 'admin' && user.adminPinHash) {
        user.passwordHash = user.adminPinHash;
        await user.save();
        console.log(`[login:${requestId}] 🔄 Contraseña del admin sincronizada con PIN (hash)`);
      } else {
        return res.status(400).json({ success: false, message: 'Esta cuenta aún no tiene contraseña. Regístrate o restablece tu contraseña.' });
      }
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      console.log(`[login:${requestId}] ❌ Contraseña incorrecta`);
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    if (!user.isEmailVerified) {
      const verificationCode = generateVerificationCode();
      user.emailVerificationCode = verificationCode;
      user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      sendVerificationEmail(email, verificationCode)
        .then((info) => {
          if (info?.skipped) {
            console.log(`[login:${requestId}] Email SKIPPED (config faltante)`);
          } else {
            console.log(`[login:${requestId}] Email ENVIADO OK`);
          }
        })
        .catch((err) => {
          console.error(`[login:${requestId}] ⚠️ Error enviando email (no bloquea):`, err?.message || err);
        });

      return res.status(403).json({
        success: false,
        message: 'Necesitamos verificar tu email. Te enviamos un código.',
        data: { step: 'VERIFY_EMAIL', email: user.email }
      });
    }

    if (user.role === 'admin' && user.adminPinEnabled && user.adminPinHash) {
      console.log(`[login:${requestId}] 🔑 Admin requiere PIN`);
      const tempToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role, pendingAdminPin: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({
        success: true,
        message: 'Ingresa tu PIN de administrador',
        data: { step: 'ADMIN_PIN_REQUIRED', tempToken, user: { id: user._id, email: user.email, role: user.role } }
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    user.lastLogin = new Date();
    await user.save();

    console.log(`[login:${requestId}] ✅ Token emitido`);
    return res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phone: user.phone,
          birthDate: user.birthDate,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error(`[login:${requestId}] Error inesperado:`, error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Registrar usuario y enviar código de verificación
router.post('/send-code', codeLimiter, validateEmail, async (req, res) => {
  try {
    const { email, fullName, firstName, lastName, phone, birthDate, password } = req.body;

    let user = await User.findOne({ email });
    const isNewUser = !user;

    if (user && user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Este email ya está registrado. Inicia sesión.' });
    }

    if (!user) {
      if (!fullName || !phone || !birthDate || !password) {
        return res.status(400).json({ success: false, message: 'Completa nombre, teléfono, cumpleaños y contraseña antes de continuar.' });
      }
      user = new User({ email });
    }

    const parsedBirthDate = birthDate ? new Date(birthDate) : user.birthDate;
    if (birthDate && isNaN(parsedBirthDate)) {
      return res.status(400).json({ success: false, message: 'Fecha de cumpleaños inválida' });
    }

    const needsPassword = !user.passwordHash;
    if (needsPassword && !password) {
      return res.status(400).json({ success: false, message: 'Debes crear una contraseña para registrarte.' });
    }
    if (password && !passwordMeetsPolicy(password)) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.' });
    }

    const nameForSplit = fullName || user.fullName || '';
    const nameParts = nameForSplit.trim().split(/\s+/);
    const derivedFirst = nameParts[0] || '';
    const derivedLast = nameParts.slice(1).join(' ');

    user.fullName = fullName || user.fullName || `${user.firstName || derivedFirst} ${user.lastName || derivedLast}`.trim();
    user.firstName = firstName || user.firstName || derivedFirst;
    user.lastName = lastName || user.lastName || derivedLast;
    if (phone) user.phone = phone;
    if (parsedBirthDate) user.birthDate = parsedBirthDate;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    const verificationCode = generateVerificationCode();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.isEmailVerified = false;
    await user.save();

    sendVerificationEmail(email, verificationCode)
      .then((info) => {
        if (info?.skipped) {
          console.log(`[send-code] Email SKIPPED (config faltante)`);
        } else {
          console.log(`[send-code] Email ENVIADO OK`);
        }
      })
      .catch((err) => {
        console.error(`[send-code] ⚠️ Error enviando email (no bloquea):`, err?.message || err);
      });

    const message = isNewUser ? 'Código de verificación enviado. Revisa tu correo.' : 'Reenviamos el código de verificación a tu correo.';
    res.json({
      success: true,
      message,
      data: { email: user.email }
    });
  } catch (error) {
    console.error('Error enviando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Verificar código y hacer login
router.post('/verify-code', loginLimiter, validateVerifyEmail, async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ success: false, message: 'Falta configurar contraseña. Reinicia el registro.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Si es admin y tiene PIN habilitado, devolver paso intermedio (sin token final todavía)
    if (user.role === 'admin' && user.adminPinEnabled && user.adminPinHash) {
      const tempToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role, pendingAdminPin: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({
        success: true,
        message: 'Código verificado. Falta PIN administrador',
        data: {
          step: 'ADMIN_PIN_REQUIRED',
          tempToken,
          user: { id: user._id, email: user.email, role: user.role }
        }
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phone: user.phone,
          birthDate: user.birthDate,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error verificando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});


// Reenviar código de verificación
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email no encontrado'
      });
    }

    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Envío de email en background para no bloquear la respuesta
    sendVerificationEmail(email, verificationCode)
      .then((info) => {
        if (info?.skipped) {
          console.log(`[resend-code] Email SKIPPED (config faltante)`);
        } else {
          console.log(`[resend-code] Email ENVIADO OK`);
        }
      })
      .catch((err) => {
        console.error(`[resend-code] ⚠️ Error enviando email (no bloquea):`, err?.message || err);
      });

    res.json({
      success: true,
      message: 'Código de verificación reenviado'
    });
  } catch (error) {
    console.error('Error reenviando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Solicitar código para recuperar contraseña
router.post('/forgot-password', codeLimiter, validateEmail, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: true, message: 'Si el correo existe te enviaremos un código.' });
    }

    const resetCode = generateVerificationCode();
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendPasswordResetEmail(email, resetCode)
      .then((info) => {
        if (info?.skipped) {
          console.log(`[forgot-password] Email SKIPPED (config faltante)`);
        } else {
          console.log(`[forgot-password] Email ENVIADO OK`);
        }
      })
      .catch((err) => {
        console.error(`[forgot-password] ⚠️ Error enviando email (no bloquea):`, err?.message || err);
      });

    res.json({ success: true, message: 'Enviamos un código de recuperación a tu correo.' });
  } catch (error) {
    console.error('Error forgot-password:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Restablecer contraseña con código enviado al correo
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    if (!passwordMeetsPolicy(newPassword)) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.' });
    }

    const user = await User.findOne({
      email,
      passwordResetCode: code,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Código inválido o expirado' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ success: true, message: 'Contraseña actualizada. Ahora puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error reset-password:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario (ruta protegida)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar perfil del usuario (ruta protegida)
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, fullName, phone, birthDate, addresses } = req.body;

    const updates = { firstName, lastName, fullName, phone, addresses };
    if (birthDate) updates.birthDate = new Date(birthDate);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Cambiar contraseña autenticado (requiere contraseña actual)
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Debes ingresar tu contraseña actual y la nueva.' });
    }

    if (!passwordMeetsPolicy(newPassword)) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    if (!user.passwordHash) return res.status(400).json({ success: false, message: 'Esta cuenta no tiene contraseña configurada.' });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'La contraseña actual no es correcta' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error change-password:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
// ================== ADMIN PIN EXTRA SECURITY ==================

// Establecer (o cambiar) PIN admin (requiere estar logueado con token normal y ser admin)
router.post('/admin/set-pin', protect, async (req, res) => {
  try {
    const { pin } = req.body; // pin texto plano 6-10 dígitos
    if (!pin || !/^\d{4,10}$/.test(pin)) {
      return res.status(400).json({ success: false, message: 'PIN inválido (4-10 dígitos numéricos)' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Solo admin' });
    const salt = await bcrypt.genSalt(10);
    user.adminPinHash = await bcrypt.hash(pin, salt);
    user.adminPinEnabled = true;
    // reset intentos/lock
    user.adminPinAttempts = 0;
    user.adminPinLockedUntil = null;
    await user.save();
    res.json({ success: true, message: 'PIN configurado' });
  } catch (err) {
    console.error('Error set-pin:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Verificar PIN después del paso de código (usa tempToken emitido en verify-code)
router.post('/admin/verify-pin', async (req, res) => {
  try {
    const { tempToken, pin } = req.body;
    console.log('🔐 POST /admin/verify-pin');
    console.log('   tempToken:', tempToken ? tempToken.substring(0, 20) + '...' : 'MISSING');
    console.log('   pin:', pin ? `"${pin}"` : 'MISSING');
    console.log('   REQUEST ID:', Math.random().toString(36).substring(7));
    
    if (!tempToken || !pin) return res.status(400).json({ success: false, message: 'Datos incompletos' });
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Token temporal inválido o expirado' });
    }
    if (!decoded.pendingAdminPin) return res.status(400).json({ success: false, message: 'Estado PIN no pendiente' });
    
    // IMPORTANTE: Leer el usuario SOLO UNA VEZ con fresh read
    const user = await User.findById(decoded.id).lean(false);
    console.log('   🔎 READ FROM DB - adminPinLockedUntil:', user.adminPinLockedUntil);
    
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    if (!(user.role === 'admin' && user.adminPinEnabled && user.adminPinHash)) {
      return res.status(400).json({ success: false, message: 'PIN no requerido' });
    }
    
    // Verificar bloqueo
    const now = new Date();
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 15;
    
    if (user.adminPinLockedUntil && new Date(user.adminPinLockedUntil) > now) {
      const minutesLeft = Math.ceil((new Date(user.adminPinLockedUntil) - now) / 60000);
      console.log(`   🔒 PIN bloqueado por ${minutesLeft} minutos más`);
      return res.status(423).json({
        success: false,
        message: `PIN bloqueado por demasiados intentos. Intenta de nuevo en ${minutesLeft} minutos.`,
        data: { minutesRemaining: minutesLeft }
      });
    }
    
    const ok = await bcrypt.compare(pin, user.adminPinHash);
    console.log(`   bcrypt.compare: ${ok ? '✅ CORRECTO' : '❌ INCORRECTO'}`);
    
    if (!ok) {
      console.log('   ❌ PIN INCORRECTO - Incrementando intentos');
      user.adminPinAttempts = (user.adminPinAttempts || 0) + 1;
      
      if (user.adminPinAttempts >= MAX_ATTEMPTS) {
        user.adminPinLockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60000);
        console.log(`   🔒 PIN BLOQUEADO hasta ${user.adminPinLockedUntil}`);
      }
      
      await user.save();
      return res.status(400).json({ 
        success: false, 
        message: 'PIN incorrecto', 
        data: { 
          attempts: user.adminPinAttempts,
          remainingAttempts: Math.max(0, MAX_ATTEMPTS - user.adminPinAttempts),
          locked: user.adminPinAttempts >= MAX_ATTEMPTS
        } 
      });
    }
    
    // ✅ PIN CORRECTO
    user.adminPinAttempts = 0;
    user.adminPinLockedUntil = null;
    await user.save();
    
    const finalToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    console.log('   ✅ PIN CORRECTO');
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token: finalToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error('Error verify-pin:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Cambiar PIN (requiere token normal admin) -> oldPin + newPin
router.post('/admin/change-pin', protect, async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin) return res.status(400).json({ success: false, message: 'Datos incompletos' });
    if (!/^\d{4,10}$/.test(newPin)) return res.status(400).json({ success: false, message: 'Nuevo PIN inválido (4-10 dígitos)' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Solo admin' });
    if (!(user.adminPinEnabled && user.adminPinHash)) return res.status(400).json({ success: false, message: 'PIN no configurado' });
    const ok = await bcrypt.compare(oldPin, user.adminPinHash);
    if (!ok) return res.status(400).json({ success: false, message: 'PIN actual incorrecto' });
    const salt = await bcrypt.genSalt(10);
    user.adminPinHash = await bcrypt.hash(newPin, salt);
    user.adminPinAttempts = 0;
    user.adminPinLockedUntil = null;
    await user.save();
    res.json({ success: true, message: 'PIN actualizado' });
  } catch (err) {
    console.error('Error change-pin:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Deshabilitar PIN (requiere token normal admin) -> requiere pin
router.post('/admin/disable-pin', protect, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ success: false, message: 'PIN requerido' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Solo admin' });
    if (!(user.adminPinEnabled && user.adminPinHash)) return res.status(400).json({ success: false, message: 'PIN no configurado' });
    const ok = await bcrypt.compare(pin, user.adminPinHash);
    if (!ok) return res.status(400).json({ success: false, message: 'PIN incorrecto' });
    user.adminPinHash = null;
    user.adminPinEnabled = false;
    user.adminPinAttempts = 0;
    user.adminPinLockedUntil = null;
    await user.save();
    res.json({ success: true, message: 'PIN deshabilitado' });
  } catch (err) {
    console.error('Error disable-pin:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});