#!/usr/bin/env node
/**
 * Script para actualizar imágenes de productos existentes
 * Propósito: Asignar imágenes a productos que no las tienen
 * Uso: node updateProductImages.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Mapeo de productos con sus URLs de imagen
// Puedes modificar esto según tus productos
const PRODUCT_IMAGES = {
  'Proteína Whey Gold Standard': 'https://via.placeholder.com/800x800?text=Proteina+Whey',
  'Pre-Workout C4 Energy': 'https://via.placeholder.com/800x800?text=PreWorkout+C4',
  'Creatina Monohidrato Pura': 'https://via.placeholder.com/800x800?text=Creatina',
  'BCAA 2:1:1 Recovery': 'https://via.placeholder.com/800x800?text=BCAA+Recovery',
};

async function updateProductImages() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('📦 Productos a actualizar:\n');

    let updated = 0;
    let skipped = 0;

    for (const [productName, imageUrl] of Object.entries(PRODUCT_IMAGES)) {
      try {
        const product = await Product.findOne({ name: productName });

        if (!product) {
          console.log(`⏭️  No encontrado: ${productName}`);
          skipped++;
          continue;
        }

        // Si ya tiene imagen, pregunta si actualizar
        if (product.image && product.image !== imageUrl) {
          console.log(`📸 ${productName}`);
          console.log(`   Imagen anterior: ${product.image}`);
          console.log(`   Nueva imagen: ${imageUrl}`);
          product.image = imageUrl;
          await product.save();
          console.log(`   ✅ Actualizado\n`);
          updated++;
        } else if (!product.image) {
          console.log(`🆕 ${productName}`);
          console.log(`   Imagen asignada: ${imageUrl}`);
          product.image = imageUrl;
          await product.save();
          console.log(`   ✅ Guardado\n`);
          updated++;
        } else {
          console.log(`⏭️  ${productName} (ya tiene esa imagen)\n`);
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Error en ${productName}:`, error.message);
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`✅ Actualizados: ${updated}`);
    console.log(`⏭️  Sin cambios: ${skipped}`);
    console.log(`📋 Total procesados: ${updated + skipped}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

updateProductImages();
