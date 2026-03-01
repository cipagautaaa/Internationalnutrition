const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  createWompiTransactionHandler,
  verifyWompiHandler,
  wompiWebhookHandler,
  getPaymentMethodsHandler
} = require('../controllers/wompiController');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { createGatewayTransaction } = require('../utils/wompiGateway');
const { verifyWompiTransaction } = require('../utils/wompi');
const { sendNewOrderNotificationToAdmin, sendOrderConfirmationToCustomer } = require('../utils/emailService');

const router = express.Router();

// Rutas de checkout - permiten usuarios autenticados o invitados
router.post('/create-wompi-transaction', optionalAuth, createWompiTransactionHandler);
router.post('/wompi-webhook', wompiWebhookHandler);
router.get('/payment-methods', getPaymentMethodsHandler);
router.get('/verify-transaction/:transactionId', optionalAuth, verifyWompiHandler);

// Nueva ruta para transacciones con modelo Gateway
router.post('/wompi-gateway-transaction', protect, async (req, res) => {
  try {
    const { orderId, cardToken, installments = 1, customerEmail } = req.body;

    // Validar datos requeridos
    if (!orderId || !cardToken) {
      return res.status(400).json({
        success: false,
        message: 'Orden y token de tarjeta son requeridos'
      });
    }

    // Buscar la orden
    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que la orden no esté ya pagada
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Esta orden ya ha sido pagada'
      });
    }

    // Crear la transacción con Wompi Gateway
    const result = await createGatewayTransaction({
      cardToken,
      amount: Math.round(order.totalAmount * 100), // Convertir a centavos
      currency: 'COP',
      customerEmail: customerEmail || req.user.email,
      reference: `ORDER-${orderId}-${Date.now()}`,
      customerData: {
        fullName: order.shippingAddress?.fullName || req.user.name,
        phone: order.shippingAddress?.phone || ''
      },
      installments
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Error procesando el pago',
        code: result.code
      });
    }

    // Actualizar la orden con los datos de la transacción
    order.wompiTransactionId = result.transactionId;
    order.wompiReference = result.reference;
    
    // Actualizar estado según respuesta de Wompi
    if (result.status === 'APPROVED') {
      order.paymentStatus = 'paid';
      order.status = 'processing';
    } else if (result.status === 'PENDING') {
      order.paymentStatus = 'pending';
      // Si hay redirectUrl, el pago requiere 3DS
      if (result.redirectUrl) {
        return res.json({
          success: true,
          requiresRedirect: true,
          redirectUrl: result.redirectUrl,
          transactionId: result.transactionId
        });
      }
    } else if (result.status === 'DECLINED' || result.status === 'ERROR') {
      order.paymentStatus = 'failed';
    }

    await order.save();

    res.json({
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      message: 'Pago procesado exitosamente'
    });

  } catch (error) {
    console.error('Error en wompi-gateway-transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando el pago',
      error: error.message
    });
  }
});

// Obtener estado de pago por orden (ligero helper)
router.get('/payment-status/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    res.json({ success: true, data: { paymentStatus: order.paymentStatus, orderStatus: order.status, totalAmount: order.totalAmount, wompiTransactionId: order.wompiTransactionId, wompiReference: order.wompiReference } });
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo estado del pago' });
  }
});

