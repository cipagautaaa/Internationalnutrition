// seedProductosReales.js
// Script para agregar productos manteniendo estructura exacta existente
// Uso: node seedProductosReales.js [--clean] [--categoria="Proteínas"]

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Normalizar categorías para compatibilidad
const normalizeCategory = (categoria) => {
  const map = {
    'Proteínas': 'Proteínas',
    'Creatina': 'Creatinas', // Tu BD usa "Creatina", normalizo a "Creatinas"
    'Creatinas': 'Creatinas',
    'Pre-entrenos y Quemadores': 'Pre-entrenos y Quemadores',
    'Aminoácidos y Recuperadores': 'Aminoácidos y Recuperadores',
    'Salud y Bienestar': 'Salud y Bienestar',
    'Rendimiento hormonal': 'Rendimiento hormonal',
    'Comidas con proteína': 'Alimentacion saludable y alta en proteina',
    'Alimentacion saludable y alta en proteina': 'Alimentacion saludable y alta en proteina'
  };
  return map[categoria] || categoria;
};

async function seedProductosReales() {
  try {
  // Conectar a MongoDB (respetando MONGODB_DB_NAME si está definido)
  const mongoOptions = {};
  if (process.env.MONGODB_DB_NAME) mongoOptions.dbName = process.env.MONGODB_DB_NAME;
  await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Conectado a MongoDB');

    // Leer archivo JSON
    const jsonPath = path.join(__dirname, 'productos_completos.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró productos_completos.json');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const nuevosProductos = data.nuevos_productos || [];
    const productosExistentes = data.productos_existentes || [];

    console.log(`📦 Productos existentes en BD: ${productosExistentes.length}`);
    console.log(`➕ Nuevos productos a agregar: ${nuevosProductos.length}`);

    // Procesar argumentos
    const args = process.argv.slice(2);
    const shouldClean = args.includes('--clean');
    const categoriaFilter = args.find(arg => arg.startsWith('--categoria='))?.split('=')[1];

    // Si se especifica --clean, advertir
    if (shouldClean) {
      console.log('⚠️  ADVERTENCIA: --clean eliminará TODOS los productos existentes');
      console.log('⏳ Continuando en 3 segundos... (Ctrl+C para cancelar)');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const deleted = await Product.deleteMany({});
      console.log(`🗑️  ${deleted.deletedCount} productos eliminados`);
    }

    // Filtrar por categoría si se especifica
    let productosAProcesar = nuevosProductos;
    if (categoriaFilter) {
      productosAProcesar = nuevosProductos.filter(p => 
        p.category.toLowerCase().includes(categoriaFilter.toLowerCase())
      );
      console.log(`🔍 Filtrando por categoría "${categoriaFilter}": ${productosAProcesar.length} productos`);
    }

    // Procesar cada producto
    let insertados = 0;
    let actualizados = 0;
    let errores = 0;

    for (const producto of productosAProcesar) {
      try {
        // Normalizar categoría
        producto.category = normalizeCategory(producto.category);

        // Verificar si existe producto con mismo nombre
        const existente = await Product.findOne({ name: producto.name });

        if (existente && !shouldClean) {
          // Actualizar producto existente manteniendo campos importantes
          await Product.findByIdAndUpdate(existente._id, {
            ...producto,
            createdAt: existente.createdAt, // Mantener fecha original
            updatedAt: new Date()
          });
          console.log(`🔄 ${producto.name} - Actualizado`);
          actualizados++;
        } else {
          // Insertar nuevo producto
          const nuevoProducto = new Product({
            ...producto,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await nuevoProducto.save();
          console.log(`➕ ${producto.name} - Insertado`);
          insertados++;
        }
      } catch (error) {
        console.error(`❌ Error con ${producto.name}: ${error.message}`);
        errores++;
      }
    }

    // Resumen final
    console.log(`\n📊 RESUMEN:`);
    console.log(`   ➕ Productos insertados: ${insertados}`);
    console.log(`   🔄 Productos actualizados: ${actualizados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📈 Total procesados: ${insertados + actualizados}`);

    // Estadísticas por categoría
    const stats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, stock: { $sum: '$stock' } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log(`\n📋 PRODUCTOS POR CATEGORÍA:`);
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} productos (${stat.stock} unidades)`);
    });

    const totalProductos = await Product.countDocuments();
    console.log(`\n🎯 TOTAL EN BASE DE DATOS: ${totalProductos} productos`);

    console.log('\n🎉 ¡Seed completado exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

// Mostrar ayuda
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📖 SEED DE PRODUCTOS REALES

Uso:
  node seedProductosReales.js                        # Agregar productos nuevos sin tocar existentes
  node seedProductosReales.js --clean               # ELIMINAR todos y agregar desde cero
  node seedProductosReales.js --categoria="Proteínas"  # Solo productos de esa categoría

⚠️  IMPORTANTE:
  - Sin --clean: Solo agrega productos nuevos, actualiza si ya existe el nombre
  - Con --clean: ELIMINA todos los productos existentes primero
  
📁 Archivo de datos: productos_completos.json

🏷️  Categorías disponibles:
  - Proteínas
  - Creatinas
  - Pre-entrenos y Quemadores  
  - Aminoácidos y Recuperadores
  - Salud y Bienestar
  - Rendimiento hormonal
  - Alimentacion saludable y alta en proteina
`);
  process.exit(0);
}

// Ejecutar seed
seedProductosReales();
