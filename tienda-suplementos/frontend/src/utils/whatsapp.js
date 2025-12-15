const DEFAULT_WHATSAPP_NUMBER = '573006851794';
// wa.me funciona de forma consistente en móvil y escritorio
const WHATSAPP_BASE_URL = 'https://wa.me';

const sanitizeNumber = (number) => {
  if (!number) return DEFAULT_WHATSAPP_NUMBER;
  return `${number}`.replace(/\D/g, '') || DEFAULT_WHATSAPP_NUMBER;
};

export const getWhatsappUrl = (message, number = DEFAULT_WHATSAPP_NUMBER) => {
  const text = message && message.trim() ? message.trim() : 'Hola, necesito asesoría.';
  const phone = sanitizeNumber(number);
  const encoded = encodeURIComponent(text);

  // Formato recomendado (wa.me) asegura mensaje prellenado en móvil y web
  return `${WHATSAPP_BASE_URL}/${phone}?text=${encoded}`;
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
