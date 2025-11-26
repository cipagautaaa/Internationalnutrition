require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function unlockAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a Atlas');
    
    // Cambiar adminPinLockedUntil a una fecha en el pasado
    const pastDate = new Date(Date.now() - 20 * 60 * 1000); // 20 minutos atrás
    
    const result = await User.updateOne(
      { email: 'admin@supps.com' },
      { 
        $set: { 
          adminPinAttempts: 0, 
          adminPinLockedUntil: pastDate  // Fecha en el pasado = ya expiró
        } 
      }
    );
    
    console.log('✅ Update result:', result);
    
    // Leer de nuevo
    const admin = await User.findOne({ email: 'admin@supps.com' });
    const now = new Date();
    const isLocked = admin.adminPinLockedUntil && new Date(admin.adminPinLockedUntil) > now;
    
    console.log('\n📊 Admin después de desbloquear:');
    console.log('   adminPinLockedUntil:', admin.adminPinLockedUntil);
    console.log('   ¿Está bloqueado ahora?:', isLocked ? '🔒 SÍ' : '🔓 NO');
    console.log('   adminPinAttempts:', admin.adminPinAttempts);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

unlockAdmin();
