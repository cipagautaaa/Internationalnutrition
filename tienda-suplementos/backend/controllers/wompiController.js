const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Combo = require('../models/Combo');
const Implement = require('../models/Implement');
const { sendNewOrderNotificationToAdmin, sendOrderConfirmationToCustomer } = require('../utils/emailService');
const {
  createWompiTransaction,
  verifyWompiTransaction,
  processWompiWebhook,
  getAvailablePaymentMethods
} = require('../utils/wompi');

// Handler para crear transacción (compatible con llamadas desde /api/payments o /api/wompi)
const createWompiTransactionHandler = async (req, res) => {
  try {
    console.log('📥 Recibiendo datos para transacción Wompi:', req.body);
    const { items, shippingAddress, customerData } = req.body;
    const discountFromClient = req.body.discount || null;
    const discountCode = (discountFromClient?.code || req.body.discountCode || '').toString().trim().toUpperCase();
    
    if (!items || items.length === 0) {
      console.log('❌ Error: No hay items en el carrito');
      return res.status(400).json({
        success: false,
        message: 'No hay productos en el carrito'
      });
    }

    // Procesar y validar productos
    let totalAmount = 0;
    let productSubtotal = 0;
    let comboSubtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = item.productId || item.id || item._id;
      let product = null;
      let combo = null;
      let implement = null;
      let kind = 'Product';

      try {
        if (mongoose.Types.ObjectId.isValid(productId)) {
          product = await Product.findById(productId);
        }
        if (!product) {
          product = await Product.findOne({
            $or: [
              { sku: productId },
              { legacy_id: productId },
              { id: productId }
            ]
          });
        }
        // Si no es producto, intentar como combo
        if (!product) {
          if (mongoose.Types.ObjectId.isValid(productId)) {
            combo = await Combo.findById(productId);
          }
          if (!combo) {
            combo = await Combo.findOne({ name: item.name });
          }
          if (combo) {
            kind = 'Combo';
          }
        }

        // Si tampoco es combo, intentar como implemento (Wargo y accesorios)
        if (!product && !combo) {
          if (mongoose.Types.ObjectId.isValid(productId)) {
            implement = await Implement.findById(productId);
          }
          if (!implement) {
            implement = await Implement.findOne({ name: item.name });
          }
          if (implement) {
            kind = 'Implement';
          }
        }
      } catch (error) {
        console.error('❌ Error buscando producto/combo:', error);
      }

      if (!product && !combo && !implement) {
        return res.status(400).json({ success: false, message: `Producto ${item.name || productId} no encontrado. Verifica que el producto esté disponible.` });
      }

      if (product && product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock insuficiente para ${product.name}` });
      }

      if (combo && combo.inStock === false) {
        return res.status(400).json({ success: false, message: `El combo ${combo.name} no está disponible` });
      }

      if (implement && implement.isActive === false) {
        return res.status(400).json({ success: false, message: `El accesorio ${implement.name} no está disponible` });
      }

      const unitPrice = typeof item.price === 'number'
        ? item.price
        : (product ? product.price : combo ? combo.price : implement.price);

      const lineTotal = unitPrice * item.quantity;
      totalAmount += lineTotal;

      // Clasificar subtotales por tipo para descuentos diferenciados
      if (kind === 'Combo' || item.isCombo) {
        comboSubtotal += lineTotal;
      } else {
        productSubtotal += lineTotal;
      }

      orderItems.push({ product: product ? product._id : combo ? combo._id : implement._id, kind, quantity: item.quantity, price: unitPrice });
    }

    // Aplicar descuentos simples (ejemplo)
    let discountAmount = 0;
    let productDiscount = 0;
    let comboDiscount = 0;

    if (discountCode === 'INTSUPPS20') {
      productDiscount = Math.round(productSubtotal * 0.20);
      comboDiscount = Math.round(comboSubtotal * 0.05);
      discountAmount = productDiscount + comboDiscount;
    } else if (discountCode === 'CUIDADOCONLOSJOJOS') {
      discountAmount = Math.round(totalAmount * 0.15);
      productDiscount = discountAmount;
    }

    const netTotal = Math.max(0, totalAmount - discountAmount);

    const mappedShippingAddress = {
      street: shippingAddress.addressLine1 || '',
      city: shippingAddress.city || '',
      state: shippingAddress.region || shippingAddress.state || '',
      zipCode: shippingAddress.postalCode || shippingAddress.zipCode || '',
      country: shippingAddress.country || 'Colombia'
    };

    const order = await Order.create({
      user: req.user?.id,
      items: orderItems,
      totalAmount: netTotal,
      shippingAddress: mappedShippingAddress,
      paymentMethod: 'wompi',
      paymentStatus: 'pending'
    });

    const reference = `ORDER_${order._id}`;

    const wompiResponse = await createWompiTransaction({
      items: orderItems,
      customerData: customerData || {
        email: req.user?.email,
        fullName: req.user ? `${req.user.firstName} ${req.user.lastName}` : '',
        phoneNumber: req.user?.phoneNumber || '',
        legalId: req.user?.legalId || '',
        legalIdType: req.user?.legalIdType || 'CC'
      },
      shippingAddress,
      total: netTotal,
      reference,
      orderId: order._id.toString()
    });

    // Garantizar que la respuesta incluya siempre la publicKey (evita que el frontend reciba undefined)
    try {
      if (wompiResponse && wompiResponse.transactionData) {
        wompiResponse.transactionData.publicKey = wompiResponse.transactionData.publicKey || process.env.WOMPI_PUBLIC_KEY;
        console.log('🔑 Wompi publicKey enviada en response (backend):', wompiResponse.transactionData.publicKey);
      }
    } catch (envErr) {
      console.warn('⚠️ No fue posible asegurar publicKey en la respuesta:', envErr && envErr.message);
    }

    if (!wompiResponse.success) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(500).json({ success: false, message: wompiResponse.error || 'Error creando transacción con Wompi' });
    }

    order.wompiReference = reference;
    await order.save();

    return res.json({ success: true, orderId: order._id, wompiData: wompiResponse.transactionData });

  } catch (error) {
    console.error('❌ Error creando transacción Wompi (controller):', error);
    return res.status(500).json({ success: false, message: 'Error procesando pago', error: error.message });
  }
};

const verifyWompiHandler = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const verificationResult = await verifyWompiTransaction(transactionId);
    if (!verificationResult.success) return res.status(500).json({ success: false, message: verificationResult.error });

    const order = await Order.findOne({ wompiTransactionId: transactionId }).populate('items.product');
    return res.json({ success: true, transaction: verificationResult.transaction, order });
  } catch (error) {
    console.error('Error verificando transacción (controller):', error);
    res.status(500).json({ success: false, message: 'Error verificando transacción' });
  }
};

const wompiWebhookHandler = async (req, res) => {
  try {
    const webhookResult = processWompiWebhook(req);
    if (!webhookResult.success) return res.status(400).json({ success: false, message: webhookResult.error });

    const { event } = webhookResult;
    
    // Manejar eventos de transacciones (compatible con Checkout y Gateway)
    if (event.event === 'transaction.updated') {
      const transaction = event.data.transaction;
      const reference = transaction.reference;
      
      // Buscar orden por referencia o por transactionId (Gateway puede usar cualquiera)
      let order = await Order.findOne({ wompiReference: reference });
      
      if (!order) {
        // Si no se encuentra por referencia, buscar por transactionId (para Gateway)
        order = await Order.findOne({ wompiTransactionId: transaction.id });
      }
      
      if (!order) {
        console.log(`⚠️ Orden no encontrada para transacción ${transaction.id} con referencia ${reference}`);
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      // Actualizar transactionId si no estaba guardado (Gateway)
      if (!order.wompiTransactionId) {
        order.wompiTransactionId = transaction.id;
      }
      
      // Mapear estados de Wompi (case-insensitive)
      const previousStatus = order.paymentStatus;
      const transactionStatus = (transaction.status || '').toUpperCase();
      
      console.log(`🔄 [WEBHOOK] Estado transacción recibido: "${transaction.status}" → "${transactionStatus}"`);
      
      if (transactionStatus === 'APPROVED') {
        console.log('✅ [WEBHOOK] Transacción APROBADA');
        order.paymentStatus = 'APPROVED';
        order.status = 'processing';
        
        // Solo descontar stock de productos unitarios (no combos) si el pago no estaba aprobado previamente
        if (previousStatus !== 'paid' && previousStatus !== 'APPROVED') {
          for (const item of order.items) {
            if (item.kind === 'Product') {
              await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
            }
          }
        }
        
        // Enviar emails de confirmación
        try {
          console.log('📧 [WEBHOOK] Iniciando envío de emails para orden:', order._id);
          
          // Poblar user e items.product
          await order.populate('user');
          await order.populate('items.product');
          
          // Obtener información del usuario
          const userInfo = order.user;
          
          if (!userInfo) {
            console.error('❌ [WEBHOOK] Error: No se pudo obtener info del usuario para orden:', order._id);
            throw new Error('Usuario no encontrado para la orden');
          }
          
          console.log('📧 [WEBHOOK] Info del usuario obtenida:', {
            email: userInfo.email,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName
          });
          
          console.log('📧 [WEBHOOK] Enviando notificación al admin...');
          await sendNewOrderNotificationToAdmin(order, userInfo);
          console.log('✅ [WEBHOOK] Notificación al admin enviada correctamente');
          
          console.log('📧 [WEBHOOK] Enviando confirmación al cliente...');
          await sendOrderConfirmationToCustomer(order, userInfo);
          console.log('✅ [WEBHOOK] Confirmación al cliente enviada correctamente');
          
          console.log('✅ [WEBHOOK] Todos los emails enviados exitosamente para orden:', order._id);
        } catch (emailError) {
          console.error('❌ [WEBHOOK] Error enviando correos:', {
            orderId: order._id,
            error: emailError?.message || emailError,
            stack: emailError?.stack
          });
        }
        
      } else if (transactionStatus === 'DECLINED' || transactionStatus === 'ERROR') {
        console.log('❌ [WEBHOOK] Transacción RECHAZADA o ERROR');
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        
      } else if (transactionStatus === 'PENDING') {
        console.log('⏳ [WEBHOOK] Transacción PENDIENTE');
        order.paymentStatus = 'pending';
      } else {
        console.log('❓ [WEBHOOK] Estado desconocido:', transactionStatus);
      }

      await order.save();
      console.log(`✅ Webhook procesado: Orden ${order._id}, Estado: ${order.paymentStatus}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook (controller):', error);
    res.status(500).json({ success: false, message: 'Error procesando webhook' });
  }
};

const getPaymentMethodsHandler = async (req, res) => {
  try {
    const methodsResult = await getAvailablePaymentMethods();
    if (!methodsResult.success) return res.status(500).json({ success: false, message: methodsResult.error });
    res.json({ success: true, methods: methodsResult.methods });
  } catch (error) {
    console.error('Error obteniendo métodos (controller):', error);
    res.status(500).json({ success: false, message: 'Error obteniendo métodos de pago' });
  }
};

module.exports = {
  createWompiTransactionHandler,
  verifyWompiHandler,
  wompiWebhookHandler,
  getPaymentMethodsHandler
};
