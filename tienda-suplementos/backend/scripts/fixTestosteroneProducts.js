const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

async function updateProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const result = await Product.updateMany(
      { 
        name: { $in: ['NOVA BOOST', 'MONSTER TEST'] },
        category: 'Salud y Bienestar'
      },
      { 
        $set: { tipo: 'Precursores de testosterona' }
      }
    );

    console.log(`✅ Productos actualizados: ${result.modifiedCount}`);
    
    // Verificar los cambios
    const products = await Product.find({ 
      name: { $in: ['NOVA BOOST', 'MONSTER TEST'] }
    }, 'name tipo');
    
    console.log('\nProductos verificados:');
    products.forEach(p => console.log(`  ${p.name} → ${p.tipo}`));

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateProducts();
