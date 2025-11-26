require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find().select('email isEmailVerified role');
    
    console.log('📋 Usuarios en BD:', users);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

listUsers();
