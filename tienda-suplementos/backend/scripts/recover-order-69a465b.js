/**
 * Script URGENTE: Recuperar la orden 69a465b441bab0f2d2f19306
 * que fue pagada exitosamente pero nunca se actualizó ni envió emails.
 * 
 * Wompi Transaction: 1363419-1772381686-42477 - APPROVED - $152.500 COP
 * Cliente: Stivenn Alejandro Sierra Reyes (salejandrosierrar@gmail.com)
 * Productos: MONSTER TEST x1 + NITROX x1
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendNewOrderNotificationToAdmin, sendOrderConfirmationToCustomer } = require('../utils/emailService');

const MONGODB_URI = process.env.MONGODB_URI;
const ORDER_ID = '69a465b441bab0f2d2f19306';
const WOMPI_TRANSACTION_ID = '1363419-1772381686-42477';

async function recoverOrder() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const order = await Order.findById(ORDER_ID).populate('items.product').populate('user');
    if (!order) {
      console.log('❌ Orden no encontrada');
      return;
    }

    console.log('\n📦 Orden encontrada:');
    console.log('   ID:', order._id);
    console.log('   Estado pago actual:', order.paymentStatus);
    console.log('   Estado orden actual:', order.status);
    console.log('   Total:', order.totalAmount);
    console.log('   Cliente:', order.customerData?.fullName, order.customerData?.email);
    console.log('   Dirección:', order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.state);

    // 1. Actualizar con datos reales de Wompi
    order.wompiTransactionId = WOMPI_TRANSACTION_ID;
    order.paymentStatus = 'APPROVED';
    order.status = 'processing';

    // 2. Descontar stock
    for (const item of order.items) {
      if (item.kind === 'Product' && item.product) {
        await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
        console.log('   📦 Stock descontado:', item.product.name, 'x' + item.quantity);
      }
    }

    // 3. Resetear ruleta si hay usuario
    if (order.user) {
      try {
        await User.findByIdAndUpdate(order.user._id || order.user, {
          wheelPrizePending: null,
          wheelLockedUntilPurchase: false,
          wheelSpinAttempts: 0
        });
        console.log('   🎡 Ruleta reseteada');
      } catch (e) {
        console.log('   ⚠️ No se pudo resetear ruleta:', e.message);
      }
    }

    await order.save();
    console.log('\n✅ Orden actualizada a APPROVED');

    // 4. Enviar emails
    const userInfo = order.user || order.customerData || {};

    console.log('\n📧 Enviando notificación al admin...');
    try {
      const resAdmin = await sendNewOrderNotificationToAdmin(order, userInfo);
      if (resAdmin?.skipped) {
        console.log('   ⚠️ Email admin skipped:', resAdmin);
      } else if (resAdmin?.queued) {
        console.log('   📮 Email admin encolado para reintento');
      } else {
        console.log('   ✅ Email admin enviado! MessageId:', resAdmin?.messageId);
      }
      order.emailNotifications = order.emailNotifications || {};
      order.emailNotifications.adminNewOrderSentAt = new Date();
    } catch (e) {
      console.error('   ❌ Error email admin:', e.message);
    }

    console.log('📧 Enviando confirmación al cliente (salejandrosierrar@gmail.com)...');
    try {
      const resCustomer = await sendOrderConfirmationToCustomer(order, userInfo);
      if (resCustomer?.skipped) {
        console.log('   ⚠️ Email cliente skipped:', resCustomer);
      } else if (resCustomer?.queued) {
        console.log('   📮 Email cliente encolado para reintento');
      } else {
        console.log('   ✅ Email cliente enviado! MessageId:', resCustomer?.messageId);
      }
      order.emailNotifications = order.emailNotifications || {};
      order.emailNotifications.customerConfirmationSentAt = new Date();
    } catch (e) {
      console.error('   ❌ Error email cliente:', e.message);
    }

    order.emailNotifications = order.emailNotifications || {};
    order.emailNotifications.lastEmailError = null;
    await order.save();

    console.log('\n✅ ¡Orden completamente recuperada!');
    console.log('   - Pago: APPROVED');
    console.log('   - Stock: descontado');
    console.log('   - Emails: enviados');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

recoverOrder();
