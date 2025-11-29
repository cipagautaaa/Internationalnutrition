require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a Atlas\n');
    
    const admin = await User.findOne({ email: 'admin@supps.com' });
    
    if (!admin) {
      console.log('❌ No existe admin con ese email');
      process.exit(1);
    }
    
    console.log('=== 📊 ADMIN EN ATLAS ===');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('adminPinEnabled:', admin.adminPinEnabled);
    console.log('adminPinHash exists:', !!admin.adminPinHash);
    console.log('adminPinHash (primeros 50 chars):', admin.adminPinHash.substring(0, 50) + '...');
    console.log('adminPinAttempts:', admin.adminPinAttempts);
    console.log('adminPinLockedUntil:', admin.adminPinLockedUntil);
    console.log('');
    
    // Check if locked
    const now = new Date();
    const isLocked = admin.adminPinLockedUntil && new Date(admin.adminPinLockedUntil) > now;
    console.log('=== 🔒 ESTADO DE BLOQUEO ===');
    console.log('¿Está bloqueado?:', isLocked ? '🔒 SÍ - Locked until: ' + admin.adminPinLockedUntil : '🔓 NO');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

checkAdmin();
