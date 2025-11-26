// updateProductosTipo.js
// Script para actualizar los productos existentes con el campo "tipo" (subcategoría)

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Mapeo de tipos/subcategorías del JSON a los válidos en la BD
const normalizeTipo = (tipo) => {
  if (!tipo) return null;
  
  const tipoNormalizado = tipo.trim().toUpperCase();
  
  const map = {
    // PROTEINAS
    'PROTEINA LIMPIA': 'Proteínas limpias',
    'PROTEINA HIPERCALORICA': 'Proteínas hipercalóricas',
    'PROTEINA VEGANA': 'Proteínas veganas',
    
    // PRE ENTRENOS Y ENERGIA
    'PRE ENTRENO': 'Pre-entrenos',
    'QUEMADORES DE GRASA': 'Quemadores de grasa',
    
    // CREATINAS
    'CREATINA MONOHIDRATO': 'Monohidratadas',
    'CREATINA HCL': 'HCL',
    
    // AMINOACIDOS Y RECUPERADORES
    'AMINOACIDOS': 'BCAA y EAA',
    
    // SALUD Y BIENESTAR
    'SUPLEMENTOS PARA LA SALUD': 'Multivitamínicos',
    'MULTIVITAMINICOS': 'Multivitamínicos',
    'PRECURSOR DE TESTOSTERONA': 'Precursores de testosterona',
    
    // COMIDAS CON PROTEINA
    'ALIMENTACION SALUDABLE': 'Snacks funcionales'
  };
  
  return map[tipoNormalizado] || null;
};

async function updateProductosTipo() {
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
    console.log(`📦 Total de productos en JSON: ${productosRaw.length}`);

    // Crear mapeo nombre -> tipo
    const tipoMap = {};
    for (const prod of productosRaw) {
      if (prod.name && prod.tipo) {
        tipoMap[prod.name.trim()] = normalizeTipo(prod.tipo);
      }
    }

    console.log(`📋 Mapeo de tipos creado para ${Object.keys(tipoMap).length} productos`);

    // Actualizar productos en BD
    console.log('\n🔄 Actualizando productos con tipos...\n');

    let actualizados = 0;
    let sinTipo = 0;
    let errores = 0;

    for (const [nombre, tipo] of Object.entries(tipoMap)) {
      try {
        const producto = await Product.findOne({ name: nombre });
        
        if (producto) {
          if (tipo) {
            await Product.findByIdAndUpdate(producto._id, { tipo: tipo });
            console.log(`✅ ${nombre} → tipo: ${tipo}`);
            actualizados++;
          } else {
            console.log(`⚠️  ${nombre} → sin tipo válido`);
            sinTipo++;
          }
        }
      } catch (error) {
        errores++;
        console.error(`❌ Error actualizando ${nombre}: ${error.message}`);
      }
    }

    // RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE ACTUALIZACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Productos actualizados con tipo: ${actualizados}`);
    console.log(`⚠️  Productos sin tipo válido: ${sinTipo}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📦 Total en BD: ${await Product.countDocuments()}`);

    console.log('\n✅ Proceso completado');
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

updateProductosTipo();
