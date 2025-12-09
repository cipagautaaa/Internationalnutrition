require('dotenv').config();
const mongoose = require('mongoose');
const Implement = require('./models/Implement');

async function checkImplements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const impl = await Implement.findOne();
    console.log('📦 Primer accesorio para gym encontrado:');
    console.log(JSON.stringify(impl, null, 2));
    
    const allImpls = await Implement.find().select('name sizes originalPrice');
    console.log('\n📊 Resumen de Wargo y accesorios para gym:');
    allImpls.forEach((i, idx) => {
      console.log(`  ${idx + 1}. ${i.name} - Tallas: ${i.sizes?.length || 0}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkImplements();
