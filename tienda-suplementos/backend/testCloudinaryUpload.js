#!/usr/bin/env node
/**
 * Script para probar la carga de imágenes a Cloudinary
 * Propósito: Validar que el endpoint de upload funciona correctamente
 * Uso: node testCloudinaryUpload.js <token_admin>
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const ADMIN_TOKEN = process.argv[2];

// Crear una imagen de prueba temporal (pequeña imagen PNG de 1x1 pixel)
const createTestImage = () => {
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63,
    0xF8, 0xCF, 0xC0, 0x00, 0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D,
    0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60,
    0x82
  ]);
  
  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, pngBuffer);
  return testImagePath;
};

async function testCloudinaryUpload() {
  try {
    console.log('🧪 Iniciando prueba de carga a Cloudinary...\n');

    if (!ADMIN_TOKEN) {
      console.error('❌ Error: Token de admin requerido');
      console.log('Uso: node testCloudinaryUpload.js <token_admin>');
      console.log('\nPara obtener un token:');
      console.log('1. Inicia sesión en http://localhost:5173/login');
      console.log('2. Abre la consola (F12) → Application → Local Storage');
      console.log('3. Copia el valor de "token"');
      process.exit(1);
    }

    console.log('📁 Creando imagen de prueba...');
    const testImagePath = createTestImage();
    console.log('✅ Imagen creada: test-image.png\n');

    // Crear FormData
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath), 'test-product.png');

    console.log('📤 Enviando imagen a Cloudinary...');
    console.log(`   URL: POST ${API_URL}/api/products/upload-image`);
    console.log(`   Token: ${ADMIN_TOKEN.substring(0, 20)}...\n`);

    const response = await axios.post(
      `${API_URL}/api/products/upload-image`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );

    console.log('✅ Upload exitoso!\n');
    console.log('Respuesta del servidor:');
    console.log(JSON.stringify(response.data, null, 2));

    console.log('\n📍 URL de la imagen en Cloudinary:');
    console.log(response.data.imageUrl);

    console.log('\n✅ Prueba completada exitosamente!');
    console.log('\n📊 Información útil:');
    console.log(`   • Public ID: ${response.data.publicId}`);
    console.log(`   • Puedes ver todas tus imágenes en: https://cloudinary.com/console/media_library`);

    // Limpiar
    fs.unlinkSync(testImagePath);

  } catch (error) {
    console.error('\n❌ Error durante la prueba:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensaje: ${error.response.data?.message || error.message}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   No se puede conectar al servidor en ' + API_URL);
      console.error('   ¿Está el servidor corriendo? (npm run dev)');
    } else {
      console.error(`   ${error.message}`);
    }
    
    process.exit(1);
  }
}

testCloudinaryUpload();
