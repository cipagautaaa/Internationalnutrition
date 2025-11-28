const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/tienda_suplementos');

mongoose.connection.on('connected', async () => {
  const user = await User.findOne({email: 'internationalnutritioncol@gmail.com'});
  console.log('Hash:', user.adminPinHash);
  console.log('Hash length:', user.adminPinHash.length);
  
  const pin = '9999';
  console.log('Testing PIN:', pin);
  
  const result = await bcrypt.compare(pin, user.adminPinHash);
  console.log('bcrypt.compare result:', result);
  
  if (!result) {
    console.log('❌ PIN NO COINCIDE - Algo está mal con el hash!');
  } else {
    console.log('✅ PIN COINCIDE - Todo bien!');
  }
  
  process.exit(0);
});

setTimeout(() => {
  console.error('Timeout');
  process.exit(1);
}, 5000);
