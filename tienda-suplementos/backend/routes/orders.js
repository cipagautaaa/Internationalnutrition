const express = require('express');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendNewOrderNotificationToAdmin, sendOrderConfirmationToCustomer } = require('../utils/emailService');

const router = express.Router();

// Crear orden (para métodos de pago que no requieren procesamiento inmediato)
router.post('/create', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
    
    // Validar que hay items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay productos en el carrito'
      });
    }

    // Validar método de pago
    if (!['transferencia', 'efectivo'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago no válido para esta ruta'
      });
    }

    // Validar productos y stock
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Producto ${item.productId} no encontrado`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Verificar que el total coincide
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'El total calculado no coincide con el enviado'
      });
    }

    // Crear la orden
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending'
    });

    // Para efectivo, no reservar stock hasta confirmar entrega
    // Para transferencia, esperar confirmación de pago
    
    await order.populate('items.product');

    // Enviar notificaciones por correo
    try {
      // Notificar al administrador
      await sendNewOrderNotificationToAdmin(order, req.user);
      
      // Confirmar al cliente
      await sendOrderConfirmationToCustomer(order, req.user);
      
      console.log('✅ Correos de notificación enviados para orden:', order._id);
    } catch (emailError) {
      console.error('❌ Error enviando correos de notificación:', emailError);
      // No fallar la orden por problemas de correo
    }

    res.json({
      success: true,
      message: 'Orden creada exitosamente',
      orderId: order._id,
      order: order
    });

  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando la orden'
    });
  }
});

// Obtener órdenes del usuario
router.get('/my-orders', protect, async (req, res) => {
  try {
    console.log('Obteniendo órdenes para usuario:', req.user.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Obtener órdenes del usuario con paginación
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Encontradas ${orders.length} órdenes para el usuario`);

    // Contar total de órdenes
    const total = await Order.countDocuments({ user: req.user.id });
    console.log(`Total de órdenes: ${total}`);

    // Formatear las órdenes para el frontend
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber || `ORDER-${order._id.toString().slice(-8).toUpperCase()}`,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress,
      items: order.items.map(item => ({
        product: item.product ? {
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images && item.product.images.length > 0 
            ? item.product.images[0] 
            : null
        } : {
          id: null,
          name: 'Producto eliminado',
          price: item.price,
          image: null
        },
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      wompiReference: order.wompiReference,
      wompiTransactionId: order.wompiTransactionId
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo las órdenes'
    });
  }
});

// Obtener orden por ID
router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo la orden'
    });
  }
});

// Obtener todas las órdenes del usuario
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      orders: orders,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        total
      }
    });
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo las órdenes'
    });
  }
});

// Actualizar estado de orden (solo para administradores)
router.put('/:orderId/status', protect, async (req, res) => {
  try {
    // Verificar si el usuario es admin (esto depende de cómo manejes los roles)
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'No autorizado'
    //   });
    // }

    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Actualizar estados
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Si se confirma el pago, reducir stock
    if (paymentStatus === 'approved' && order.paymentStatus !== 'approved') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      order: order
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando el estado'
    });
  }
});

// Cancelar orden
router.put('/:orderId/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Solo se puede cancelar si está pendiente o procesando
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar esta orden'
      });
    }

    order.status = 'cancelled';
    order.paymentStatus = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Orden cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error cancelando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelando la orden'
    });
  }
});

// Obtener detalles de una orden específica
router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id
    }).populate('items.product', 'name price images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const formattedOrder = {
      id: order._id,
      orderNumber: order.orderNumber || `ORDER-${order._id.toString().slice(-8).toUpperCase()}`,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress,
      items: order.items.map(item => ({
        product: item.product ? {
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          description: item.product.description,
          images: item.product.images
        } : {
          id: null,
          name: 'Producto eliminado',
          price: item.price,
          description: 'Este producto ya no está disponible',
          images: []
        },
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      wompiReference: order.wompiReference,
      wompiTransactionId: order.wompiTransactionId
    };

    res.json({
      success: true,
      order: formattedOrder
    });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo los detalles de la orden'
    });
  }
});

module.exports = router;