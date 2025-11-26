const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/tienda_suplementos';

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });

const ComboSchema = new mongoose.Schema({}, { collection: 'combos', strict: false });
const Combo = mongoose.model('Combo', ComboSchema);

async function fixCategories() {
  try {
    console.log('\n🔍 Verificando categorías en BD...\n');

    // Ver todos los combos y sus categorías actuales
    const allCombos = await Combo.find({}, { name: 1, category: 1, orden: 1 });
    
    console.log(`Total de combos: ${allCombos.length}\n`);
    
    // Agrupar por categoría
    const byCategory = {};
    allCombos.forEach(combo => {
      const cat = combo.category || 'SIN_CATEGORÍA';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(combo);
    });

    console.log('📊 Distribución actual:');
    Object.entries(byCategory).forEach(([cat, combos]) => {
      console.log(`   ${cat}: ${combos.length} combos`);
    });

    // Normalizar categorías
    console.log('\n🔄 Normalizando categorías...\n');

    let actualizados = 0;

    // Actualizar todos los combos con orden 0-21 a "Definición"
    const definicionCombos = await Combo.find({ orden: { $gte: 0, $lte: 21 } });
    for (const combo of definicionCombos) {
      if (combo.category !== 'Definición') {
        await Combo.findByIdAndUpdate(combo._id, { category: 'Definición' });
        actualizados++;
      }
    }

    // Actualizar todos los combos con orden 22+ a "Volumen"
    const volumenCombos = await Combo.find({ orden: { $gte: 22 } });
    for (const combo of volumenCombos) {
      if (combo.category !== 'Volumen') {
        await Combo.findByIdAndUpdate(combo._id, { category: 'Volumen' });
        actualizados++;
      }
    }

    console.log(`✅ ${actualizados} combos normalizados\n`);

    // Verificar nuevamente
    console.log('📊 Distribución después de normalizar:');
    const finalCombos = await Combo.find({}, { category: 1 });
    const finalByCategory = {};
    finalCombos.forEach(combo => {
      const cat = combo.category || 'SIN_CATEGORÍA';
      if (!finalByCategory[cat]) finalByCategory[cat] = [];
      finalByCategory[cat].push(combo);
    });

    Object.entries(finalByCategory).forEach(([cat, combos]) => {
      console.log(`   ${cat}: ${combos.length} combos`);
    });

    console.log('\n✅ Normalización completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setTimeout(() => {
  fixCategories();
}, 1500);
