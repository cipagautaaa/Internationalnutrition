const DEFAULT_WHATSAPP_NUMBER = '573006851794';

const sanitizeNumber = (number) => {
  if (!number) return DEFAULT_WHATSAPP_NUMBER;
  return `${number}`.replace(/\D/g, '') || DEFAULT_WHATSAPP_NUMBER;
};

export const getWhatsappUrl = (message, number = DEFAULT_WHATSAPP_NUMBER) => {
  // Asegurar que el mensaje tenga contenido
  const text = message && message.trim() ? message.trim() : 'Hola, necesito asesoría.';
  const phone = sanitizeNumber(number);
  
  // Usar api.whatsapp.com para mejor compatibilidad con mensajes largos
  // Formato: https://api.whatsapp.com/send?phone=NUMERO&text=MENSAJE
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  
  return url;
};

export const buildOrderSummaryMessage = (order, prefix = 'Hola, necesito ayuda con mi pedido') => {
  if (!order) {
    return prefix;
  }

  const orderId = order._id ? `#${order._id.slice(-8).toUpperCase()}` : '';
  const items = Array.isArray(order.items) ? order.items : [];
  const productLines = items
    .map((item) => {
      const name = item?.product?.name || item?.name || 'Producto';
      const quantity = item?.quantity || 1;
      const subtotal = item?.price ? (item.price * quantity).toLocaleString('es-CO') : 'N/A';
      return `• ${name} x${quantity} - $${subtotal}`;
    })
    .join('\n');

  const total = order?.totalAmount
    ? `$${order.totalAmount.toLocaleString('es-CO')}`
    : 'N/A';

  const shippingCity = order?.shippingAddress?.city;
  const shippingRegion = order?.shippingAddress?.state || order?.shippingAddress?.region;
  const shippingLine = shippingCity ? `\n📦 Ciudad: ${shippingCity}${shippingRegion ? `, ${shippingRegion}` : ''}` : '';

  return `${prefix}${orderId ? ` (${orderId})` : ''}` +
    (productLines ? `\n\n🛒 Productos:\n${productLines}` : '') +
    `\n\nTotal: ${total}${shippingLine}`;
};

export const WHATSAPP_NUMBER = DEFAULT_WHATSAPP_NUMBER;
