// importarProductosRaw.js
// Script para limpiar la BD y cargar productos desde productos_raw.json

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Mapeo de categorías para normalizar
const normalizeCategory = (categoria) => {
  if (!categoria) return 'Proteínas';
  
  const categoriaNormalizada = categoria.trim().toUpperCase();
  
  const map = {
    'PROTEINAS': 'Proteínas',
    'CREATINAS': 'Creatinas',
    'CREATINA': 'Creatinas',
    'PRE-ENTRENOS': 'Pre-entrenos y Quemadores',
    'PRE-ENTRENOS Y QUEMADORES': 'Pre-entrenos y Quemadores',
    'PRE-ENTRENOS Y ENERGÍA': 'Pre-entrenos y Quemadores',
    'PRE ENTRENOS Y ENERGIA': 'Pre-entrenos y Quemadores',
    'AMINOÁCIDOS': 'Aminoácidos y Recuperadores',
    'AMINOÁCIDOS Y RECUPERADORES': 'Aminoácidos y Recuperadores',
    'AMINOACIDOS Y RECUPERADORES': 'Aminoácidos y Recuperadores',
    'VITAMINAS': 'Salud y Bienestar',
    'SALUD Y BIENESTAR': 'Salud y Bienestar',
    'PARA LA SALUD': 'Salud y Bienestar',
    'COMIDAS': 'Alimentacion saludable y alta en proteina',
    'COMIDAS CON PROTEINA': 'Alimentacion saludable y alta en proteina',
    'COMIDAS CON PROTEÍNA': 'Alimentacion saludable y alta en proteina',
    'ALIMENTACION SALUDABLE Y ALTA EN PROTEINA': 'Alimentacion saludable y alta en proteina'
  };
  
  return map[categoriaNormalizada] || 'Proteínas';
};

// Mapeo de tipos/subcategorías
const normalizeTipo = (tipo) => {
  const map = {
    'PROTEINA LIMPIA': 'Proteínas limpias',
    'PROTEINA HIPERCALORICA': 'Proteínas hipercalóricas',
    'PROTEINA VEGANA': 'Proteínas veganas'
  };
  return map[tipo?.toUpperCase()] || tipo || null;
};

async function importarProductos() {
  try {
    // Conectar a MongoDB
    const mongoOptions = {};
    if (process.env.MONGODB_DB_NAME) {
      mongoOptions.dbName = process.env.MONGODB_DB_NAME;
    }
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Conectado a MongoDB');

    // Leer archivo JSON
    const jsonPath = path.join(__dirname, 'productos_raw.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró productos_raw.json');
      process.exit(1);
    }

    const productosRaw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📦 Total de productos a cargar: ${productosRaw.length}`);

    // PASO 1: Limpiar todos los productos existentes
    console.log('\n🗑️  Borrando productos existentes de la BD...');
    const resultado = await Product.deleteMany({});
    console.log(`✅ Se eliminaron ${resultado.deletedCount} productos`);

    // PASO 2: Importar productos del JSON
    console.log('\n📥 Importando productos desde productos_raw.json...\n');

    let insertados = 0;
    let errores = 0;
    const productosConError = [];

    for (const productoRaw of productosRaw) {
      try {
        // Preparar datos normalizados
        const productoData = {
          name: productoRaw.name?.trim(),
          description: productoRaw.description?.trim(),
          price: parseFloat(productoRaw.price),
          originalPrice: productoRaw['precio original'] ? parseFloat(productoRaw['precio original']) : null,
          category: normalizeCategory(productoRaw.category),
          size: productoRaw.size?.trim() || 'Sin especificar',
          image: 'https://via.placeholder.com/300?text=Producto' // Imagen placeholder por defecto
        };
        
        // No incluir tipo por ahora para evitar problemas de validación

        // Validar datos obligatorios
        if (!productoData.name || !productoData.description || !productoData.price) {
          throw new Error(`Datos incompletos: name=${productoData.name}, description=${productoData.description}, price=${productoData.price}`);
        }

        // Crear y guardar producto
        const nuevoProducto = new Product(productoData);
        await nuevoProducto.save();
        insertados++;
        console.log(`✅ [${insertados}] ${productoData.name} ($${productoData.price})`);

      } catch (error) {
        errores++;
        productosConError.push({
          producto: productoRaw.name,
          error: error.message
        });
        console.error(`❌ Error en "${productoRaw.name}": ${error.message}`);
      }
    }

    // RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Productos insertados: ${insertados}`);
    console.log(`❌ Productos con error: ${errores}`);
    console.log(`📦 Total en BD ahora: ${await Product.countDocuments()}`);

    if (productosConError.length > 0) {
      console.log('\n⚠️  Productos con error:');
      productosConError.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.producto}: ${item.error}`);
      });
    }

    console.log('\n✅ Proceso completado');
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

importarProductos();
