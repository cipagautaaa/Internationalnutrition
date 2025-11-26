#!/usr/bin/env node

// Script para verificar el PIN del admin
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function verifyPin() {
  try {
    console.log('📌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_suplementos');
    console.log('✅ Conectado a MongoDB');

    const user = await User.findOne({ email: 'admin@supps.com' });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    console.log('\n📋 Usuario encontrado:');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   PIN Enabled:', user.adminPinEnabled);
    console.log('   PIN Hash:', user.adminPinHash ? user.adminPinHash.substring(0, 20) + '...' : 'NO TIENE');
    console.log('   PIN Attempts:', user.adminPinAttempts);
    console.log('   PIN Locked Until:', user.adminPinLockedUntil);

    // Probar bcrypt.compare
    console.log('\n🔐 Probando bcrypt.compare con PIN "1234"...');
    
    if (!user.adminPinHash) {
      console.log('❌ No hay hash de PIN en la BD');
      process.exit(1);
    }

    const isMatch = await bcrypt.compare('1234', user.adminPinHash);
    console.log('   Resultado:', isMatch ? '✅ COINCIDE' : '❌ NO COINCIDE');

    if (!isMatch) {
      console.log('\n⚠️  El PIN "1234" NO coincide con el hash en la BD');
      console.log('   Voy a crear un nuevo hash y actualizar...');
      
      const newHash = await bcrypt.hash('1234', 10);
      user.adminPinHash = newHash;
      user.adminPinAttempts = 0;
      user.adminPinLockedUntil = null;
      await user.save();
      
      console.log('✅ PIN actualizado exitosamente');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyPin();
