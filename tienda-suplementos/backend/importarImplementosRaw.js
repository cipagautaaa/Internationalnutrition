// importarImplementosRaw.js
// Script para limpiar la BD y cargar Wargo y accesorios para gym desde implementos_raw.json

require('dotenv').config();
const mongoose = require('mongoose');
const Implement = require('./models/Implement');
const fs = require('fs');
const path = require('path');

const IMPLEMENTS_LABEL = 'Wargo y accesorios para gym';

async function importarImplementos() {
  try {
    // Conectar a MongoDB
    const mongoOptions = {};
    if (process.env.MONGODB_DB_NAME) {
      mongoOptions.dbName = process.env.MONGODB_DB_NAME;
    }
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Conectado a MongoDB');

    // Leer archivo JSON
    const jsonPath = path.join(__dirname, 'implementos_raw.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró implementos_raw.json');
      process.exit(1);
    }

    const implementosRaw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📦 Total de ${IMPLEMENTS_LABEL} a cargar: ${implementosRaw.length}`);

    // PASO 1: Limpiar todos los registros existentes
    console.log(`\n🗑️  Borrando ${IMPLEMENTS_LABEL} existentes de la BD...`);
    const resultado = await Implement.deleteMany({});
    console.log(`✅ Se eliminaron ${resultado.deletedCount} ${IMPLEMENTS_LABEL}`);

    // PASO 2: Importar desde el JSON
    console.log(`\n📥 Importando ${IMPLEMENTS_LABEL} desde implementos_raw.json...\n`);

    let insertados = 0;
    let errores = 0;
    const implementosConError = [];

    for (const implementoRaw of implementosRaw) {
      try {
        // Preparar datos normalizados
        const implementoData = {
          name: implementoRaw.PRODUCTO?.trim(),
          price: parseFloat(implementoRaw.PRECIO),
          image: 'https://via.placeholder.com/300?text=Wargo+accesorio', // Imagen placeholder
          sizes: implementoRaw.Tallas 
            ? implementoRaw.Tallas.split(',').map(t => t.trim())
            : [], // Convertir tallas de string a array
          isActive: true
        };

        // Validar datos obligatorios
        if (!implementoData.name || !implementoData.price) {
          throw new Error(`Datos incompletos: name=${implementoData.name}, price=${implementoData.price}`);
        }

        // Crear y guardar accesorio
        const nuevoImplemento = new Implement(implementoData);
        await nuevoImplemento.save();
        insertados++;
        console.log(`✅ [${insertados}] ${implementoData.name} ($${implementoData.price}) - Tallas: ${implementoData.sizes.join(', ')}`);

      } catch (error) {
        errores++;
        implementosConError.push({
          producto: implementoRaw.PRODUCTO,
          error: error.message
        });
        console.error(`❌ Error en "${implementoRaw.PRODUCTO}": ${error.message}`);
      }
    }

    // RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ ${IMPLEMENTS_LABEL} insertados: ${insertados}`);
    console.log(`❌ ${IMPLEMENTS_LABEL} con error: ${errores}`);
    console.log(`📦 Total en BD ahora: ${await Implement.countDocuments()}`);

    if (implementosConError.length > 0) {
      console.log(`\n⚠️  ${IMPLEMENTS_LABEL} con error:`);
      implementosConError.forEach((item, index) => {
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

importarImplementos();
