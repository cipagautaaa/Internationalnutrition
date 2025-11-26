require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function getProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find();
    console.log('Productos en DB:');
    products.forEach((p, index) => {
      console.log(`${index + 1}: ${p.name} -> ${p._id}`);
    });
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getProducts();