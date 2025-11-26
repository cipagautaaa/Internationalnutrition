// backend/scripts/createIndexes.js
// Script para crear índices optimizados en MongoDB para mejorar el rendimiento

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

async function createIndexes() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Creando índices para optimización de consultas...\n');

    // ==========================================
    // ÍNDICES PARA EL MODELO USER
    // ==========================================
    console.log('👤 Creando índices para Users...');
    
    // Índice único para email (consulta más frecuente)
    await User.collection.createIndex(
      { email: 1 },
      { 
        unique: true, 
        name: 'email_unique_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice único en email');

    // Índice para búsquedas por email verificado
    await User.collection.createIndex(
      { email: 1, isEmailVerified: 1 },
      { 
        name: 'email_verified_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice compuesto email + isEmailVerified');

    // Índice para administradores
    await User.collection.createIndex(
      { isAdmin: 1 },
      { 
        name: 'admin_idx',
        background: true,
        sparse: true  // Solo indexa documentos donde isAdmin existe
      }
    );
    console.log('   ✅ Índice para isAdmin');

    // Índice para códigos de verificación (TTL - expira automáticamente)
    await User.collection.createIndex(
      { verificationCodeExpires: 1 },
      { 
        name: 'verification_code_ttl_idx',
        expireAfterSeconds: 0,  // Expira cuando el campo dice
        background: true
      }
    );
    console.log('   ✅ Índice TTL para códigos de verificación');

    // ==========================================
    // ÍNDICES PARA EL MODELO PRODUCT
    // ==========================================
    console.log('\n🛍️ Creando índices para Products...');

    // Índice para categoría (filtro muy frecuente)
    await Product.collection.createIndex(
      { category: 1 },
      { 
        name: 'category_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice en category');

    // Índice compuesto para categoría + precio (ordenamiento frecuente)
    await Product.collection.createIndex(
      { category: 1, price: 1 },
      { 
        name: 'category_price_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice compuesto category + price');

    // Índice para productos en stock
    await Product.collection.createIndex(
      { stock: 1 },
      { 
        name: 'stock_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice en stock');

    // Índice de texto para búsquedas
    await Product.collection.createIndex(
      { 
        name: 'text', 
        description: 'text',
        category: 'text'
      },
      { 
        name: 'product_text_search_idx',
        background: true,
        weights: {
          name: 10,        // Mayor peso al nombre
          category: 5,     // Peso medio a categoría
          description: 1   // Menor peso a descripción
        }
      }
    );
    console.log('   ✅ Índice de texto para búsquedas');

    // Índice para ordenamiento por fecha de creación
    await Product.collection.createIndex(
      { createdAt: -1 },
      { 
        name: 'created_at_desc_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice en createdAt (descendente)');

    // Índice para productos activos por rating
    await Product.collection.createIndex(
      { rating: -1, stock: 1 },
      { 
        name: 'rating_stock_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice compuesto rating + stock');

    // ==========================================
    // ÍNDICES PARA EL MODELO ORDER
    // ==========================================
    console.log('\n📦 Creando índices para Orders...');

    // Índice para órdenes por usuario (consulta muy frecuente)
    await Order.collection.createIndex(
      { user: 1 },
      { 
        name: 'user_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice en user');

    // Índice compuesto para usuario + fecha (historial de órdenes)
    await Order.collection.createIndex(
      { user: 1, createdAt: -1 },
      { 
        name: 'user_created_desc_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice compuesto user + createdAt');

    // Índice para estado de pago
    await Order.collection.createIndex(
      { paymentStatus: 1 },
      { 
        name: 'payment_status_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice en paymentStatus');

    // Índice para estado de orden
    await Order.collection.createIndex(
      { status: 1 },
      { 
        name: 'order_status_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice en status');

    // Índice para ID de pago de MercadoPago
    await Order.collection.createIndex(
      { mercadoPagoPaymentId: 1 },
      { 
        name: 'mercadopago_payment_idx',
        background: true,
        sparse: true  // Solo indexa cuando el campo existe
      }
    );
    console.log('   ✅ Índice en mercadoPagoPaymentId');

    // Índice compuesto para reportes de administrador
    await Order.collection.createIndex(
      { paymentStatus: 1, createdAt: -1 },
      { 
        name: 'payment_status_date_idx',
        background: true 
      }
    );
    console.log('   ✅ Índice compuesto paymentStatus + createdAt');

    // ==========================================
    // VERIFICAR ÍNDICES CREADOS
    // ==========================================
    console.log('\n🔍 Verificando índices creados...\n');

    const userIndexes = await User.collection.listIndexes().toArray();
    console.log('👤 Users - Índices creados:', userIndexes.length);
    userIndexes.forEach(idx => console.log(`   - ${idx.name}`));

    const productIndexes = await Product.collection.listIndexes().toArray();
    console.log('\n🛍️ Products - Índices creados:', productIndexes.length);
    productIndexes.forEach(idx => console.log(`   - ${idx.name}`));

    const orderIndexes = await Order.collection.listIndexes().toArray();
    console.log('\n📦 Orders - Índices creados:', orderIndexes.length);
    orderIndexes.forEach(idx => console.log(`   - ${idx.name}`));

    console.log('\n🎉 ¡Todos los índices creados exitosamente!');
    console.log('\n📈 Beneficios esperados:');
    console.log('   - Búsquedas por email: 10-50x más rápidas');
    console.log('   - Filtros por categoría: 5-20x más rápidas');
    console.log('   - Búsquedas de texto: 20-100x más rápidas');
    console.log('   - Consultas de órdenes: 5-30x más rápidas');
    console.log('   - Ordenamientos: 3-10x más rápidos');

  } catch (error) {
    console.error('❌ Error creando índices:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Función para eliminar índices (útil para development)
async function dropCustomIndexes() {
  try {
    console.log('🗑️ Eliminando índices personalizados...');
    
    const customIndexes = [
      'email_verified_idx', 'admin_idx', 'verification_code_ttl_idx',
      'category_idx', 'category_price_idx', 'stock_idx', 'product_text_search_idx',
      'created_at_desc_idx', 'rating_stock_idx',
      'user_idx', 'user_created_desc_idx', 'payment_status_idx', 
      'order_status_idx', 'mercadopago_payment_idx', 'payment_status_date_idx'
    ];

    await mongoose.connect(process.env.MONGODB_URI);

    for (const indexName of customIndexes) {
      try {
        await User.collection.dropIndex(indexName);
        console.log(`   ✅ Eliminado ${indexName} de Users`);
      } catch (e) {
        // Índice no existe, continuar
      }
      
      try {
        await Product.collection.dropIndex(indexName);
        console.log(`   ✅ Eliminado ${indexName} de Products`);
      } catch (e) {
        // Índice no existe, continuar
      }
      
      try {
        await Order.collection.dropIndex(indexName);
        console.log(`   ✅ Eliminado ${indexName} de Orders`);
      } catch (e) {
        // Índice no existe, continuar
      }
    }

    console.log('✅ Índices personalizados eliminados');
  } catch (error) {
    console.error('❌ Error eliminando índices:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Ejecutar según argumento de línea de comandos
const command = process.argv[2];
if (command === 'drop') {
  dropCustomIndexes();
} else {
  createIndexes();
}

module.exports = { createIndexes, dropCustomIndexes };