#!/usr/bin/env node
/**
 * Script de prueba para Cloudinary con 4 productos
 * Propósito: Validar que Cloudinary está correctamente configurado
 * Uso: node testCloudinaryProducts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const testProducts = [
  {
    name: 'Proteína Whey Gold Standard',
    description: 'Proteína de suero de leche de alta calidad con 24g de proteína por porción. Sabor a chocolate y vainilla.',
    price: 89999,
    originalPrice: 119999,
    category: 'Proteínas',
    tipo: 'Proteínas limpias',
    size: '4 libras',
    image: 'https://via.placeholder.com/800x800?text=Proteina+Whey+1',
    flavors: ['Chocolate', 'Vainilla', 'Fresa'],
    inStock: true,
    isActive: true,
    isPrimary: true
  },
  {
    name: 'Pre-Workout C4 Energy',
    description: 'Explosión de energía con 200mg de cafeína. Perfecto para intensificar tus entrenamientos.',
    price: 65000,
    originalPrice: 85000,
    category: 'Pre-entrenos y Quemadores',
    tipo: 'Pre-entrenos',
    size: '300g',
    image: 'https://via.placeholder.com/800x800?text=PreWorkout+C4',
    flavors: ['Frambuesa Azul', 'Sandía'],
    inStock: true,
    isActive: true,
    isPrimary: true
  },
  {
    name: 'Creatina Monohidrato Pura',
    description: 'Creatina pura 100% sin aditivos. Aumenta la fuerza y resistencia muscular.',
    price: 45000,
    originalPrice: 60000,
    category: 'Creatinas',
    tipo: 'Monohidratadas',
    size: '500g',
    image: 'https://via.placeholder.com/800x800?text=Creatina+Pura',
    flavors: ['Sin sabor'],
    inStock: true,
    isActive: true,
    isPrimary: true
  },
  {
    name: 'BCAA 2:1:1 Recovery',
    description: 'Aminoácidos ramificados para recuperación muscular. Ideal para tomar durante o después del entrenamiento.',
    price: 55000,
    originalPrice: 72000,
    category: 'Aminoácidos y Recuperadores',
    tipo: 'BCAA y EAA',
    size: '250g',
    image: 'https://via.placeholder.com/800x800?text=BCAA+Recovery',
    flavors: ['Piña Colada', 'Manzana Verde', 'Frutas Tropicales'],
    inStock: true,
    isActive: true,
    isPrimary: true
  }
];

async function seedTestProducts() {
  try {
    // Verificar variables de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Error: Variables de Cloudinary no configuradas en .env');
      console.log('\nPor favor, agrega las siguientes variables a .env:');
      console.log('CLOUDINARY_CLOUD_NAME=tu_cloud_name');
      console.log('CLOUDINARY_API_KEY=tu_api_key');
      console.log('CLOUDINARY_API_SECRET=tu_api_secret');
      process.exit(1);
    }

    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar productos de prueba anteriores
    console.log('🧹 Limpiando productos de prueba anteriores...');
    const testProductNames = testProducts.map(p => p.name);
    await Product.deleteMany({ name: { $in: testProductNames } });
    console.log('✅ Limpieza completada');

    // Insertar nuevos productos de prueba
    console.log('📦 Creando 4 productos de prueba...');
    const created = await Product.insertMany(testProducts);
    console.log(`✅ ${created.length} productos creados exitosamente\n`);

    // Mostrar detalles
    console.log('Productos creados:');
    created.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Categoría: ${product.category}`);
      console.log(`   Precio: $${product.price}`);
      console.log(`   Imagen: ${product.image}`);
    });

    console.log('\n\n🎉 ¡Productos de prueba creados exitosamente!');
    console.log('\nPróximos pasos:');
    console.log('1. Ve a https://cloudinary.com y obtén tus credenciales');
    console.log('2. Actualiza el archivo .env con:');
    console.log('   - CLOUDINARY_CLOUD_NAME');
    console.log('   - CLOUDINARY_API_KEY');
    console.log('   - CLOUDINARY_API_SECRET');
    console.log('3. Reinicia el servidor: npm run dev');
    console.log('4. Prueba el upload en http://localhost:5173/admin/products');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

seedTestProducts();
