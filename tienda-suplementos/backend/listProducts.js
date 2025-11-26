#!/usr/bin/env node
/**
 * Script para listar todos los productos
 * Propósito: Ver qué productos existen y cuáles no tienen imagen
 * Uso: node listProducts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function listProducts() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    console.log('📦 PRODUCTOS EN BASE DE DATOS:\n');
    console.log('─'.repeat(100));
    console.log('| ID | NOMBRE | CATEGORÍA | PRECIO | IMAGEN | STOCK |');
    console.log('─'.repeat(100));

    const products = await Product.find({}).select('name category price image inStock');
    
    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos');
      console.log('\nTip: Ejecuta primero: node testCloudinaryProducts.js');
    } else {
      products.forEach((p, index) => {
        const id = p._id.toString().substring(0, 8);
        const name = p.name.substring(0, 30).padEnd(32);
        const category = (p.category || 'N/A').substring(0, 15).padEnd(17);
        const price = String(p.price).padEnd(8);
        const image = p.image ? '✅ SÍ' : '❌ NO';
        const stock = p.inStock ? '✅' : '❌';
        
        console.log(`| ${index + 1}. | ${name} | ${category} | $${price} | ${image} | ${stock} |`);
      });
    }

    console.log('─'.repeat(100));
    console.log(`\n📊 Total de productos: ${products.length}`);

    // Productos sin imagen
    const noImage = products.filter(p => !p.image);
    if (noImage.length > 0) {
      console.log(`\n⚠️  Productos SIN IMAGEN: ${noImage.length}`);
      noImage.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (${p._id})`);
      });
      console.log('\n💡 Tip: Edita estos productos en el panel admin para agregar imágenes');
    } else {
      console.log('\n✅ Todos los productos tienen imagen');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

listProducts();
