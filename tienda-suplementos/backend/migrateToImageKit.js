/**
 * Script de migración de imágenes de Cloudinary a ImageKit
 * 
 * Este script:
 * 1. Obtiene todos los productos, implementos y combos de la base de datos
 * 2. Descarga las imágenes que están en Cloudinary
 * 3. Las sube a ImageKit
 * 4. Actualiza las URLs en la base de datos
 * 
 * Uso: node migrateToImageKit.js
 * 
 * IMPORTANTE: Asegúrate de tener configuradas las variables de entorno:
 * - MONGODB_URI
 * - IMAGEKIT_PUBLIC_KEY
 * - IMAGEKIT_PRIVATE_KEY
 * - IMAGEKIT_URL_ENDPOINT
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const ImageKit = require('imagekit');

// Modelos
const Product = require('./models/Product');
const Implement = require('./models/Implement');
const Combo = require('./models/Combo');

// Configurar ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Estadísticas
const stats = {
  products: { total: 0, migrated: 0, skipped: 0, failed: 0 },
  implements: { total: 0, migrated: 0, skipped: 0, failed: 0 },
  combos: { total: 0, migrated: 0, skipped: 0, failed: 0 },
};

// Detectar si una URL es de Cloudinary
const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary');
};

// Descargar imagen desde URL
const downloadImage = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`   ❌ Error descargando ${url}:`, error.message);
    return null;
  }
};

// Subir imagen a ImageKit
const uploadToImageKit = async (buffer, fileName, folder) => {
  try {
    const result = await imagekit.upload({
      file: buffer.toString('base64'),
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
    });
    return result.url;
  } catch (error) {
    console.error(`   ❌ Error subiendo a ImageKit:`, error.message);
    return null;
  }
};

// Migrar una imagen
const migrateImage = async (url, folder) => {
  if (!isCloudinaryUrl(url)) {
    return { migrated: false, url: url, reason: 'not-cloudinary' };
  }

  // Extraer nombre del archivo de la URL
  const urlParts = url.split('/');
  let fileName = urlParts[urlParts.length - 1];
  // Limpiar query strings y versiones
  fileName = fileName.split('?')[0];
  
  console.log(`   📥 Descargando: ${fileName}`);
  const buffer = await downloadImage(url);
  
  if (!buffer) {
    return { migrated: false, url: url, reason: 'download-failed' };
  }

  console.log(`   📤 Subiendo a ImageKit...`);
  const newUrl = await uploadToImageKit(buffer, fileName, folder);
  
  if (!newUrl) {
    return { migrated: false, url: url, reason: 'upload-failed' };
  }

  console.log(`   ✅ Migrada: ${newUrl}`);
  return { migrated: true, url: newUrl, oldUrl: url };
};

// Migrar productos
const migrateProducts = async () => {
  console.log('\n📦 MIGRANDO PRODUCTOS...\n');
  
  const products = await Product.find({});
  stats.products.total = products.length;
  
  for (const product of products) {
    console.log(`\n🔄 Producto: ${product.name}`);
    let updated = false;

    // Migrar imagen principal
    if (product.image && isCloudinaryUrl(product.image)) {
      const result = await migrateImage(product.image, 'suplementos/productos');
      if (result.migrated) {
        product.image = result.url;
        updated = true;
        stats.products.migrated++;
      } else {
        stats.products.failed++;
      }
    } else {
      stats.products.skipped++;
    }

    // Migrar imágenes adicionales si existen
    if (product.images && Array.isArray(product.images)) {
      const newImages = [];
      for (const img of product.images) {
        if (isCloudinaryUrl(img)) {
          const result = await migrateImage(img, 'suplementos/productos');
          if (result.migrated) {
            newImages.push(result.url);
            updated = true;
          } else {
            newImages.push(img);
          }
        } else {
          newImages.push(img);
        }
      }
      product.images = newImages;
    }

    if (updated) {
      await product.save();
      console.log(`   💾 Producto guardado`);
    }
  }
};

// Migrar implementos
const migrateImplements = async () => {
  console.log('\n🏋️ MIGRANDO IMPLEMENTOS...\n');
  
  const implements_ = await Implement.find({});
  stats.implements.total = implements_.length;
  
  for (const impl of implements_) {
    console.log(`\n🔄 Implemento: ${impl.name}`);
    
    if (impl.image && isCloudinaryUrl(impl.image)) {
      const result = await migrateImage(impl.image, 'suplementos/implementos');
      if (result.migrated) {
        impl.image = result.url;
        await impl.save();
        console.log(`   💾 Implemento guardado`);
        stats.implements.migrated++;
      } else {
        stats.implements.failed++;
      }
    } else {
      stats.implements.skipped++;
    }
  }
};

// Migrar combos
const migrateCombos = async () => {
  console.log('\n🎁 MIGRANDO COMBOS...\n');
  
  const combos = await Combo.find({});
  stats.combos.total = combos.length;
  
  for (const combo of combos) {
    console.log(`\n🔄 Combo: ${combo.name}`);
    
    if (combo.image && isCloudinaryUrl(combo.image)) {
      const result = await migrateImage(combo.image, 'combos');
      if (result.migrated) {
        combo.image = result.url;
        await combo.save();
        console.log(`   💾 Combo guardado`);
        stats.combos.migrated++;
      } else {
        stats.combos.failed++;
      }
    } else {
      stats.combos.skipped++;
    }
  }
};

// Función principal
const main = async () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   MIGRACIÓN DE IMÁGENES: CLOUDINARY → IMAGEKIT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Verificar configuración de ImageKit
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.error('❌ Error: Faltan variables de entorno de ImageKit');
    console.error('   Necesitas configurar:');
    console.error('   - IMAGEKIT_PUBLIC_KEY');
    console.error('   - IMAGEKIT_PRIVATE_KEY');
    console.error('   - IMAGEKIT_URL_ENDPOINT');
    process.exit(1);
  }

  // Conectar a MongoDB
  try {
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }

  try {
    // Migrar cada colección
    await migrateProducts();
    await migrateImplements();
    await migrateCombos();

    // Mostrar resumen
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   RESUMEN DE MIGRACIÓN');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('📦 Productos:');
    console.log(`   Total: ${stats.products.total}`);
    console.log(`   Migrados: ${stats.products.migrated}`);
    console.log(`   Omitidos (no Cloudinary): ${stats.products.skipped}`);
    console.log(`   Fallidos: ${stats.products.failed}`);
    
    console.log('\n🏋️ Implementos:');
    console.log(`   Total: ${stats.implements.total}`);
    console.log(`   Migrados: ${stats.implements.migrated}`);
    console.log(`   Omitidos (no Cloudinary): ${stats.implements.skipped}`);
    console.log(`   Fallidos: ${stats.implements.failed}`);
    
    console.log('\n🎁 Combos:');
    console.log(`   Total: ${stats.combos.total}`);
    console.log(`   Migrados: ${stats.combos.migrated}`);
    console.log(`   Omitidos (no Cloudinary): ${stats.combos.skipped}`);
    console.log(`   Fallidos: ${stats.combos.failed}`);

    console.log('\n✅ Migración completada\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Desconectado de MongoDB');
  }
};

// Ejecutar
main();
