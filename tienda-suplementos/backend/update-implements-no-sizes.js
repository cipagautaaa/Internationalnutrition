/**
 * Script para actualizar productos Wargo existentes que no deberían tener tallas
 * Ejecutar con: node update-implements-no-sizes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Implement = require('./models/Implement');

// Lista de productos que NO deben tener tallas (búsqueda parcial case-insensitive)
const PRODUCTS_WITHOUT_SIZES = [
  'termo',
  'colchon',
  'colchón',
  'straps de cuero',
  'straps con gancho',
  'kit de bandas para trabajo de gluteo',
  'kit de bandas para trabajo de glúteo',
  'palanca para cinturón',
  'palanca para cinturon',
  'straps para tobillo',
  'coderas de venda',
  'rodilleras de venda',
  'straps en infinito',
  'straps con muñequera',
  'straps con munequera',
  'straps clásicos',
  'straps clasicos',
  'lazo',
  'gym shaker',
  'shaker',
  'cinturón de lastre',
  'cinturon de lastre',
  'kit de bandas de poder',
  'muñequeras',
  'munequeras',
  'lifting pads'
];

async function updateImplementsWithoutSizes() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('No se encontró MONGODB_URI en las variables de entorno');
    }

    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener todos los implements
    const allImplements = await Implement.find({});
    console.log(`📦 Total de productos Wargo encontrados: ${allImplements.length}\n`);

    let updatedCount = 0;
    const updatedProducts = [];

    for (const implement of allImplements) {
      const nameLower = implement.name.toLowerCase();
      
      // Verificar si el nombre del producto coincide con alguno de la lista
      const shouldRemoveSizes = PRODUCTS_WITHOUT_SIZES.some(keyword => 
        nameLower.includes(keyword.toLowerCase())
      );

      if (shouldRemoveSizes) {
        // Actualizar el producto
        implement.hasSizes = false;
        implement.sizes = [];
        implement.size = '';
        await implement.save();
        
        updatedCount++;
        updatedProducts.push(implement.name);
        console.log(`✅ Actualizado: "${implement.name}" → hasSizes: false`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Proceso completado!`);
    console.log(`📊 Productos actualizados: ${updatedCount} de ${allImplements.length}`);
    
    if (updatedProducts.length > 0) {
      console.log('\n📋 Lista de productos actualizados:');
      updatedProducts.forEach((name, index) => {
        console.log(`   ${index + 1}. ${name}`);
      });
    }

    // Listar productos que AÚN tienen tallas (para verificación)
    const productsWithSizes = await Implement.find({ hasSizes: { $ne: false } });
    if (productsWithSizes.length > 0) {
      console.log('\n📏 Productos que MANTIENEN tallas:');
      productsWithSizes.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} → Tallas: ${item.sizes?.join(', ') || 'ninguna definida'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

updateImplementsWithoutSizes();
