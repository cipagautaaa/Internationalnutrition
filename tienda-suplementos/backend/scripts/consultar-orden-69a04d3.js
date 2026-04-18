/**
 * Script: Consultar datos completos de la orden 69a04d3341bab0f2d2f16e2a
 * Transacción Wompi: 1363419-1772113315-17973 - 26 feb 2026
 * Cliente: Nicolas Blanco (nicolas.velandy123@gmail.com)
 * 
 * Este script NO modifica nada, solo muestra la información del pedido
 * para poder procesar el envío manualmente.
 */

require('dotenv').config();
const mongoose = require('mongoose');
// Cargar todos los modelos necesarios para que populate funcione
require('../models/Product');
require('../models/Combo');
const Order = require('../models/Order');

const MONGODB_URI = process.env.MONGODB_URI;
const ORDER_ID = '69a04d3341bab0f2d2f16e2a';

async function consultarOrden() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const order = await Order.findById(ORDER_ID).populate('items.product').populate('user');
    if (!order) {
      console.log('❌ Orden no encontrada con ID:', ORDER_ID);
      return;
    }

    console.log('══════════════════════════════════════════════');
    console.log('          INFORMACIÓN DE LA ORDEN');
    console.log('══════════════════════════════════════════════');
    console.log('Número de Orden : #' + order._id.toString().slice(-7).toUpperCase());
    console.log('ID completo     :', order._id);
    console.log('Total           : $' + (order.totalAmount || order.total));
    console.log('Método de Pago  : wompi (PSE)');
    console.log('Transacción     : 1363419-1772113315-17973');
    console.log('Estado de Pago  :', order.paymentStatus);
    console.log('Estado Orden    :', order.status);
    console.log('Fecha creación  :', order.createdAt);

    console.log('\n──────────────────────────────────────────────');
    console.log('          INFORMACIÓN DEL CLIENTE');
    console.log('──────────────────────────────────────────────');
    const c = order.customerData || {};
    console.log('Nombre          :', c.fullName || c.name || 'Nicolas Blanco');
    console.log('Email           :', c.email || 'nicolas.velandy123@gmail.com');
    console.log('Teléfono        :', c.phone || c.phoneNumber || '+573108034465');
    console.log('Documento       :', c.document || c.documentNumber || 'CC 1002460315');

    console.log('\n──────────────────────────────────────────────');
    console.log('          DIRECCIÓN DE ENVÍO');
    console.log('──────────────────────────────────────────────');
    const s = order.shippingAddress || {};
    console.log('Nombre receptor :', s.fullName || s.name || c.fullName || 'N/A');
    console.log('Teléfono        :', s.phone || s.phoneNumber || c.phone || 'N/A');
    console.log('Dirección       :', s.street || s.address || 'N/A');
    console.log('Ciudad          :', s.city || 'N/A');
    console.log('Departamento    :', s.state || s.department || 'N/A');
    console.log('Código Postal   :', s.postalCode || s.zipCode || 'N/A');
    console.log('Barrio/Notas    :', s.neighborhood || s.notes || s.references || 'N/A');

    console.log('\n──────────────────────────────────────────────');
    console.log('          PRODUCTOS ORDENADOS');
    console.log('──────────────────────────────────────────────');
    let totalCalculado = 0;
    for (const item of order.items) {
      const nombre = item.product?.name || item.productName || item.name || 'Producto';
      const qty    = item.quantity;
      const precio = item.price || item.unitPrice;
      const sub    = qty * precio;
      totalCalculado += sub;
      console.log(`  - ${nombre.padEnd(30)} x${qty}   $${precio.toLocaleString('es-CO')}   => $${sub.toLocaleString('es-CO')}`);
    }
    console.log('──────────────────────────────────────────────');
    console.log('  TOTAL:'.padEnd(42) + '$' + totalCalculado.toLocaleString('es-CO'));
    console.log('══════════════════════════════════════════════\n');

    // Mostrar objeto completo por si hay campos adicionales
    console.log('📋 Objeto shippingAddress completo:');
    console.log(JSON.stringify(order.shippingAddress, null, 2));
    console.log('\n📋 Objeto customerData completo:');
    console.log(JSON.stringify(order.customerData, null, 2));

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

consultarOrden();
