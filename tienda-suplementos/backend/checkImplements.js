require('dotenv').config();
const mongoose = require('mongoose');
const Implement = require('./models/Implement');

async function checkImplements() {
  try {
    console.log('Conectando a MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    console.log('Base de datos actual:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);

    // Contar documentos
    const count = await Implement.countDocuments();
    console.log(`\nTotal de Wargo y accesorios para gym en la colección: ${count}`);

    // Listar todos los accesorios para gym
    if (count > 0) {
      const implements = await Implement.find({}).limit(10);
      console.log('\nPrimeros 10 accesorios para gym:');
      implements.forEach(impl => {
        console.log(`- ${impl.name} (ID: ${impl._id})`);
      });
    } else {
      console.log('\n⚠️ La colección está vacía');
    }

    // Verificar las colecciones disponibles
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nColecciones en la base de datos:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConexión cerrada');
  }
}

checkImplements();
