require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    const products = await Product.find({});
    console.log(`\nEncontrados ${products.length} productos (mostrando primeros 3):`);
    console.log('================================');
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. PRODUCTO: ${product.name}`);
      console.log('================================');
      console.log(JSON.stringify(product.toObject(), null, 2));
      console.log('================================');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProducts();