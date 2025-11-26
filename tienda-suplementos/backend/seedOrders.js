// backend/seedOrders.js
// Script para poblar la base de datos con pedidos de ejemplo

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

async function seedOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB');

    // Obtener usuarios y productos
    const user = await User.findOne({ email: 'cliente@supps.com' });
    const admin = await User.findOne({ email: 'admin@supps.com' });
    const products = await Product.find();

    if (!user || !admin || products.length < 2) {
      throw new Error('Faltan usuarios o productos para poblar pedidos');
    }

    await Order.deleteMany();

    const orders = [
      {
        user: user._id,
        items: [
          {
            product: products[0]._id,
            quantity: 2,
            price: products[0].price
          },
          {
            product: products[1]._id,
            quantity: 1,
            price: products[1].price
          }
        ],
        totalAmount: products[0].price * 2 + products[1].price,
        shippingAddress: user.addresses[0],
        paymentMethod: 'mercadopago',
        paymentStatus: 'approved',
        status: 'processing',
        mercadoPagoPaymentId: 'MP-123456',
        mercadoPagoPreferenceId: 'PREF-123456',
        trackingNumber: 'TRACK-001'
      },
      {
        user: admin._id,
        items: [
          {
            product: products[2]._id,
            quantity: 3,
            price: products[2].price
          }
        ],
        totalAmount: products[2].price * 3,
        shippingAddress: admin.addresses[0],
        paymentMethod: 'mercadopago',
        paymentStatus: 'pending',
        status: 'pending',
        mercadoPagoPaymentId: null,
        mercadoPagoPreferenceId: null,
        trackingNumber: null
      }
    ];

    await Order.insertMany(orders);
    console.log('Pedidos insertados correctamente');
    process.exit();
  } catch (error) {
    console.error('Error al poblar pedidos:', error);
    process.exit(1);
  }
}

seedOrders();
