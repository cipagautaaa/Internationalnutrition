const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const User = require('./models/User');

async function regeneratePinHash() {
  try {
    console.log('🔄 Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    const pin = '9999';
    console.log(`\n📌 Regenerando hash para PIN: ${pin}`);

    // Generar nuevo hash
    const saltRounds = 10;
    const newHash = await bcrypt.hash(pin, saltRounds);
    console.log(`✅ Nuevo hash generado: ${newHash}`);

    // Actualizar en base de datos
    const user = await User.findOne({ email: 'internationalnutritioncol@gmail.com' });
    if (!user) {
      console.log('❌ Admin no encontrado');
      return;
    }

    console.log(`\n👤 Admin encontrado: ${user.email}`);
    console.log(`   Hash anterior: ${user.adminPinHash}`);

    user.adminPinHash = newHash;
    user.adminPinEnabled = true;
    user.adminPinAttempts = 0;
    user.adminPinLockedUntil = null;
    await user.save();

    console.log(`\n✅ Hash actualizado en MongoDB`);
    console.log(`   Nuevo hash: ${user.adminPinHash}`);

    // Verificar que funciona
    const verify = await bcrypt.compare(pin, user.adminPinHash);
    console.log(`\n🔐 Verificación bcrypt.compare('${pin}', hash): ${verify}`);

    console.log('\n✅ ¡PIN regenerado exitosamente!');
    console.log('   Email: internationalnutritioncol@gmail.com');
    console.log(`   PIN: ${pin}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

regeneratePinHash();
