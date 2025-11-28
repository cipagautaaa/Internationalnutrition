require('dotenv').config();
const mongoose = require('mongoose');

async function checkAtlas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a Atlas');
    
    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    console.log('\n=== BUSCANDO TODOS LOS USUARIOS ===');
    const allUsers = await users.find({}).toArray();
    console.log('Total de usuarios:', allUsers.length);
    
    allUsers.forEach((u, i) => {
      console.log(`\nUsuario ${i+1}:`);
      console.log('  _id:', u._id);
      console.log('  email:', u.email);
      console.log('  role:', u.role);
      console.log('  adminPinEnabled:', u.adminPinEnabled);
      console.log('  adminPinHash:', u.adminPinHash ? u.adminPinHash.substring(0, 40) + '...' : 'NO');
      console.log('  adminPinAttempts:', u.adminPinAttempts);
      console.log('  adminPinLockedUntil:', u.adminPinLockedUntil);
    });
    
    console.log('\n=== BUSCANDO ADMIN ESPECÍFICAMENTE ===');
    const admin = await users.findOne({ email: 'internationalnutritioncol@gmail.com' });
    if (admin) {
      console.log('✅ Admin encontrado');
      console.log('  _id:', admin._id);
      console.log('  adminPinHash:', admin.adminPinHash);
    } else {
      console.log('❌ Admin NO encontrado');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

checkAtlas();
