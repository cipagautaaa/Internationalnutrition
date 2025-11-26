require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function assignPreworkoutTypes() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    const mongoOptions = {};
    if (process.env.MONGODB_DB_NAME) {
      mongoOptions.dbName = process.env.MONGODB_DB_NAME;
    }

    await mongoose.connect(mongoUri, mongoOptions);
    console.log('✅ Conectado a MongoDB');

    // Palabras clave para identificar quemadores
    const burnerKeywords = [
      'burner', 'lipo', 'reductions', 'hydroxicut', 'smart burner',
      'lipocore', 'lipodrene', 'turn on fire', 'fire'
    ];

    // Obtener todos los productos de Pre-entrenos y Quemadores
    const products = await Product.find({ category: 'Pre-entrenos y Quemadores' });
    console.log(`\n📊 Total de productos en "Pre-entrenos y Quemadores": ${products.length}`);

    let preEntrenoCount = 0;
    let quemadorCount = 0;

    for (const product of products) {
      const nameLower = product.name.toLowerCase();
      const descLower = (product.description || '').toLowerCase();
      
      // Determinar si es quemador basándose en palabras clave
      const isQuemador = burnerKeywords.some(keyword => 
        nameLower.includes(keyword) || descLower.includes(keyword)
      );

      const newType = isQuemador ? 'Quemador' : 'Pre-entreno';
      
      if (product.tipo !== newType) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { tipo: newType } }
        );
        console.log(`  ✓ ${product.name} → ${newType}`);
        
        if (isQuemador) quemadorCount++;
        else preEntrenoCount++;
      }
    }

    console.log(`\n✅ Tipos asignados:`);
    console.log(`   - Pre-entreno: ${preEntrenoCount} productos`);
    console.log(`   - Quemador: ${quemadorCount} productos`);

    // Verificar distribución final
    const preEntrenoTotal = await Product.countDocuments({ 
      category: 'Pre-entrenos y Quemadores',
      tipo: 'Pre-entreno'
    });
    const quemadorTotal = await Product.countDocuments({ 
      category: 'Pre-entrenos y Quemadores',
      tipo: 'Quemador'
    });

    console.log(`\n🔍 Verificación final:`);
    console.log(`   - Pre-entreno: ${preEntrenoTotal} productos`);
    console.log(`   - Quemador: ${quemadorTotal} productos`);

    // Mostrar ejemplos
    console.log('\n📋 Ejemplos de Pre-entrenos:');
    const preEntrenoSamples = await Product.find({ 
      category: 'Pre-entrenos y Quemadores',
      tipo: 'Pre-entreno'
    }).limit(5);
    preEntrenoSamples.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name}`);
    });

    console.log('\n📋 Ejemplos de Quemadores:');
    const quemadorSamples = await Product.find({ 
      category: 'Pre-entrenos y Quemadores',
      tipo: 'Quemador'
    }).limit(5);
    quemadorSamples.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Asignación de tipos completada exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la asignación de tipos:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar
console.log('🚀 Iniciando asignación de tipos Pre-entreno/Quemador...\n');
assignPreworkoutTypes();
