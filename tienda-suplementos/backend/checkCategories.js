require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    const categories = await Product.distinct('category');
    console.log('📋 Categorías encontradas en la base de datos:');
    console.log('==========================================');
    categories.forEach(cat => console.log('  -', cat));
    
    console.log('\n📊 Conteo de productos por categoría:');
    console.log('==========================================');
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat, isActive: true });
      console.log(`  ${cat}: ${count} productos activos`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCategories();
