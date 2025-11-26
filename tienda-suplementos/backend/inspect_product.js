require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function inspectOneProduct() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Tomar el primer producto para ver su estructura completa
    const product = await Product.findOne({});
    
    if (product) {
      console.log('\n=== ESTRUCTURA COMPLETA DE UN PRODUCTO ===');
      console.log(JSON.stringify(product, null, 2));
    } else {
      console.log('No se encontraron productos');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

inspectOneProduct();