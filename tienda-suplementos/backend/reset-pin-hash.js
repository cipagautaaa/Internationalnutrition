require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function resetPinHash() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a Atlas');
    
    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    const PIN = '9999';
    const newHash = await bcrypt.hash(PIN, 10);
    
    console.log('\n=== REGENERANDO PIN HASH ===');
    console.log('PIN:', PIN);
    console.log('Nuevo Hash:', newHash);
    
    const result = await users.updateOne(
      { email: 'admin@supps.com' },
      { $set: { adminPinHash: newHash, adminPinAttempts: 0, adminPinLockedUntil: null } }
    );
    
    console.log('\n✅ Actualización result:', result);
    
    // Verificar
    console.log('\n=== VERIFICANDO ===');
    const admin = await users.findOne({ email: 'admin@supps.com' });
    console.log('adminPinHash:', admin.adminPinHash);
    console.log('adminPinAttempts:', admin.adminPinAttempts);
    console.log('adminPinLockedUntil:', admin.adminPinLockedUntil);
    
    // Test bcrypt
    const testResult = await bcrypt.compare(PIN, admin.adminPinHash);
    console.log('\n=== TEST BCRYPT ===');
    console.log(`bcrypt.compare('${PIN}', hash) =`, testResult ? '✅ PASS' : '❌ FAIL');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

resetPinHash();
