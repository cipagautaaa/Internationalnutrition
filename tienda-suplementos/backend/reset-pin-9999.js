require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function resetPin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_suplementos');
    
    const newPin = '9999';
    const hash = await bcrypt.hash(newPin, 10);
    
    const user = await User.findOneAndUpdate(
      { email: 'admin@supps.com' },
      { 
        $set: { 
          adminPinHash: hash,
          adminPinAttempts: 0,
          adminPinLockedUntil: null 
        }
      },
      { new: true }
    );
    
    console.log('✅ PIN reseteado exitosamente');
    console.log('   Email:', user.email);
    console.log('   PIN (pruebas):', newPin);
    console.log('   Hash:', user.adminPinHash.substring(0, 20) + '...');
    console.log('   Attempts:', user.adminPinAttempts);
    console.log('   Locked Until:', user.adminPinLockedUntil);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPin();
