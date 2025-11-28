require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function cleanAdminPin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a Atlas');
    
    const result = await User.updateOne(
      { email: 'internationalnutritioncol@gmail.com' },
      { 
        $set: { 
          adminPinAttempts: 0, 
          adminPinLockedUntil: null 
        } 
      }
    );
    
    console.log('✅ Actualización result:', result);
    
    const admin = await User.findOne({ email: 'internationalnutritioncol@gmail.com' });
    console.log('\n📊 Admin después de limpiar:');
    console.log('   email:', admin.email);
    console.log('   role:', admin.role);
    console.log('   adminPinEnabled:', admin.adminPinEnabled);
    console.log('   adminPinAttempts:', admin.adminPinAttempts);
    console.log('   adminPinLockedUntil:', admin.adminPinLockedUntil);
    console.log('   adminPinHash exists:', !!admin.adminPinHash);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

cleanAdminPin();
