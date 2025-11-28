const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/tienda_suplementos');

mongoose.connection.on('connected', async () => {
  try {
    console.log('🔄 Limpiando PIN lock...');
    
    const result = await User.updateOne(
      { email: 'internationalnutritioncol@gmail.com' },
      { 
        $set: { 
          adminPinLockedUntil: null, 
          adminPinAttempts: 0 
        }
      }
    );
    
    console.log('✅ Update result:', result.modifiedCount, 'documents modified');
    
    const user = await User.findOne({ email: 'internationalnutritioncol@gmail.com' });
    console.log('✅ Admin after cleanup:');
    console.log('   adminPinLockedUntil:', user.adminPinLockedUntil);
    console.log('   adminPinAttempts:', user.adminPinAttempts);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
});

setTimeout(() => {
  console.error('❌ Timeout');
  process.exit(1);
}, 5000);
