const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function findMissingVariants() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB\n');

    // Buscar productos Be One con familyId específico
    const familyId = '69139bbc07ebc33e9fa922f5';
    
    console.log(`Buscando productos con familyId: ${familyId}\n`);
    
    const familyProducts = await Product.find({
      familyId: familyId
    });

    console.log(`=== Productos encontrados en la familia: ${familyProducts.length} ===\n`);
    
    familyProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Tamaño: ${product.size}`);
      console.log(`   isActive: ${product.isActive}`);
      console.log(`   isPrimary: ${product.isPrimary}`);
      console.log(`   variantOf: ${product.variantOf || 'N/A'}`);
      console.log('');
    });

    // Buscar TODOS los productos sin importar isActive
    console.log('\n=== Buscando todas las proteínas "Be One" (incluyendo inactivas) ===\n');
    
    const allBeOne = await Product.find({
      name: { $regex: /be one/i },
      category: 'Proteínas'
    }).sort({ size: 1 });

    console.log(`Total encontrados: ${allBeOne.length}\n`);
    
    allBeOne.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.size}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   FamilyID: ${product.familyId}`);
      console.log(`   isActive: ${product.isActive}`);
      console.log(`   isPrimary: ${product.isPrimary}`);
      console.log('');
    });

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findMissingVariants();
