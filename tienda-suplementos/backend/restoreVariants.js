const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function restoreVariants() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Conectado a MongoDB');

    // Buscar todos los productos inactivos que son variantes
    const inactiveVariants = await Product.find({
      $or: [
        { isActive: false },
        { isActive: { $exists: false } }
      ]
    });

    console.log(`\nEncontrados ${inactiveVariants.length} productos para revisar`);

    let restored = 0;
    let alreadyActive = 0;

    for (const variant of inactiveVariants) {
      if (variant.isActive === false) {
        variant.isActive = true;
        await variant.save();
        restored++;
        console.log(`✓ Restaurado: ${variant.name} - ${variant.size}`);
      } else {
        alreadyActive++;
      }
    }

    console.log(`\n=== Resumen ===`);
    console.log(`Productos restaurados: ${restored}`);
    console.log(`Ya estaban activos: ${alreadyActive}`);
    console.log(`Total procesados: ${inactiveVariants.length}`);

    // Mostrar estadísticas por categoría
    const stats = await Product.aggregate([
      {
        $match: {
          $or: [
            { isActive: true },
            { isActive: { $exists: false } }
          ]
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n=== Productos activos por categoría ===');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} productos`);
    });

    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

restoreVariants();
