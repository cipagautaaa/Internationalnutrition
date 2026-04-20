const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Combo = require('../models/Combo');
const Implement = require('../models/Implement');
const DiscountCode = require('../models/DiscountCode');
const User = require('../models/User');
const { sendNewOrderNotificationToAdmin, sendOrderConfirmationToCustomer } = require('../utils/emailService');
const {
  createWompiTransaction,
  verifyWompiTransaction,
  processWompiWebhook,
  getAvailablePaymentMethods
} = require('../utils/wompi');

// Envío: misma lógica que frontend (free shipping y costo por región)
const FREE_SHIPPING_THRESHOLD = 80000;
const SHIPPING_COSTS_BY_DEPARTMENT = {
  boyaca: 10000,
  'boyacá': 10000,
  cundinamarca: 10000,
  bogota: 10000,
  'bogotá': 10000,
  santander: 12000,
  meta: 12000,
  casanare: 12000,
  arauca: 13000,
  tolima: 14000,
  huila: 14000,
  caldas: 14000,
  risaralda: 14000,
  quindio: 14000,
  'quindío': 14000,
  antioquia: 14000,
  'norte de santander': 14000,
  'valle del cauca': 16000,
  valle: 16000,
  cauca: 16000,
  cesar: 16000,
  magdalena: 16000,
  bolivar: 16000,
  'bolívar': 16000,
  atlantico: 16000,
  'atlántico': 16000,
  sucre: 16000,
  cordoba: 16000,
  'córdoba': 16000,
  'nariño': 18000,
  narino: 18000,
  putumayo: 18000,
  caqueta: 18000,
  'caquetá': 18000,
  'la guajira': 18000,
  guajira: 18000,
  choco: 20000,
  'chocó': 20000,
  amazonas: 20000,
  vaupes: 20000,
  'vaupés': 20000,
  guainia: 20000,
  'guainía': 20000,
  vichada: 20000,
  guaviare: 20000,
  'san andres': 20000,
  'san andrés': 20000,
  'san andres y providencia': 20000,
};
const DEFAULT_SHIPPING_COST = 15000;
const normalizeDepartment = (department) => {
  if (!department) return '';
  return department
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};
const getShippingCost = (department) => {
  const normalized = normalizeDepartment(department);
  if (!normalized) return DEFAULT_SHIPPING_COST;
  for (const [key, cost] of Object.entries(SHIPPING_COSTS_BY_DEPARTMENT)) {
    if (normalized === normalizeDepartment(key) || normalized.includes(normalizeDepartment(key))) {
      return cost;
    }
  }
  return DEFAULT_SHIPPING_COST;
};
const hasFreeShipping = (subtotal) => subtotal >= FREE_SHIPPING_THRESHOLD;

// Productos excluidos de descuentos adicionales (ya están en súper promoción)
const DISCOUNT_EXCLUDED_PRODUCTS = [
  'creatina platinum',
  'platinum'
];

// Helper para verificar si un producto está excluido de descuentos
const isProductExcludedFromDiscount = (productName) => {
  if (!productName) return false;
  const normalizedName = productName.toLowerCase().trim();
  return DISCOUNT_EXCLUDED_PRODUCTS.some(excluded => 
    normalizedName.includes(excluded.toLowerCase())
  );
};

const isProductVariantOfBase = (baseProduct, variantProduct) => {
  if (!baseProduct || !variantProduct) return false;
  const baseId = String(baseProduct._id || '');
  const variantId = String(variantProduct._id || '');
  const baseFamily = String(baseProduct.familyId || baseId);
  const variantFamily = String(variantProduct.familyId || variantId);

  return (
    variantId === baseId ||
    String(variantProduct.variantOf || '') === baseId ||
    String(baseProduct.variantOf || '') === variantId ||
    (baseFamily && variantFamily && baseFamily === variantFamily)
  );
};

