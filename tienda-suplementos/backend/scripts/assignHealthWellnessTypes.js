const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda-suplementos';

// Keywords para identificar cada tipo de producto
const testosteroneKeywords = [
  'testosterona', 'testosterone', 'precursor', 'tribulus', 'maca', 
  'zma', 'tribulu', 'booster', 'testo'
];

const multivitaminKeywords = [
  'multivitaminico', 'multivitamin', 'vitamina', 'vitamin', 
  'multi', 'complejo vitaminico', 'vitamin complex'
];

// Función para verificar si el texto contiene keywords
function containsKeywords(text, keywords) {
  const lowerText = (text || '').toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return keywords.some(kw => lowerText.includes(kw.toLowerCase()));
}

async function assignHealthWellnessTypes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar productos de Salud y Bienestar sin tipo asignado
    const products = await Product.find({ 
      category: 'Salud y Bienestar',
      $or: [{ tipo: { $exists: false } }, { tipo: '' }, { tipo: null }]
    });

    console.log(`\n📦 Productos encontrados: ${products.length}`);

    let testosteroneCount = 0;
    let multivitaminCount = 0;
    let healthSupplementCount = 0;

    const updates = [];

    for (const product of products) {
      const searchText = `${product.name || ''} ${product.description || ''}`;
      let tipo = '';

      // Determinar tipo basado en keywords
      if (containsKeywords(searchText, testosteroneKeywords)) {
        tipo = 'Precursores de testosterona';
        testosteroneCount++;
      } else if (containsKeywords(searchText, multivitaminKeywords)) {
        tipo = 'Multivitamínicos';
        multivitaminCount++;
      } else {
        // Default: Suplementos para la salud
        tipo = 'Suplementos para la salud';
        healthSupplementCount++;
      }

      updates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { tipo } }
        }
      });

      console.log(`  ${product.name} → ${tipo}`);
    }

    // Ejecutar actualización en batch
    if (updates.length > 0) {
      const result = await Product.bulkWrite(updates);
      console.log(`\n✅ Tipos asignados:`);
      console.log(`   Precursores de testosterona: ${testosteroneCount} productos`);
      console.log(`   Multivitamínicos: ${multivitaminCount} productos`);
      console.log(`   Suplementos para la salud: ${healthSupplementCount} productos`);
      console.log(`   Total procesado: ${result.modifiedCount} productos`);
    } else {
      console.log('\n⚠️  No hay productos para actualizar');
    }

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

assignHealthWellnessTypes();
