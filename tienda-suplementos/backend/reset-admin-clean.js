require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function reset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/tienda-suplementos');
    
    const admin = await User.findOne({ email: 'internationalnutritioncol@gmail.com' });
    console.log('ANTES:');
    console.log('  adminPinAttempts:', admin.adminPinAttempts);
    console.log('  adminPinLockedUntil:', admin.adminPinLockedUntil);
    
    // RESETEAR TODO
    admin.adminPinAttempts = 0;
    admin.adminPinLockedUntil = null;
    await admin.save();
    
    console.log('\n✅ LIMPIADO EXITOSAMENTE');
    console.log('DESPUÉS:');
    console.log('  adminPinAttempts:', admin.adminPinAttempts);
    console.log('  adminPinLockedUntil:', admin.adminPinLockedUntil);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

reset();
