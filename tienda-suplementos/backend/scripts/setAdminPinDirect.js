// scripts/setAdminPinDirect.js
// Configura directamente el PIN del admin en la base de datos sin usar la API.
// Útil cuando hay problemas de autenticación para llamar /admin/set-pin.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Conexión a la misma base que usa docker-compose (expuesta en localhost)
const MONGO_URI = 'mongodb://localhost:27017/tienda_prod';
const PIN = process.env.ADMIN_PIN_DIRECT || '836492'; // permite override

(async () => {
  try {
    await mongoose.connect(MONGO_URI, {});
    const admin = await User.findOne({ email: 'admin@supps.com' });
    if (!admin) {
      console.error('Admin no encontrado');
      process.exit(1);
    }
    const salt = await bcrypt.genSalt(10);
    admin.adminPinHash = await bcrypt.hash(PIN, salt);
    admin.adminPinEnabled = true;
    admin.adminPinAttempts = 0;
    admin.adminPinLockedUntil = null;
    await admin.save();
    console.log('PIN admin configurado directamente. PIN =', PIN);
    process.exit(0);
  } catch (e) {
    console.error('Error configurando PIN:', e);
    process.exit(1);
  }
})();