const applyDiscountCodeUsageOnce = async (order) => {
  if (!order || !order.discountCode || order.discountCodeUsageApplied) return;

  try {
    const discountCodeDoc = await DiscountCode.findOne({ code: order.discountCode });
    if (discountCodeDoc) {
      await discountCodeDoc.incrementUsage();
      order.discountCodeUsageApplied = true;
      console.log(`🎟️ Uso de código ${order.discountCode} registrado para orden ${order._id}`);
    } else {
      console.warn(`⚠️ Código ${order.discountCode} no encontrado al registrar uso para orden ${order._id}`);
    }
  } catch (usageError) {
    console.error('❌ Error registrando uso del código de descuento:', usageError);
  }
};

// Helper atómico para descontar stock UNA sola vez por orden.
// Usa findOneAndUpdate con stockDeducted=false como condición para evitar race conditions.
const deductStockOnce = async (order) => {
  const locked = await Order.findOneAndUpdate(
    { _id: order._id, stockDeducted: { $ne: true } },
    { $set: { stockDeducted: true } },
    { new: true }
  );
  if (!locked) {
    console.log(`⚠️ [deductStockOnce] Stock ya descontado para orden ${order._id}. Saltando.`);
    return false;
  }
  for (const item of order.items) {
    if (item.kind === 'Product') {
      await Product.findByIdAndUpdate(item.product._id || item.product, { $inc: { stock: -item.quantity } });
    }
  }
  console.log(`✅ [deductStockOnce] Stock descontado para orden ${order._id}`);
  return true;
};

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
    let eligibleProductSubtotal = 0; // Productos que SÍ pueden recibir descuento
    let excludedProductSubtotal = 0; // Productos excluidos (ya en súper promoción)
    const orderItems = [];

    for (const item of items) {
      const productId = item.productId || item._id || item.id;
      const requestedVariantId = item.variantId || null;
      const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
      let product = null;
      let priceProduct = null;
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

      if (product) {
        priceProduct = product;

        if (requestedVariantId) {
          if (!mongoose.Types.ObjectId.isValid(requestedVariantId)) {
            return res.status(400).json({
              success: false,
              message: `Variante inválida para ${product.name}`
            });
          }

          const variantProduct = await Product.findById(requestedVariantId);

          if (variantProduct && isProductVariantOfBase(product, variantProduct)) {
            priceProduct = variantProduct;
          } else {
            return res.status(400).json({
              success: false,
              message: `La variante seleccionada no corresponde a ${product.name}`
            });
          }
        }
      }

      // SEGURIDAD: Siempre usar precio de base de datos; para productos se respeta la variante seleccionada
      const unitPrice = priceProduct ? priceProduct.price : combo ? combo.price : implement.price;

      const lineTotal = unitPrice * quantity;
      totalAmount += lineTotal;

      // Obtener el nombre del producto para verificar exclusión
      const productName = priceProduct ? priceProduct.name : combo ? combo.name : implement ? implement.name : item.name;
      const isExcluded = isProductExcludedFromDiscount(productName);

      // Clasificar subtotales por tipo para descuentos diferenciados
      if (kind === 'Combo' || item.isCombo) {
        comboSubtotal += lineTotal;
      } else {
        productSubtotal += lineTotal;
        // Separar productos elegibles para descuento vs excluidos (súper promoción)
        if (isExcluded) {
          excludedProductSubtotal += lineTotal;
          console.log(`🔥 Producto "${productName}" excluido de descuentos (súper promoción): $${lineTotal}`);
        } else {
          eligibleProductSubtotal += lineTotal;
        }
      }

      orderItems.push({
        product: priceProduct ? priceProduct._id : combo ? combo._id : implement._id,
        kind,
        quantity,
        price: unitPrice,
        isExcludedFromDiscount: isExcluded
      });
    }

    // Aplicar descuentos desde la base de datos
    let discountAmount = 0;
    let productDiscount = 0;
    let comboDiscount = 0;

    if (discountCode) {
      try {
        const discountCodeDoc = await DiscountCode.findOne({ code: discountCode });
        
        if (discountCodeDoc && discountCodeDoc.isValid()) {
          // IMPORTANTE: Aplicar descuento SOLO a productos elegibles (excluyendo productos en súper promoción)
          productDiscount = Math.round(eligibleProductSubtotal * (discountCodeDoc.productDiscount / 100));
          comboDiscount = Math.round(comboSubtotal * (discountCodeDoc.comboDiscount / 100));
          discountAmount = productDiscount + comboDiscount;

          console.log(`✅ Código de descuento ${discountCode} aplicado: Productos -${discountCodeDoc.productDiscount}%, Combos -${discountCodeDoc.comboDiscount}%`);
          console.log(`🎟️ Uso del código ${discountCode} se registrará al confirmar pago APPROVED`);
          if (excludedProductSubtotal > 0) {
            console.log(`🔥 Productos excluidos del descuento (súper promoción): $${excludedProductSubtotal}`);
          }
        } else {
          console.log(`⚠️ Código de descuento ${discountCode} no válido o expirado`);
        }
      } catch (discountError) {
        console.error('❌ Error aplicando código de descuento:', discountError);
        // Continuar sin descuento si hay error
      }
    }

    const subtotalAfterDiscount = Math.max(0, totalAmount - discountAmount);
    const shippingCost = hasFreeShipping(subtotalAfterDiscount)
      ? 0
      : getShippingCost(shippingAddress?.region || shippingAddress?.state);
    const netTotal = subtotalAfterDiscount + shippingCost;

    const mappedShippingAddress = {
      street: shippingAddress.addressLine1 || '',
      city: shippingAddress.city || '',
      state: shippingAddress.region || shippingAddress.state || '',
      zipCode: shippingAddress.postalCode || shippingAddress.zipCode || '',
      country: shippingAddress.country || 'Colombia'
    };

    const normalizedCustomerData = {
      email: (customerData?.email || req.user?.email || '').toString().trim(),
      fullName: (customerData?.fullName || (req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : '') || '').toString().trim(),
      phoneNumber: (customerData?.phoneNumber || req.user?.phone || req.user?.phoneNumber || '').toString().trim(),
      legalId: (customerData?.legalId || req.user?.legalId || '').toString().trim(),
      legalIdType: (customerData?.legalIdType || req.user?.legalIdType || 'CC').toString().trim()
    };

    const order = await Order.create({
      user: req.user?.id,
      customerData: normalizedCustomerData,
      items: orderItems,
      totalAmount: netTotal,
      subtotal: totalAmount,
      discountAmount,
      discountCode: discountAmount > 0 ? discountCode : null,
      discountCodeUsageApplied: false,
      shippingCost,
      shippingAddress: mappedShippingAddress,
      paymentMethod: 'wompi',
      paymentStatus: 'pending'
    });

    const reference = `ORDER_${order._id}`;

    const wompiResponse = await createWompiTransaction({
      items: orderItems,
      customerData: normalizedCustomerData,
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

    const transaction = verificationResult.transaction;
    
    // Buscar orden por transactionId o por referencia
    let order = await Order.findOne({ wompiTransactionId: transactionId }).populate('items.product');
    
    if (!order && transaction?.reference) {
      order = await Order.findOne({ wompiReference: transaction.reference }).populate('items.product');
    }
    
    const requesterId = req.user?.id ? String(req.user.id) : null;
    const orderUserId = order?.user ? String(order.user) : null;
    const isAdmin = req.user?.role === 'admin';
    const canAccessOrder = Boolean(order && (isAdmin || (requesterId && orderUserId && requesterId === orderUserId)));

    // FALLBACK de actualización solo para usuarios autorizados (owner/admin)
    if (canAccessOrder && order && transaction && (transaction.status || '').toUpperCase() === 'APPROVED') {
      const needsUpdate = order.paymentStatus !== 'APPROVED' && order.paymentStatus !== 'paid' && order.paymentStatus !== 'approved';
      
      if (needsUpdate) {
        console.log(`🔄 [VERIFY-FALLBACK] Orden ${order._id} necesita actualización. Status actual: ${order.paymentStatus}, Wompi dice: APPROVED`);
        
        // Actualizar estado
        order.paymentStatus = 'APPROVED';
        order.status = 'processing';
        if (!order.wompiTransactionId) {
          order.wompiTransactionId = transactionId;
        }

        await applyDiscountCodeUsageOnce(order);
        
        // Descontar stock (atómico, evita doble deducción)
        await deductStockOnce(order);
        
        // Resetear ruleta del usuario
        if (order.user) {
          try {
            await User.findByIdAndUpdate(order.user, {
              wheelPrizePending: null,
              wheelLockedUntilPurchase: false,
              wheelSpinAttempts: 0
            });
          } catch (wheelError) {
            console.error('🎡 [VERIFY-FALLBACK] Error reseteando ruleta:', wheelError);
          }
        }
        
        await order.save();
        console.log(`✅ [VERIFY-FALLBACK] Orden ${order._id} actualizada a APPROVED`);
      }
      
      // Enviar emails si no se enviaron (idempotente)
      try {
        await order.populate('user');
        await order.populate('items.product');
        
        const userInfo = order.user || order.customerData || {};
        
        if (!order.emailNotifications?.adminNewOrderSentAt) {
          console.log('📧 [VERIFY-FALLBACK] Enviando notificación al admin...');
          const resAdmin = await sendNewOrderNotificationToAdmin(order, userInfo);
          if (!resAdmin?.queued && !resAdmin?.skipped) {
            order.emailNotifications = order.emailNotifications || {};
            order.emailNotifications.adminNewOrderSentAt = new Date();
          }
        }
        
        if (!order.emailNotifications?.customerConfirmationSentAt) {
          console.log('📧 [VERIFY-FALLBACK] Enviando confirmación al cliente...');
          const resCustomer = await sendOrderConfirmationToCustomer(order, userInfo);
          if (!resCustomer?.queued && !resCustomer?.skipped) {
            order.emailNotifications = order.emailNotifications || {};
            order.emailNotifications.customerConfirmationSentAt = new Date();
          }
        }
        
        order.emailNotifications = order.emailNotifications || {};
        order.emailNotifications.lastEmailError = null;
        await order.save();
        
        console.log('✅ [VERIFY-FALLBACK] Flujo de emails ejecutado para orden:', order._id);
      } catch (emailError) {
        console.error('❌ [VERIFY-FALLBACK] Error enviando correos:', emailError?.message || emailError);
      }
    }

    if (!canAccessOrder) {
      return res.json({ success: true, transaction: verificationResult.transaction });
    }

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

        if (previousStatus !== 'paid' && previousStatus !== 'APPROVED') {
          await applyDiscountCodeUsageOnce(order);
        }
        
        // Descontar stock (atómico, evita doble deducción con verify-fallback)
        await deductStockOnce(order);
        
        // Resetear la ruleta del usuario para que pueda jugar de nuevo
        if (order.user) {
          try {
            await User.findByIdAndUpdate(order.user, {
              wheelPrizePending: null,
              wheelLockedUntilPurchase: false,
              wheelSpinAttempts: 0
            });
            console.log(`🎡 [WEBHOOK] Ruleta reseteada para usuario ${order.user} tras pago APPROVED`);
          } catch (wheelError) {
            console.error('🎡 [WEBHOOK] Error reseteando ruleta:', wheelError);
            // No fallar la orden por esto
          }
        }
        
        // Enviar emails de confirmación
        // IMPORTANTE: Cada email tiene su propio try-catch para que un fallo
        // en uno no impida el envío del otro
        console.log('📧 [WEBHOOK] Iniciando envío de emails para orden:', order._id);
        
        // Poblar user e items.product con manejo de error independiente
        let userInfo = order.customerData || {};
        try {
          await order.populate('user');
          await order.populate('items.product');
          userInfo = order.user || order.customerData || {};
        } catch (populateError) {
          console.error('⚠️ [WEBHOOK] Error en populate, usando customerData como fallback:', populateError?.message);
          // Continuar con customerData - los emails aún pueden enviarse
        }
        
        console.log('📧 [WEBHOOK] Info del usuario obtenida:', {
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          fullName: userInfo.fullName
        });
        
        const emailUpdates = {};

        // --- Email al ADMIN (try-catch independiente) ---
        if (!order.emailNotifications?.adminNewOrderSentAt) {
          try {
            console.log('📧 [WEBHOOK] Enviando notificación al admin...');
            const resAdmin = await sendNewOrderNotificationToAdmin(order, userInfo);
            if (!resAdmin?.queued && !resAdmin?.skipped) {
              emailUpdates['emailNotifications.adminNewOrderSentAt'] = new Date();
              console.log('✅ [WEBHOOK] Notificación al admin enviada correctamente');
            } else {
              console.log('📮 [WEBHOOK] Notificación al admin encolada/skipped:', resAdmin);
            }
          } catch (adminEmailError) {
            console.error('❌ [WEBHOOK] Error enviando email al admin:', adminEmailError?.message);
            // Forzar encolado en outbox como safety net
            try {
              const { enqueueEmailOutboxJob } = require('../utils/emailService');
              // No tenemos mailOptions aquí, pero la función sendNewOrderNotificationToAdmin
              // ya encola internamente en producción. Este log es informativo.
            } catch (e) { /* no-op */ }
            emailUpdates['emailNotifications.lastEmailError'] = (adminEmailError?.message || String(adminEmailError)).slice(0, 4000);
          }
        } else {
          console.log('↩️ [WEBHOOK] Admin ya notificado. Saltando envío.');
        }

        // --- Email al CLIENTE (try-catch independiente) ---
        if (!order.emailNotifications?.customerConfirmationSentAt) {
          try {
            console.log('📧 [WEBHOOK] Enviando confirmación al cliente...');
            const resCustomer = await sendOrderConfirmationToCustomer(order, userInfo);
            if (!resCustomer?.queued && !resCustomer?.skipped) {
              emailUpdates['emailNotifications.customerConfirmationSentAt'] = new Date();
              console.log('✅ [WEBHOOK] Confirmación al cliente enviada correctamente');
            } else {
              console.log('📮 [WEBHOOK] Confirmación al cliente encolada/skipped:', resCustomer);
            }
          } catch (customerEmailError) {
            console.error('❌ [WEBHOOK] Error enviando email al cliente:', customerEmailError?.message);
          }
        } else {
          console.log('↩️ [WEBHOOK] Cliente ya confirmado. Saltando envío.');
        }

          if (Object.keys(emailUpdates).length > 0) {
            order.emailNotifications = order.emailNotifications || {};
            if (emailUpdates['emailNotifications.adminNewOrderSentAt']) {
              order.emailNotifications.adminNewOrderSentAt = emailUpdates['emailNotifications.adminNewOrderSentAt'];
            }
            if (emailUpdates['emailNotifications.customerConfirmationSentAt']) {
              order.emailNotifications.customerConfirmationSentAt = emailUpdates['emailNotifications.customerConfirmationSentAt'];
            }
            if (emailUpdates['emailNotifications.lastEmailError']) {
              order.emailNotifications.lastEmailError = emailUpdates['emailNotifications.lastEmailError'];
            } else {
              order.emailNotifications.lastEmailError = null;
            }
          }

          console.log('✅ [WEBHOOK] Flujo de emails ejecutado para orden:', order._id);
        
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
