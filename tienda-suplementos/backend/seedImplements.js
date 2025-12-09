 require('dotenv').config();
const mongoose = require('mongoose');
const Implement = require('./models/Implement');
const implementsData = require('./implementos_raw.json');

async function seedImplements() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar la colección de Wargo y accesorios para gym
    console.log('Limpiando colección de Wargo y accesorios para gym...');
    await Implement.deleteMany({});
    console.log('✅ Colección limpiada');

    // Transformar los datos del JSON al formato del modelo
    const implements = implementsData.map(item => ({
      name: item.PRODUCTO.trim(),
      price: item.PRECIO,
      size: '', // No hay información de tamaño en el JSON
      isActive: true
    }));

    // Insertar los accesorios para gym
    console.log(`Insertando ${implements.length} Wargo y accesorios para gym...`);
    const result = await Implement.insertMany(implements);
    console.log(`✅ ${result.length} Wargo y accesorios para gym insertados correctamente`);

    // Mostrar algunos ejemplos
    console.log('\nEjemplos de Wargo y accesorios para gym insertados:');
    result.slice(0, 5).forEach(impl => {
      console.log(`- ${impl.name} (ID: ${impl._id})`);
    });

    console.log('\n✅ Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error al importar Wargo y accesorios para gym:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

seedImplements();
