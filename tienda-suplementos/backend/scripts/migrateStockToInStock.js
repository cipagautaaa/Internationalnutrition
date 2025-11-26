const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function migrateStockToInStock() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Actualizar todos los productos: inStock = true si stock > 0, false si stock === 0
    const result = await Product.updateMany(
      {},
      [
        {
          $set: {
            inStock: { $cond: { if: { $gt: ["$stock", 0] }, then: true, else: false } }
          }
        }
      ]
    );

    console.log(`✅ Migración completada: ${result.modifiedCount} productos actualizados`);
    
    // Mostrar algunos ejemplos
    const samples = await Product.find({}).limit(5).select('name stock inStock');
    console.log('\n📦 Ejemplos de productos actualizados:');
    samples.forEach(p => {
      console.log(`  - ${p.name}: stock=${p.stock} → inStock=${p.inStock}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrateStockToInStock();
