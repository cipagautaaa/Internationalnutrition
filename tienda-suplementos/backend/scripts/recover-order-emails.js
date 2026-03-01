/**
 * Script de recuperación de emails para órdenes que no recibieron notificaciones.
 * 
 * Uso:
 *   node scripts/recover-order-emails.js                        # Recupera todas las órdenes APPROVED sin emails
 *   node scripts/recover-order-emails.js ORDER_69a465b441bab0f2d2f19306  # Recupera una orden específica por referencia
 *   node scripts/recover-order-emails.js 69a465b441bab0f2d2f19306        # Recupera por ObjectId
 * 
 * Este script:
 * 1. Busca órdenes con paymentStatus APPROVED/paid pero sin emails enviados
 * 2. Verifica con Wompi que el pago está aprobado
 * 3. Envía los emails de confirmación (admin + cliente)
 * 4. Actualiza la orden con las fechas de envío
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyWompiTransaction } = require('../utils/wompi');
const { sendNewOrderNotificationToAdmin, sendOrderConfirmationToCustomer } = require('../utils/emailService');

const MONGODB_URI = process.env.MONGODB_URI;

async function recoverOrderEmails(targetRef) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    let orders;

    if (targetRef) {
      // Buscar orden específica
      const cleanRef = targetRef.replace('ORDER_', '');
      orders = await Order.find({
        $or: [
          { wompiReference: targetRef },
          { wompiReference: `ORDER_${cleanRef}` },
          { _id: mongoose.Types.ObjectId.isValid(cleanRef) ? cleanRef : null }
        ].filter(q => q._id !== null || q.wompiReference)
      }).populate('items.product').populate('user');
      
      if (orders.length === 0) {
        // Intentar buscar por ID directamente
        try {
          const order = await Order.findById(cleanRef).populate('items.product').populate('user');
          if (order) orders = [order];
        } catch (e) {}
      }
    } else {
      // Buscar todas las órdenes aprobadas sin emails
      orders = await Order.find({
        paymentStatus: { $in: ['APPROVED', 'paid', 'approved'] },
        $or: [
          { 'emailNotifications.adminNewOrderSentAt': null },
          { 'emailNotifications.customerConfirmationSentAt': null },
          { 'emailNotifications': { $exists: false } }
        ]
      }).populate('items.product').populate('user');
    }

    console.log(`\n📋 Órdenes encontradas: ${orders.length}\n`);

    for (const order of orders) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Orden: ${order._id}`);
      console.log(`   Referencia Wompi: ${order.wompiReference || 'N/A'}`);
      console.log(`   Transaction ID: ${order.wompiTransactionId || 'N/A'}`);
      console.log(`   Estado pago: ${order.paymentStatus}`);
      console.log(`   Estado orden: ${order.status}`);
      console.log(`   Total: $${order.totalAmount?.toLocaleString('es-CO')} COP`);
      console.log(`   Cliente: ${order.customerData?.fullName || 'N/A'} (${order.customerData?.email || 'N/A'})`);
      console.log(`   Teléfono: ${order.customerData?.phoneNumber || 'N/A'}`);
      console.log(`   Dirección: ${order.shippingAddress?.street || 'N/A'}, ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'}`);
      console.log(`   Email admin enviado: ${order.emailNotifications?.adminNewOrderSentAt || '❌ NO'}`);
      console.log(`   Email cliente enviado: ${order.emailNotifications?.customerConfirmationSentAt || '❌ NO'}`);
      console.log(`   Creada: ${order.createdAt}`);
      
      // Lista de productos
      console.log('\n   Productos:');
      for (const item of order.items) {
        const productName = item.product?.name || 'Producto eliminado';
        console.log(`     - ${productName} x${item.quantity} = $${(item.price * item.quantity).toLocaleString('es-CO')}`);
      }

      // Si el pago no está confirmado como APPROVED, verificar con Wompi
      if (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') {
        if (order.wompiTransactionId) {
          console.log(`\n   🔍 Verificando con Wompi...`);
          const result = await verifyWompiTransaction(order.wompiTransactionId);
          if (result.success && result.transaction) {
            const status = (result.transaction.status || '').toUpperCase();
            console.log(`   📊 Estado en Wompi: ${status}`);
            
            if (status === 'APPROVED') {
              console.log(`   ✅ Pago confirmado por Wompi. Actualizando orden...`);
              order.paymentStatus = 'APPROVED';
              order.status = 'processing';
              
              // Descontar stock si no se ha hecho
              for (const item of order.items) {
                if (item.kind === 'Product' && item.product) {
                  await Product.findByIdAndUpdate(item.product._id || item.product, { $inc: { stock: -item.quantity } });
                  console.log(`     📦 Stock descontado: ${item.product.name || item.product} x${item.quantity}`);
                }
              }
              
              await order.save();
            } else {
              console.log(`   ⚠️ Pago NO aprobado en Wompi (${status}). Saltando emails.`);
              continue;
            }
          } else {
            console.log(`   ❌ No se pudo verificar con Wompi: ${result.error}`);
            continue;
          }
        } else {
          console.log(`   ⚠️ Sin transactionId de Wompi. No se puede verificar.`);
          continue;
        }
      }

      // Enviar emails
      const userInfo = order.user || order.customerData || {};
      
      if (!order.emailNotifications?.adminNewOrderSentAt) {
        console.log(`\n   📧 Enviando notificación al admin...`);
        try {
          const resAdmin = await sendNewOrderNotificationToAdmin(order, userInfo);
          if (!resAdmin?.queued && !resAdmin?.skipped) {
            order.emailNotifications = order.emailNotifications || {};
            order.emailNotifications.adminNewOrderSentAt = new Date();
            console.log(`   ✅ Email admin enviado`);
          } else {
            console.log(`   📮 Email admin encolado/skipped:`, resAdmin);
          }
        } catch (e) {
          console.error(`   ❌ Error email admin:`, e.message);
        }
      }
      
      if (!order.emailNotifications?.customerConfirmationSentAt) {
        console.log(`   📧 Enviando confirmación al cliente (${order.customerData?.email || userInfo?.email})...`);
        try {
          const resCustomer = await sendOrderConfirmationToCustomer(order, userInfo);
          if (!resCustomer?.queued && !resCustomer?.skipped) {
            order.emailNotifications = order.emailNotifications || {};
            order.emailNotifications.customerConfirmationSentAt = new Date();
            console.log(`   ✅ Email cliente enviado`);
          } else {
            console.log(`   📮 Email cliente encolado/skipped:`, resCustomer);
          }
        } catch (e) {
          console.error(`   ❌ Error email cliente:`, e.message);
        }
      }
      
      order.emailNotifications = order.emailNotifications || {};
      order.emailNotifications.lastEmailError = null;
      await order.save();
      console.log(`   ✅ Orden actualizada`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Proceso de recuperación completado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar
const targetRef = process.argv[2] || null;
recoverOrderEmails(targetRef);
