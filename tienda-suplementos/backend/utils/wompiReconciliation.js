/**
 * Job de reconciliación de pagos Wompi.
 *
 * Problema que resuelve:
 *   Cuando Wompi aprueba un pago pero el webhook no llega al backend (o falla),
 *   la orden queda en estado "pending" de forma indefinida y no se envían emails.
 *
 * Solución:
 *   Cada WOMPI_RECONCILIATION_INTERVAL_MS (default 5 min) este job:
 *   1. Busca órdenes con paymentMethod=wompi, paymentStatus=pending, creadas hace >5 min.
 *   2. Para cada una consulta el estado real en Wompi API (por referencia o transactionId).
 *   3. Si está APPROVED: actualiza la orden, descuenta stock y envía correos.
 *   4. Si está DECLINED/ERROR: marca la orden como fallida.
 *
 * Variables de entorno opcionales:
 *   WOMPI_RECONCILIATION=true|false  (default: true en producción)
 *   WOMPI_RECONCILIATION_INTERVAL_MS (default: 300000 = 5 min)
 *   WOMPI_RECONCILIATION_MIN_AGE_MS  (default: 300000 = 5 min, evita procesar órdenes muy recientes)
 *   WOMPI_RECONCILIATION_MAX_ORDERS  (default: 20, máximo por ciclo)
 */

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyWompiTransaction, searchTransactionByReference } = require('./wompi');
const { sendNewOrderNotificationToAdmin, sendOrderConfirmationToCustomer } = require('./emailService');

// ----- Helpers (misma lógica que wompiController.js, idempotentes) -----

const deductStockOnce = async (order) => {
  const locked = await Order.findOneAndUpdate(
    { _id: order._id, stockDeducted: { $ne: true } },
    { $set: { stockDeducted: true } },
    { new: true }
  );
  if (!locked) {
    console.log(`⚠️ [Reconciliation] Stock ya descontado para orden ${order._id}. Saltando.`);
    return false;
  }
  for (const item of order.items) {
    if (item.kind === 'Product') {
      await Product.findByIdAndUpdate(
        item.product?._id || item.product,
        { $inc: { stock: -item.quantity } }
      ).catch(e => console.warn('⚠️ Error descontando stock:', e?.message));
    }
  }
  console.log(`✅ [Reconciliation] Stock descontado para orden ${order._id}`);
  return true;
};

const DiscountCode = require('../models/DiscountCode');
const applyDiscountCodeUsageOnce = async (order) => {
  if (!order || !order.discountCode || order.discountCodeUsageApplied) return;
  try {
    const discountCodeDoc = await DiscountCode.findOne({ code: order.discountCode });
    if (discountCodeDoc) {
      await discountCodeDoc.incrementUsage();
      order.discountCodeUsageApplied = true;
    }
  } catch (e) {
    console.warn('⚠️ [Reconciliation] Error registrando uso de código descuento:', e?.message);
  }
};

// ----- Procesamiento de una orden aprobada -----

const processApprovedOrder = async (order, transactionId, transactionData) => {
  try {
    console.log(`🔄 [Reconciliation] Procesando orden APROBADA: ${order._id} (tx: ${transactionId})`);

    // Actualizar transactionId si no estaba
    const updates = {
      paymentStatus: 'APPROVED',
      status: 'processing'
    };
    if (!order.wompiTransactionId && transactionId) {
      updates.wompiTransactionId = transactionId;
    }
    await Order.updateOne({ _id: order._id }, { $set: updates });
    order.paymentStatus = 'APPROVED';
    order.status = 'processing';
    if (!order.wompiTransactionId && transactionId) {
      order.wompiTransactionId = transactionId;
    }

    await applyDiscountCodeUsageOnce(order);
    await deductStockOnce(order);

    // Resetear ruleta del usuario si aplica
    if (order.user) {
      await User.findByIdAndUpdate(order.user, {
        wheelPrizePending: null,
        wheelLockedUntilPurchase: false,
        wheelSpinAttempts: 0
      }).catch(e => console.warn('⚠️ [Reconciliation] Error reseteando ruleta:', e?.message));
    }

    // Poblar campos para los emails
    await order.populate('items.product').catch(() => {});
    const userInfo = order.user || order.customerData || {};

    const emailUpdates = {};

    if (!order.emailNotifications?.adminNewOrderSentAt) {
      console.log(`📧 [Reconciliation] Enviando email al admin para orden ${order._id}...`);
      const resAdmin = await sendNewOrderNotificationToAdmin(order, userInfo);
      if (!resAdmin?.queued && !resAdmin?.skipped) {
        emailUpdates['emailNotifications.adminNewOrderSentAt'] = new Date();
        console.log(`✅ [Reconciliation] Email admin enviado para orden ${order._id}`);
      } else {
        console.log(`📮 [Reconciliation] Email admin encolado/skipped para orden ${order._id}:`, resAdmin?.reason || '');
      }
    } else {
      console.log(`↩️ [Reconciliation] Admin ya notificado para orden ${order._id}`);
    }

    if (!order.emailNotifications?.customerConfirmationSentAt) {
      console.log(`📧 [Reconciliation] Enviando email al cliente para orden ${order._id}...`);
      const resCustomer = await sendOrderConfirmationToCustomer(order, userInfo);
      if (!resCustomer?.queued && !resCustomer?.skipped) {
        emailUpdates['emailNotifications.customerConfirmationSentAt'] = new Date();
        console.log(`✅ [Reconciliation] Email cliente enviado para orden ${order._id}`);
      } else {
        console.log(`📮 [Reconciliation] Email cliente encolado/skipped para orden ${order._id}:`, resCustomer?.reason || '');
      }
    } else {
      console.log(`↩️ [Reconciliation] Cliente ya notificado para orden ${order._id}`);
    }

    if (Object.keys(emailUpdates).length > 0) {
      emailUpdates['emailNotifications.lastEmailError'] = null;
      await Order.updateOne({ _id: order._id }, { $set: emailUpdates });
    }

    console.log(`✅ [Reconciliation] Orden ${order._id} procesada exitosamente.`);
    return { processed: true };
  } catch (err) {
    console.error(`❌ [Reconciliation] Error procesando orden ${order._id}:`, err?.message || err);
    return { error: err?.message || String(err) };
  }
};

