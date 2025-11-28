// backend/seedUsers.localdocker.js
// Seed users into the local docker MongoDB instance used by docker-compose (mongodb://localhost:27017/tienda_prod)

const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/tienda_prod';

const users = [
  {
    email: 'internationalnutritioncol@gmail.com',
    firstName: 'Admin',
    lastName: 'Supps',
    phone: '1234567890',
    isEmailVerified: true,
    role: 'admin',
    addresses: [
      {
        street: 'Calle 1',
        city: 'Ciudad',
        state: 'Provincia',
        zipCode: '1000',
        country: 'País',
        isDefault: true
      }
    ]
  },
  {
    email: 'cliente@supps.com',
    firstName: 'Cliente',
    lastName: 'Ejemplo',
    phone: '0987654321',
    isEmailVerified: true,
    role: 'user',
    addresses: [
      {
        street: 'Calle 2',
        city: 'Ciudad',
        state: 'Provincia',
        zipCode: '2000',
        country: 'País',
        isDefault: true
      }
    ]
  }
];

(async function run() {
  try {
    await mongoose.connect(MONGO_URI, {});
    console.log('Conectado a MongoDB local docker:', MONGO_URI);
    await User.deleteMany();
    await User.insertMany(users);
    console.log('Usuarios insertados correctamente en docker mongo');
    process.exit(0);
  } catch (err) {
    console.error('Error seedUsers.localdocker:', err);
    process.exit(1);
  }
})();
