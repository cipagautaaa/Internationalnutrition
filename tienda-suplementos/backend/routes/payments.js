const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createWompiTransactionHandler,
  verifyWompiHandler,
  wompiWebhookHandler,
  getPaymentMethodsHandler
} = require('../controllers/wompiController');
const Order = require('../models/Order');
const { createGatewayTransaction } = require('../utils/wompiGateway');

const router = express.Router();

// Delegar a los handlers centralizados
router.post('/create-wompi-transaction', protect, createWompiTransactionHandler);
router.post('/wompi-webhook', wompiWebhookHandler);
router.get('/payment-methods', getPaymentMethodsHandler);
router.get('/verify-transaction/:transactionId', protect, verifyWompiHandler);

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

module.exports = router;