// ENDPOINT DE RESPALDO: Verificar y finalizar una orden por orderId
// Se usa cuando el webhook de Wompi no procesó correctamente la orden
router.post('/verify-and-finalize', optionalAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId requerido' });
    }

    const order = await Order.findById(orderId).populate('items.product').populate('user');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    // Si la orden ya está procesada, no hacer nada
    if (order.paymentStatus === 'APPROVED' || order.paymentStatus === 'paid' || order.paymentStatus === 'approved') {
      // Pero verificar si los emails se enviaron
      if (!order.emailNotifications?.adminNewOrderSentAt || !order.emailNotifications?.customerConfirmationSentAt) {
        console.log(`📧 [VERIFY-FINALIZE] Orden ${orderId} ya aprobada pero emails pendientes. Enviando...`);
        const userInfo = order.user || order.customerData || {};
        
        if (!order.emailNotifications?.adminNewOrderSentAt) {
          const resAdmin = await sendNewOrderNotificationToAdmin(order, userInfo);
          if (!resAdmin?.queued && !resAdmin?.skipped) {
            order.emailNotifications = order.emailNotifications || {};
            order.emailNotifications.adminNewOrderSentAt = new Date();
          }
        }
        if (!order.emailNotifications?.customerConfirmationSentAt) {
          const resCustomer = await sendOrderConfirmationToCustomer(order, userInfo);
          if (!resCustomer?.queued && !resCustomer?.skipped) {
            order.emailNotifications = order.emailNotifications || {};
            order.emailNotifications.customerConfirmationSentAt = new Date();
          }
        }
        await order.save();
      }
      return res.json({ success: true, message: 'Orden ya procesada', order });
    }

    // Verificar con Wompi el estado real de la transacción
    const reference = order.wompiReference;
    if (!reference) {
      return res.status(400).json({ success: false, message: 'Orden sin referencia Wompi' });
    }

    // Si hay transactionId, verificar directamente
    let transactionStatus = null;
    let transactionId = order.wompiTransactionId;
    
    if (transactionId) {
      const verification = await verifyWompiTransaction(transactionId);
      if (verification.success && verification.transaction) {
        transactionStatus = (verification.transaction.status || '').toUpperCase();
      }
    }

    if (transactionStatus === 'APPROVED') {
      console.log(`✅ [VERIFY-FINALIZE] Transacción ${transactionId} APROBADA por Wompi. Actualizando orden ${orderId}...`);
      
      order.paymentStatus = 'APPROVED';
      order.status = 'processing';
      
      // Descontar stock
      for (const item of order.items) {
        if (item.kind === 'Product') {
          await Product.findByIdAndUpdate(item.product._id || item.product, { $inc: { stock: -item.quantity } });
        }
      }
      
      // Resetear ruleta
      if (order.user) {
        try {
          await User.findByIdAndUpdate(order.user._id || order.user, {
            wheelPrizePending: null,
            wheelLockedUntilPurchase: false,
            wheelSpinAttempts: 0
          });
        } catch (e) {}
      }
      
      // Enviar emails
      const userInfo = order.user || order.customerData || {};
      try {
        if (!order.emailNotifications?.adminNewOrderSentAt) {
          const resAdmin = await sendNewOrderNotificationToAdmin(order, userInfo);
          if (!resAdmin?.queued && !resAdmin?.skipped) {
            order.emailNotifications = order.emailNotifications || {};
            order.emailNotifications.adminNewOrderSentAt = new Date();
          }
        }
        if (!order.emailNotifications?.customerConfirmationSentAt) {
          const resCustomer = await sendOrderConfirmationToCustomer(order, userInfo);
          if (!resCustomer?.queued && !resCustomer?.skipped) {
            order.emailNotifications = order.emailNotifications || {};
            order.emailNotifications.customerConfirmationSentAt = new Date();
          }
        }
        order.emailNotifications = order.emailNotifications || {};
        order.emailNotifications.lastEmailError = null;
      } catch (emailErr) {
        console.error('❌ [VERIFY-FINALIZE] Error enviando emails:', emailErr);
        order.emailNotifications = order.emailNotifications || {};
        order.emailNotifications.lastEmailError = emailErr?.message || String(emailErr);
      }
      
      await order.save();
      return res.json({ success: true, message: 'Orden finalizada exitosamente', order });
    }

    return res.json({ 
      success: false, 
      message: `Transacción no aprobada. Estado: ${transactionStatus || 'desconocido'}`,
      paymentStatus: transactionStatus
    });

  } catch (error) {
    console.error('❌ [VERIFY-FINALIZE] Error:', error);
    res.status(500).json({ success: false, message: 'Error verificando y finalizando orden' });
  }
});

module.exports = router;
