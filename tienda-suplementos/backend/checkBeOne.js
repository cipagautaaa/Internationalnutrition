const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkBeOneVariants() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB\n');

    // Buscar todos los productos Be One
    const beOneProducts = await Product.find({
      name: { $regex: /be one/i }
    }).sort({ size: 1 });

    console.log(`=== Productos "Be One" encontrados: ${beOneProducts.length} ===\n`);

    beOneProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Tamaño: ${product.size}`);
      console.log(`   Precio: $${product.price}`);
      console.log(`   Categoría: ${product.category}`);
      console.log(`   Tipo: ${product.tipo || 'N/A'}`);
      console.log(`   FamilyID: ${product.familyId}`);
      console.log(`   isPrimary: ${product.isPrimary}`);
      console.log(`   variantOf: ${product.variantOf || 'N/A'}`);
      console.log(`   isActive: ${product.isActive}`);
      console.log(`   inStock: ${product.inStock}`);
      console.log('');
    });

    // Agrupar por familyId
    const families = {};
    beOneProducts.forEach(product => {
      const fid = product.familyId || product._id.toString();
      if (!families[fid]) {
        families[fid] = [];
      }
      families[fid].push(product);
    });

    console.log(`=== Familias de productos Be One: ${Object.keys(families).length} ===\n`);
    Object.entries(families).forEach(([familyId, products]) => {
      console.log(`Familia ${familyId}:`);
      products.forEach(p => {
        console.log(`  - ${p.name} (${p.size}) - isPrimary: ${p.isPrimary}, isActive: ${p.isActive}`);
      });
      console.log('');
    });

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBeOneVariants();
