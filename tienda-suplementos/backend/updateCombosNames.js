const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ override: true });

// Conectar a MongoDB local (dentro de Docker) o Atlas
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/tienda_suplementos';

console.log('Conectando a MongoDB...');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });

// Definir el modelo
const ComboSchema = new mongoose.Schema({}, { collection: 'combos', strict: false });
const Combo = mongoose.model('Combo', ComboSchema);

async function updateCombos() {
  try {
    // Leer el archivo JSON con los nuevos nombres
    const combosRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'combos_raw.json'), 'utf8'));

    console.log(`\n📦 Actualizando ${combosRaw.length} combos...\n`);

    // Obtener todos los combos actuales ordenados
    const allCombos = await Combo.find({}).sort({ createdAt: 1 });

    console.log(`   Total de combos en BD: ${allCombos.length}`);
    console.log(`   Total en archivo: ${combosRaw.length}\n`);

    let actualizados = 0;

    // Actualizar cada combo con su nueva información
    for (let i = 0; i < Math.min(allCombos.length, combosRaw.length); i++) {
      const comboId = allCombos[i]._id;
      const comboData = combosRaw[i];
      
      try {
        await Combo.findByIdAndUpdate(
          comboId,
          {
            name: comboData.Nombre,
            category: comboData.Tipo,
            description: comboData.Productos,
            price: comboData.Precio,
            orden: i
          },
          { new: true }
        );

        console.log(`✓ [${i + 1}/${combosRaw.length}] "${comboData.Nombre}" - ${comboData.Tipo}`);
        actualizados++;
      } catch (itemError) {
        console.error(`❌ Error en combo ${i + 1}: ${itemError.message}`);
      }
    }

    console.log(`\n✅ Actualización completada: ${actualizados}/${combosRaw.length} combos actualizados`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Esperar a que se conecte MongoDB
setTimeout(() => {
  updateCombos();
}, 1500);
