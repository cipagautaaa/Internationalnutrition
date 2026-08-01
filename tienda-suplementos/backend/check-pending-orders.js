/**
 * Script de diagnóstico: lista órdenes pending de Wompi que podrían tener pago aprobado.
 * También corre el job de reconciliación manualmente para verificar contra la API de Wompi.
 * Uso: node check-pending-orders.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });
  console.log('✅ Conectado a MongoDB\n');

  require('./models/Product');
  require('./models/Combo');
  require('./models/Implement');
  const Order = require('./models/Order');

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const orders = await Order.find({
    paymentMethod: { $in: ['wompi', 'wompi_card'] },
    paymentStatus: 'pending',
    wompiReference: { $exists: true, $ne: null },
    createdAt: { $lt: fiveMinutesAgo }
  }).select('_id wompiReference wompiTransactionId customerData totalAmount createdAt emailNotifications').lean();

  console.log(`📋 Órdenes pending con referencia Wompi: ${orders.length}\n`);

  if (orders.length === 0) {
    console.log('✅ No hay órdenes pendientes que necesiten reconciliación.');
    await mongoose.connection.close();
    return;
  }

  for (const o of orders) {
    console.log(`  - ID: ${o._id}`);
    console.log(`    Referencia: ${o.wompiReference}`);
    console.log(`    TransactionId: ${o.wompiTransactionId || 'NO GUARDADO'}`);
    console.log(`    Total: $${(o.totalAmount || 0).toLocaleString('es-CO')}`);
    console.log(`    Cliente: ${o.customerData?.email || 'sin email'}`);
    console.log(`    Fecha: ${new Date(o.createdAt).toLocaleDateString('es-CO')}`);
    console.log(`    Admin notificado: ${o.emailNotifications?.adminNewOrderSentAt ? 'SÍ' : 'NO'}`);
    console.log('');
  }

  // Correr reconciliación para verificar estado real en Wompi
  console.log('🔄 Ejecutando reconciliación contra Wompi API...\n');
  process.env.WOMPI_RECONCILIATION = 'true';
  const { reconcileWompiPendingOrders } = require('./utils/wompiReconciliation');
  await reconcileWompiPendingOrders();

  await mongoose.connection.close();
  console.log('\n🔒 Conexión cerrada');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
