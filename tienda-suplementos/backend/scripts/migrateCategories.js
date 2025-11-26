// Script de migración para actualizar categorías legacy a las nuevas
// Uso (ejecutar desde la carpeta backend):
//   node scripts/migrateCategories.js
// Asegúrate de tener configurada la variable MONGODB_URI o de editar la constante.

const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda';

const MAP = {
  'Proteínas': 'Proteína',
  'Pre-Workout': 'Pre Entreno',
  'Otros': 'Complementos'
};

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    const legacyKeys = Object.keys(MAP);
    const products = await Product.find({ category: { $in: legacyKeys } });
    if (!products.length) {
      console.log('No se encontraron productos con categorías legacy. Nada que hacer.');
      process.exit(0);
    }

    let updated = 0;
    for (const p of products) {
      const newCat = MAP[p.category];
      if (newCat) {
        p.category = newCat;
        try {
          await p.save();
          updated++;
          console.log(`Actualizado: ${p.name} -> ${newCat}`);
        } catch (err) {
          console.error(`Error actualizando ${p._id}:`, err.message);
        }
      }
    }

    console.log(`\nMigración completada. Productos actualizados: ${updated}`);
    process.exit(0);
  } catch (e) {
    console.error('Error en migración:', e);
    process.exit(1);
  }
})();
