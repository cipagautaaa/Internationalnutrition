require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    const users = await User.find({}).select('email role isEmailVerified adminPinEnabled');
    console.log('\nUsuarios encontrados (' + users.length + '):');
    users.forEach(u => {
      console.log('- ' + u.email + ' | role=' + u.role + ' | verificado=' + u.isEmailVerified + ' | pinEnabled=' + u.adminPinEnabled);
    });
    process.exit(0);
  } catch (e) {
    console.error('Error listUsers:', e.message);
    process.exit(1);
  }
})();
