/**
 * Script de migración para asignar tipos por defecto a productos existentes
 * - Todas las proteínas existentes -> Limpia
 * - Todas las creatinas existentes -> Monohidrato
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function migrateProductTypes() {
  try {
    console.log('🔄 Iniciando migración de tipos de productos...\n');

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda-suplementos');
    console.log('✅ Conectado a MongoDB\n');

    // Actualizar proteínas sin tipo a "Limpia"
    const proteinasResult = await Product.updateMany(
      { 
        category: 'Proteínas',
        $or: [
          { tipo: { $exists: false } },
          { tipo: '' },
          { tipo: null }
        ]
      },
      { $set: { tipo: 'Limpia' } }
    );

    console.log(`🥤 Proteínas actualizadas: ${proteinasResult.modifiedCount}`);

    // Actualizar creatinas sin tipo a "Monohidrato"
    const creatinasResult = await Product.updateMany(
      { 
        category: 'Creatina',
        $or: [
          { tipo: { $exists: false } },
          { tipo: '' },
          { tipo: null }
        ]
      },
      { $set: { tipo: 'Monohidrato' } }
    );

    console.log(`⚡ Creatinas actualizadas: ${creatinasResult.modifiedCount}`);

    // Mostrar resumen de productos por tipo
    console.log('\n📊 Resumen de productos por tipo:\n');

    const proteinasPorTipo = await Product.aggregate([
      { $match: { category: 'Proteínas' } },
      { $group: { _id: '$tipo', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('Proteínas:');
    proteinasPorTipo.forEach(item => {
      console.log(`  - ${item._id || 'Sin tipo'}: ${item.count}`);
    });

    const creatinasPorTipo = await Product.aggregate([
      { $match: { category: 'Creatina' } },
      { $group: { _id: '$tipo', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nCreatinas:');
    creatinasPorTipo.forEach(item => {
      console.log(`  - ${item._id || 'Sin tipo'}: ${item.count}`);
    });

    console.log('\n✅ Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar migración
migrateProductTypes();
