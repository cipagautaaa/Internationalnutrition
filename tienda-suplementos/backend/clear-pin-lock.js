require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function clearLock() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_suplementos');
    
    const user = await User.findOneAndUpdate(
      { email: 'internationalnutritioncol@gmail.com' },
      { 
        $set: { 
          adminPinAttempts: 0,
          adminPinLockedUntil: null 
        }
      },
      { new: true }
    );
    
    console.log('✅ Bloqueo de PIN eliminado');
    console.log('   Attempts:', user.adminPinAttempts);
    console.log('   Locked Until:', user.adminPinLockedUntil);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearLock();
