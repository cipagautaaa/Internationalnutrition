/**
 * Script one-time: actualiza la orden del 29 de abril a APPROVED
 * y envía confirmación al cliente.
 * Uso: node fix-order-apr29.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });
  console.log('✅ Conectado a MongoDB');

  require('./models/Product');
  require('./models/Combo');
  require('./models/Implement');
  const Order = require('./models/Order');
  const { sendOrderConfirmationToCustomer } = require('./utils/emailService');

  const order = await Order.findById('69f228ab1c8476b6f7404cd3')
    .populate('user')
    .populate('items.product');

  if (!order) {
    console.error('❌ Orden no encontrada');
    process.exit(1);
  }

  console.log('📦 Orden encontrada:');
  console.log('   ID:', order._id);
  console.log('   Estado actual:', order.paymentStatus, '/', order.status);
  console.log('   Total:', order.totalAmount?.toLocaleString('es-CO'));
  console.log('   Items:', order.items.map(i => `${i.product?.name || 'N/A'} x${i.quantity}`).join(', '));
  console.log('   Admin notificado:', order.emailNotifications?.adminNewOrderSentAt || 'NO');
  console.log('   Cliente notificado:', order.emailNotifications?.customerConfirmationSentAt || 'NO');
  console.log('');

  // Actualizar estado a APPROVED
  if (order.paymentStatus !== 'APPROVED' && order.paymentStatus !== 'paid') {
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          paymentStatus: 'APPROVED',
          status: 'processing',
          wompiTransactionId: '1363419-1777478326-62602'
        }
      }
    );
    console.log('✅ Estado de la orden actualizado a APPROVED / processing');
  } else {
    console.log('ℹ️  La orden ya está en estado:', order.paymentStatus);
  }

  // Enviar confirmación al cliente si no se ha enviado
  if (!order.emailNotifications?.customerConfirmationSentAt) {
    const userInfo = order.user || order.customerData || {};
    console.log('📧 Enviando confirmación al cliente:', userInfo.email || order.customerData?.email);

    try {
      const res = await sendOrderConfirmationToCustomer(order, userInfo);
      if (res?.skipped) {
        console.log('⚠️  Email del cliente skipped:', res.reason);
      } else if (res?.queued) {
        console.log('📮 Email del cliente encolado:', res.jobId);
      } else {
        console.log('✅ Confirmación del cliente enviada. MessageId:', res?.messageId);
        await Order.updateOne(
          { _id: order._id },
          { $set: { 'emailNotifications.customerConfirmationSentAt': new Date() } }
        );
        console.log('✅ Orden actualizada con timestamp de envío al cliente');
      }
    } catch (err) {
      console.error('❌ Error enviando email al cliente:', err.message);
    }
  } else {
    console.log('ℹ️  Cliente ya fue notificado el:', order.emailNotifications.customerConfirmationSentAt);
  }

  await mongoose.connection.close();
  console.log('🔒 Conexión cerrada');
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
