require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/tienda_suplementos');

mongoose.connection.on('connected', async () => {
  try {
    console.log('📌 Creando admin...');
    
    const adminPin = '9999';
    const pinHash = await bcrypt.hash(adminPin, 10);
    
    const newAdmin = new User({
      email: 'admin@supps.com',
      firstName: 'Admin',
      lastName: 'System',
      password: await bcrypt.hash('123456', 10),
      role: 'admin',
      adminPinEnabled: true,
      adminPinHash: pinHash,
      adminPinAttempts: 0,
      adminPinLockedUntil: null,
      isVerified: true
    });
    
    await newAdmin.save();
    console.log('✅ Admin creado exitosamente');
    console.log('   Email: admin@supps.com');
    console.log('   PIN: 9999');
    console.log('   Hash: ' + pinHash.substring(0, 30) + '...');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
});

setTimeout(() => {
  console.error('❌ Timeout - No se pudo conectar a MongoDB');
  process.exit(1);
}, 10000);
