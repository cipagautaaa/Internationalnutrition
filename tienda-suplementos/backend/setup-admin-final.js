#!/usr/bin/env node

// Script para configurar el admin correctamente
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function setupAdmin() {
  try {
    console.log('📌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_suplementos');
    console.log('✅ Conectado a MongoDB');

    // Buscar y actualizar el admin
    console.log('\n🔍 Actualizando usuario admin@supps.com...');
    
    const hashedPin = await bcrypt.hash('1234', 10);
    
    const result = await User.findOneAndUpdate(
      { email: 'admin@supps.com' },
      {
        $set: {
          role: 'admin',
          adminPinEnabled: true,
          adminPinHash: hashedPin,
          adminPinAttempts: 0,
          adminPinLockedUntil: null,
          isEmailVerified: true
        }
      },
      { new: true, upsert: false }
    );

    if (result) {
      console.log('✅ Admin actualizado correctamente');
      console.log('\n📋 Detalles:');
      console.log('   Email:', result.email);
      console.log('   Role:', result.role);
      console.log('   PIN Enabled:', result.adminPinEnabled);
      console.log('   Email Verified:', result.isEmailVerified);
      console.log('   PIN (para pruebas): 1234');
    } else {
      console.log('❌ No se encontró el usuario');
    }

    console.log('\n✨ Listo para probar!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
