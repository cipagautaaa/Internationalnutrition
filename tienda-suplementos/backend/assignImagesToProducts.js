#!/usr/bin/env node
/**
 * Script interactivo para actualizar imágenes de productos
 * Propósito: Asignar imágenes a productos existentes de forma fácil
 * Uso: node assignImagesToProducts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// URLs de imágenes placeholder (puedes reemplazarlas con URLs reales de Cloudinary)
const PLACEHOLDER_IMAGES = {
  'Proteínas': 'https://via.placeholder.com/800x800?text=Proteina',
  'Pre-entrenos y Quemadores': 'https://via.placeholder.com/800x800?text=PreWorkout',
  'Creatinas': 'https://via.placeholder.com/800x800?text=Creatina',
  'Aminoácidos y Recuperadores': 'https://via.placeholder.com/800x800?text=Aminoacidos',
  'Salud y Bienestar': 'https://via.placeholder.com/800x800?text=Salud',
  'Alimentacion saludable y alta en proteina': 'https://via.placeholder.com/800x800?text=Comidas',
  'Comidas con proteína': 'https://via.placeholder.com/800x800?text=Comidas',
};

async function assignImages() {
  try {
    console.log('\n🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    // Obtener productos sin imagen
    const productsWithoutImage = await Product.find({ $or: [{ image: null }, { image: '' }] });

    if (productsWithoutImage.length === 0) {
      console.log('✅ Todos los productos ya tienen imagen');
      rl.close();
      return;
    }

    console.log(`📦 Encontrados ${productsWithoutImage.length} productos sin imagen\n`);

    let updated = 0;

    for (const product of productsWithoutImage) {
      console.log('\n' + '─'.repeat(60));
      console.log(`📌 Producto: ${product.name}`);
      console.log(`   Categoría: ${product.category}`);
      console.log(`   Precio: $${product.price}`);
      console.log('─'.repeat(60));

      const answer = await question('\n¿Quieres asignar una imagen? (s/n): ');

      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'yes') {
        // Sugerir imagen basada en categoría
        const suggestedImage = PLACEHOLDER_IMAGES[product.category];
        
        if (suggestedImage) {
          console.log(`\n💡 Imagen sugerida para ${product.category}:`);
          console.log(`   ${suggestedImage}`);
          
          const useSuggested = await question('\n¿Usar esta imagen? (s/n): ');
          
          if (useSuggested.toLowerCase() === 's' || useSuggested.toLowerCase() === 'yes') {
            product.image = suggestedImage;
            await product.save();
            console.log('✅ Imagen asignada');
            updated++;
          } else {
            const customUrl = await question('\nIngresa la URL de la imagen: ');
            if (customUrl.trim()) {
              product.image = customUrl;
              await product.save();
              console.log('✅ Imagen personalizada asignada');
              updated++;
            } else {
              console.log('⏭️  Saltado');
            }
          }
        } else {
          const customUrl = await question('Ingresa la URL de la imagen: ');
          if (customUrl.trim()) {
            product.image = customUrl;
            await product.save();
            console.log('✅ Imagen asignada');
            updated++;
          } else {
            console.log('⏭️  Saltado');
          }
        }
      } else {
        console.log('⏭️  Saltado');
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`\n✅ Resumen: ${updated} productos actualizados`);
    console.log('✨ ¡Listo! Todas las imágenes han sido asignadas\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
}

assignImages();
