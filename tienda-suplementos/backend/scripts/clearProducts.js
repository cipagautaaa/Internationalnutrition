// scripts/clearProducts.js
// Elimina todos los documentos de la colección products.
// Uso: npm run db:clear:products

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
// Intentar cargar .env.production si no hay URI
if (!process.env.MONGODB_URI) {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.production') });
}

const mongoose = require('mongoose');
const Product = require('../models/Product');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI no definido en .env/.env.production');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');
    const count = await Product.countDocuments();
    console.log(`📦 Productos antes de borrar: ${count}`);
    const res = await Product.deleteMany({});
    console.log(`🗑️  Eliminados: ${res.deletedCount}`);
    const after = await Product.countDocuments();
    console.log(`📉 Productos después: ${after}`);
    console.log('✔️ Colección products vaciada.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error limpiando productos:', err.message);
    process.exit(1);
  }
}

main();
