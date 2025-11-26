require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function migratePreworkoutCategory() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    const mongoOptions = {};
    if (process.env.MONGODB_DB_NAME) {
      mongoOptions.dbName = process.env.MONGODB_DB_NAME;
    }

    await mongoose.connect(mongoUri, mongoOptions);
    console.log('✅ Conectado a MongoDB');

    // Buscar productos con categoría "Pre-entrenos y Energía"
    const productsToUpdate = await Product.find({ 
      category: { $regex: /pre.*entreno.*energ/i } 
    });

    console.log(`\n📊 Productos encontrados con "Pre-entrenos y Energía": ${productsToUpdate.length}`);

    if (productsToUpdate.length === 0) {
      console.log('ℹ️  No hay productos para migrar');
      await mongoose.disconnect();
      return;
    }

    // Mostrar productos que se van a actualizar
    console.log('\n📝 Productos a actualizar:');
    productsToUpdate.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name} (${p.category})`);
    });

    // Actualizar productos
    const result = await Product.updateMany(
      { category: { $regex: /pre.*entreno.*energ/i } },
      { $set: { category: 'Pre-entrenos y Quemadores' } }
    );

    console.log(`\n✅ Actualización completada:`);
    console.log(`   - Documentos coincidentes: ${result.matchedCount}`);
    console.log(`   - Documentos modificados: ${result.modifiedCount}`);

    // Verificar la actualización
    const verifyCount = await Product.countDocuments({ category: 'Pre-entrenos y Quemadores' });
    console.log(`\n🔍 Verificación: ${verifyCount} productos ahora tienen la categoría "Pre-entrenos y Quemadores"`);

    // Mostrar algunos productos actualizados
    const updatedSamples = await Product.find({ category: 'Pre-entrenos y Quemadores' }).limit(5);
    console.log('\n📋 Ejemplos de productos actualizados:');
    updatedSamples.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name} → ${p.category}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar migración
console.log('🚀 Iniciando migración de categoría Pre-entrenos...\n');
migratePreworkoutCategory();