// ----- Job principal -----

const reconcileWompiPendingOrders = async () => {
  const minAgeMs = Number(process.env.WOMPI_RECONCILIATION_MIN_AGE_MS || 5 * 60_000);
  const maxOrders = Number(process.env.WOMPI_RECONCILIATION_MAX_ORDERS || 20);
  const cutoff = new Date(Date.now() - minAgeMs);

  let pendingOrders;
  try {
    pendingOrders = await Order.find({
      paymentMethod: { $in: ['wompi', 'wompi_card'] },
      paymentStatus: 'pending',
      wompiReference: { $exists: true, $ne: null },
      createdAt: { $lt: cutoff }
    })
      .populate('user')
      .populate('items.product')
      .limit(maxOrders)
      .lean(false); // needed to use populate later
  } catch (err) {
    console.error('❌ [Reconciliation] Error consultando órdenes pendientes:', err?.message);
    return;
  }

  if (!pendingOrders || pendingOrders.length === 0) {
    console.log('✅ [Reconciliation] Sin órdenes pendientes para reconciliar.');
    return;
  }

  console.log(`🔄 [Reconciliation] Verificando ${pendingOrders.length} órdenes pendientes con Wompi...`);

  for (const order of pendingOrders) {
    try {
      let transaction = null;
      let transactionId = order.wompiTransactionId;

      // Estrategia 1: verificar por transactionId si ya lo tenemos
      if (transactionId) {
        const result = await verifyWompiTransaction(transactionId);
        if (result.success && result.transaction) {
          transaction = result.transaction;
        }
      }

      // Estrategia 2: buscar por referencia (más común en checkout con widget)
      if (!transaction && order.wompiReference) {
        const searchResult = await searchTransactionByReference(order.wompiReference);
        if (searchResult.success && searchResult.transactions.length > 0) {
          // Tomar la transacción más reciente con estado APPROVED si existe, sino la primera
          const approved = searchResult.transactions.find(t => (t.status || '').toUpperCase() === 'APPROVED');
          transaction = approved || searchResult.transactions[0];
          transactionId = transaction?.id;
        }
      }

      if (!transaction) {
        console.warn(`⚠️ [Reconciliation] No se encontró transacción Wompi para orden ${order._id} (ref: ${order.wompiReference})`);
        continue;
      }

      const status = (transaction.status || '').toUpperCase();
      console.log(`📊 [Reconciliation] Orden ${order._id} → Wompi status: ${status}`);

      if (status === 'APPROVED') {
        await processApprovedOrder(order, transactionId, transaction);

      } else if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
        console.log(`❌ [Reconciliation] Orden ${order._id} → marcando como fallida (${status})`);
        await Order.updateOne(
          { _id: order._id },
          { $set: { paymentStatus: 'failed', status: 'cancelled' } }
        );
      } else {
        // PENDING u otro estado: dejar como está, se revisará en el próximo ciclo
        console.log(`⏳ [Reconciliation] Orden ${order._id} → estado Wompi "${status}", esperando...`);
      }

    } catch (orderErr) {
      console.error(`❌ [Reconciliation] Error procesando orden ${order._id}:`, orderErr?.message || orderErr);
    }
  }

  console.log('✅ [Reconciliation] Ciclo completado.');
};

// ----- Scheduler -----

let reconciliationIntervalHandle = null;

const startWompiReconciliationJob = () => {
  const enabled = String(
    process.env.WOMPI_RECONCILIATION || (process.env.NODE_ENV === 'production' ? 'true' : 'false')
  ) === 'true';

  if (!enabled) {
    console.log('ℹ️ [Reconciliation] Job deshabilitado (WOMPI_RECONCILIATION != true)');
    return;
  }
  if (reconciliationIntervalHandle) return;

  const intervalMs = Number(process.env.WOMPI_RECONCILIATION_INTERVAL_MS || 5 * 60_000);

  console.log(`🔄 [Reconciliation] Job iniciado. Intervalo: ${intervalMs / 1000}s`);

  // Primera ejecución 90 segundos después del arranque para no solapar con el startup
  setTimeout(() => {
    reconcileWompiPendingOrders().catch(e =>
      console.warn('⚠️ [Reconciliation] Kick error:', e?.message || e)
    );
    reconciliationIntervalHandle = setInterval(() => {
      reconcileWompiPendingOrders().catch(e =>
        console.warn('⚠️ [Reconciliation] Tick error:', e?.message || e)
      );
    }, intervalMs);
  }, 90_000);
};

module.exports = { startWompiReconciliationJob, reconcileWompiPendingOrders };
