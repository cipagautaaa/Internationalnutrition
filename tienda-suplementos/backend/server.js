const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const app = require('./app');

// Conectar a MongoDB y arrancar servidor
const mongoUri = process.env.MONGODB_URI;
const mongoOptions = {};
if (process.env.MONGODB_DB_NAME) {
  mongoOptions.dbName = process.env.MONGODB_DB_NAME;
}

mongoose.connect(mongoUri, mongoOptions)
  .then(() => {
    console.log('Conectado a MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
    console.error('Verifica que MONGODB_URI esté correctamente configurado en .env');
    process.exit(1);
  });
