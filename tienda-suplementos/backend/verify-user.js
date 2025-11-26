require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const verifyUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'juanpaba14@gmail.com';
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }
    
    console.log('📦 Usuario actual:', {
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      role: user.role
    });
    
    // Marcar como verificado
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    console.log('✅ Usuario marcado como verificado:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyUser();
