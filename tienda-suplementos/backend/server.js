const mongoose = require('mongoose');

// En producción (Railway), las variables vienen del dashboard.
// Cargar .env solo en desarrollo para no pisar process.env.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ override: true });
}

const app = require('./app');

// Conectar a MongoDB y arrancar servidor
const mongoUri = process.env.MONGODB_URI;
const mongoOptions = {};
if (process.env.MONGODB_DB_NAME) {
  mongoOptions.dbName = process.env.MONGODB_DB_NAME;
}

mongoose.connect(mongoUri, mongoOptions)
  .then(async () => {
    console.log('Conectado a MongoDB');

    // Inicializar código de descuento INTSUPPS20 si no existe
    try {
      const DiscountCode = require('./models/DiscountCode');
      const existingCode = await DiscountCode.findOne({ code: 'INTSUPPS20' });
      if (!existingCode) {
        await DiscountCode.create({
          code: 'INTSUPPS20',
          productDiscount: 20,
          comboDiscount: 5,
          isActive: true,
          description: 'Código de descuento principal - 20% productos, 5% combos'
        });
        console.log('✅ Código INTSUPPS20 creado automáticamente');
      } else {
        console.log('ℹ️ Código INTSUPPS20 ya existe en la base de datos');
      }
    } catch (e) {
      console.warn('⚠️ No se pudo inicializar código INTSUPPS20:', e?.message || e);
    }

    // Worker de reintentos de emails (outbox)
    try {
      const { startEmailOutboxWorker } = require('./utils/emailService');
      startEmailOutboxWorker();
    } catch (e) {
      console.warn('⚠️ No se pudo iniciar EmailOutbox worker:', e?.message || e);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
    console.error('Verifica que MONGODB_URI esté correctamente configurado en .env');
    process.exit(1);
  });
