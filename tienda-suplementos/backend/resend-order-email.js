/**
 * Script para reenviar el email de notificación al admin para una orden específica.
 * 
 * Uso:
 *   node resend-order-email.js <orderId_o_referencia>
 * 
 * Ejemplo:
 *   node resend-order-email.js 69e52d475b971ffcf9466d2f
 *   node resend-order-email.js ORDER_69e52d475b971ffcf9466d2f
 * 
 * Requiere: archivo .env con MONGODB_URI y credenciales de email configuradas
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Uso: node resend-order-email.js <orderId_o_referencia>');
    process.exit(1);
  }

  // Determinar si es orderId o referencia
  const isReference = input.startsWith('ORDER_');
  const orderId = isReference ? input.replace('ORDER_', '') : input;

  console.log(`🔍 Buscando orden: ${input}`);

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI no configurado en .env');
    process.exit(1);
  }

  const mongoOptions = {};
  if (process.env.MONGODB_DB_NAME) {
    mongoOptions.dbName = process.env.MONGODB_DB_NAME;
  }

  await mongoose.connect(mongoUri, mongoOptions);
  console.log('✅ Conectado a MongoDB');

  const Order = require('./models/Order');
  // Registrar modelos referenciados por refPath en Order.items.kind
  require('./models/Product');
  require('./models/Combo');
  require('./models/Implement');
  const { sendNewOrderNotificationToAdmin } = require('./utils/emailService');

  // Buscar por _id o por wompiReference
  let order = null;
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findById(orderId).populate('user').populate('items.product');
  }
  if (!order) {
    order = await Order.findOne({ wompiReference: input }).populate('user').populate('items.product');
  }
  if (!order) {
    order = await Order.findOne({ wompiReference: `ORDER_${orderId}` }).populate('user').populate('items.product');
  }

  if (!order) {
    console.error(`❌ Orden no encontrada: ${input}`);
    await mongoose.connection.close();
    process.exit(1);
  }

  console.log(`✅ Orden encontrada:`);
  console.log(`   ID: ${order._id}`);
  console.log(`   Referencia: ${order.wompiReference || 'N/A'}`);
  console.log(`   Total: $${order.totalAmount?.toLocaleString('es-CO')}`);
  console.log(`   Estado pago: ${order.paymentStatus}`);
  console.log(`   Cliente: ${order.customerData?.fullName || 'N/A'}`);
  console.log(`   Email cliente: ${order.customerData?.email || 'N/A'}`);
  console.log(`   Admin notificado: ${order.emailNotifications?.adminNewOrderSentAt || '❌ NO'}`);
  console.log(`   Cliente notificado: ${order.emailNotifications?.customerConfirmationSentAt || '❌ NO'}`);
  console.log('');

  const userInfo = order.user || order.customerData || {};

  console.log('📧 Enviando notificación al admin...');
  try {
    const result = await sendNewOrderNotificationToAdmin(order, userInfo);
    
    if (result?.skipped) {
      console.log('⚠️ Email skipped (provider no configurado). Resultado:', result);
    } else if (result?.queued) {
      console.log('📮 Email encolado para reintento. Resultado:', result);
    } else {
      console.log('✅ Email enviado exitosamente!');
      console.log('   MessageId:', result?.messageId);

      // Actualizar la orden
      await Order.updateOne(
        { _id: order._id },
        { $set: { 
          'emailNotifications.adminNewOrderSentAt': new Date(),
          'emailNotifications.lastEmailError': null
        }}
      );
      console.log('✅ Orden actualizada con timestamp de envío');
    }
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
  }

  await mongoose.connection.close();
  console.log('🔒 Conexión cerrada');
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
