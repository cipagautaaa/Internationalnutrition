require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

async function checkOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Buscar la orden específica por ID
    const order = await Order.findById('68eebf7ed567e60d0cb73650');
    
    if (order) {
      console.log('\n📦 ORDEN ENCONTRADA:');
      console.log('================================');
      console.log(`ID: ${order._id}`);
      console.log(`Número de orden: ${order.orderNumber || 'N/A'}`);
      console.log(`Estado: ${order.status}`);
      console.log(`Estado de pago: ${order.paymentStatus}`);
      console.log(`Método de pago: ${order.paymentMethod}`);
      console.log(`Total: $${order.totalAmount}`);
      console.log(`Fecha creación: ${order.createdAt}`);
      console.log(`Fecha actualización: ${order.updatedAt}`);
      console.log(`Usuario ID: ${order.user || 'N/A'}`);
      console.log(`Referencia Wompi: ${order.reference || 'N/A'}`);
      console.log(`ID Transacción: ${order.paymentId || 'N/A'}`);
      
      if (order.items && order.items.length > 0) {
        console.log('\n📋 PRODUCTOS:');
        order.items.forEach((item, index) => {
          console.log(`${index + 1}. Producto ID: ${item.product}`);
          console.log(`   Cantidad: ${item.quantity}`);
          console.log(`   Precio: $${item.price}`);
        });
      }
    } else {
      console.log('❌ Orden no encontrada');
      
      // Buscar las últimas 5 órdenes para ver qué hay
      console.log('\n🔍 ÚLTIMAS 5 ÓRDENES:');
      const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
      recentOrders.forEach((order, index) => {
        console.log(`${index + 1}. ID: ${order._id} | Estado: ${order.status} | Total: $${order.totalAmount} | Fecha: ${order.createdAt}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrder();