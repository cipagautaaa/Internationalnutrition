#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const OLD_EMAIL = 'internationalnutritioncol@gmail.com';
const NEW_EMAIL = 'admin@supps.com';

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_suplementos';
    console.log('📌 Conectando a MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Conectado');

    const admin = await User.findOne({ email: NEW_EMAIL });
    if (admin) {
      console.log('ℹ️ Ya existe un usuario con el nuevo correo.');
      console.log('   ID:', admin._id.toString());
      return process.exit(0);
    }

    const updated = await User.findOneAndUpdate(
      { email: OLD_EMAIL },
      { $set: { email: NEW_EMAIL } },
      { new: true }
    );

    if (!updated) {
      console.log('❌ No se encontró el usuario con el correo antiguo.');
    } else {
      console.log('✅ Correo actualizado correctamente.');
      console.log('   Nuevo correo:', updated.email);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error actualizando correo:', err.message);
    process.exit(1);
  }
}

run();
