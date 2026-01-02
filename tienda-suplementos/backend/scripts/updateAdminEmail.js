#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const get = (key) => {
    const idx = args.indexOf(key);
    if (idx === -1) return null;
    return args[idx + 1] || null;
  };
  return {
    oldEmail: get('--old') || process.env.ADMIN_OLD_EMAIL || null,
    newEmail: get('--new') || process.env.ADMIN_NEW_EMAIL || null
  };
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

async function run() {
  try {
    const { oldEmail, newEmail } = parseArgs();
    if (!oldEmail || !newEmail) {
      console.log('Uso: node scripts/updateAdminEmail.js --old <correo_antiguo> --new <correo_nuevo>');
      console.log('También puedes usar env vars: ADMIN_OLD_EMAIL y ADMIN_NEW_EMAIL');
      process.exit(1);
    }

    const OLD_EMAIL = normalizeEmail(oldEmail);
    const NEW_EMAIL = normalizeEmail(newEmail);
    if (!OLD_EMAIL || !NEW_EMAIL) {
      console.log('❌ Emails inválidos. Revisa --old/--new');
      process.exit(1);
    }
    if (OLD_EMAIL === NEW_EMAIL) {
      console.log('ℹ️ El correo antiguo y el nuevo son iguales. No hay nada que cambiar.');
      process.exit(0);
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_suplementos';
    console.log('📌 Conectando a MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Conectado');

    const existingNew = await User.findOne({ email: NEW_EMAIL });
    if (existingNew) {
      console.log('❌ Ya existe un usuario con el correo de destino. No se hará el cambio.');
      console.log('   newEmail:', NEW_EMAIL);
      console.log('   existingUserId:', existingNew._id.toString());
      return process.exit(0);
    }

    const existingOld = await User.findOne({ email: OLD_EMAIL });
    if (!existingOld) {
      console.log('❌ No se encontró un usuario con el correo de origen.');
      console.log('   oldEmail:', OLD_EMAIL);
      return process.exit(0);
    }

    const updated = await User.findOneAndUpdate(
      { email: OLD_EMAIL },
      { $set: { email: NEW_EMAIL } },
      { new: true, runValidators: true }
    );

    if (updated) {
      console.log('✅ Correo actualizado correctamente.');
      console.log('   userId:', updated._id.toString());
      console.log('   oldEmail:', OLD_EMAIL);
      console.log('   newEmail:', updated.email);
      console.log('   role:', updated.role);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error actualizando correo:', err.message);
    process.exit(1);
  }
}

run();
