#!/usr/bin/env node

// Script para configurar el PIN del administrador
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const adminEmail = 'admin@supps.com';
const adminPin = '1234'; // PIN por defecto para pruebas

async function setupAdminPin() {
  try {
    // Conectar a MongoDB
    console.log('📌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_suplementos');
    console.log('✅ Conectado a MongoDB');

    // Buscar al admin
    console.log(`\n🔍 Buscando admin: ${adminEmail}`);
    let user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log('❌ Admin no encontrado. Intentando buscar por role...');
      user = await User.findOne({ role: 'admin' });
      if (!user) {
        console.log('❌ No hay admin. Creando...');
        user = await User.create({
          email: adminEmail,
          firstName: 'Admin',
          lastName: 'Supps',
          isEmailVerified: true,
          role: 'admin'
        });
        console.log('✅ Admin creado');
      }
    } else {
      console.log('✅ Admin encontrado:', user.email, '| Role:', user.role);
    }

    // Hashear el PIN
    console.log(`\n🔐 Hashando PIN: ${adminPin}`);
    const hashedPin = await bcrypt.hash(adminPin, 10);

    // Actualizar el admin con el PIN
    user.adminPinHash = hashedPin;
    user.adminPinEnabled = true;
    user.adminPinAttempts = 0;
    user.adminPinLockedUntil = null;
    await user.save();

    console.log('✅ PIN configurado exitosamente');
    console.log('\n📋 Admin configurado:');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   PIN Enabled:', user.adminPinEnabled);
    console.log('   PIN (pruebas):', adminPin);

    console.log('\n🎉 Listo para probar el login de admin!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdminPin();
