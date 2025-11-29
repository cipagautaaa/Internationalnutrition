// backend/seedUsers.js
// Script para poblar la base de datos con usuarios de ejemplo

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const users = [
  {
    email: 'admin@supps.com',
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

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB');

    await User.deleteMany();
    await User.insertMany(users);
    console.log('Usuarios insertados correctamente');
    process.exit();
  } catch (error) {
    console.error('Error al poblar usuarios:', error);
    process.exit(1);
  }
}

seedUsers();
