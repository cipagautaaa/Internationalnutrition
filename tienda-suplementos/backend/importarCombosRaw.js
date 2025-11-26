// importarCombosRaw.js
// Script para limpiar la BD y cargar combos desde combos_raw.json

require('dotenv').config();
const mongoose = require('mongoose');
const Combo = require('./models/Combo');
const fs = require('fs');
const path = require('path');

// Normalizar categoría del JSON al formato BD
const normalizeCategory = (tipo) => {
  if (!tipo) return 'Volumen';
  
  const tipoNormalizado = tipo.trim().toUpperCase();
  
  const map = {
    'DEFINICIÓN': 'Definición',
    'VOLUMEN': 'Volumen'
  };
  
  return map[tipoNormalizado] || 'Volumen';
};

async function importarCombos() {
  try {
    // Conectar a MongoDB
    const mongoOptions = {};
    if (process.env.MONGODB_DB_NAME) {
      mongoOptions.dbName = process.env.MONGODB_DB_NAME;
    }
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Conectado a MongoDB');

    // Leer archivo JSON
    const jsonPath = path.join(__dirname, 'combos_raw.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró combos_raw.json');
      process.exit(1);
    }

    const combosRaw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📦 Total de combos a cargar: ${combosRaw.length}`);

    // PASO 1: Limpiar todos los combos existentes
    console.log('\n🗑️  Borrando combos existentes de la BD...');
    const resultado = await Combo.deleteMany({});
    console.log(`✅ Se eliminaron ${resultado.deletedCount} combos`);

    // PASO 2: Importar combos del JSON
    console.log('\n📥 Importando combos desde combos_raw.json...\n');

    let insertados = 0;
    let errores = 0;
    const combosConError = [];

    for (const comboRaw of combosRaw) {
      try {
        // Preparar datos normalizados
        const comboData = {
          name: comboRaw.Nombre?.trim(),
          description: comboRaw.Productos?.trim() || 'Sin descripción',
          price: parseFloat(comboRaw.Precio),
          category: normalizeCategory(comboRaw.Tipo), // "Tipo" es la categoría
          image: 'https://via.placeholder.com/300?text=Combo', // Imagen placeholder
          inStock: true,
          featured: false
        };

        // Validar datos obligatorios
        if (!comboData.name || !comboData.price) {
          throw new Error(`Datos incompletos: name=${comboData.name}, price=${comboData.price}`);
        }

        // Crear y guardar combo
        const nuevoCombo = new Combo(comboData);
        await nuevoCombo.save();
        insertados++;
        console.log(`✅ [${insertados}] ${comboData.name} ($${comboData.price}) - ${comboData.category}`);

      } catch (error) {
        errores++;
        combosConError.push({
          combo: comboRaw.Nombre,
          error: error.message
        });
        console.error(`❌ Error en "${comboRaw.Nombre}": ${error.message}`);
      }
    }

    // RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Combos insertados: ${insertados}`);
    console.log(`❌ Combos con error: ${errores}`);
    console.log(`📦 Total en BD ahora: ${await Combo.countDocuments()}`);

    if (combosConError.length > 0) {
      console.log('\n⚠️  Combos con error:');
      combosConError.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.combo}: ${item.error}`);
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

importarCombos();
