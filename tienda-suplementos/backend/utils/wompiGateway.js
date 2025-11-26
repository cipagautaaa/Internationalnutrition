const crypto = require('crypto');
const axios = require('axios');

/**
 * Utilidades para integración con Wompi Gateway API
 * Para cuentas configuradas en modo Gateway (no Checkout)
 */

const WOMPI_API_URL = 'https://production.wompi.co/v1';

/**
 * Crea una transacción usando el modelo Gateway de Wompi
 * @param {Object} params - Parámetros de la transacción
 * @param {string} params.cardToken - Token de la tarjeta generado con la API de tokens
 * @param {number} params.amount - Monto en centavos (ej: 50000 = $500.00)
 * @param {string} params.currency - Moneda (COP, USD, etc)
 * @param {string} params.customerEmail - Email del cliente
 * @param {string} params.reference - Referencia única de la transacción
 * @param {Object} params.customerData - Datos adicionales del cliente
 * @param {number} params.installments - Número de cuotas (1 para pago único)
 * @returns {Promise<Object>} Resultado de la transacción
 */
async function createGatewayTransaction({
  cardToken,
  amount,
  currency = 'COP',
  customerEmail,
  reference,
  customerData = {},
  installments = 1
}) {
  try {
    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('WOMPI_PRIVATE_KEY no configurada en variables de entorno');
    }

    // Preparar el payload para la API de Wompi
    const payload = {
      amount_in_cents: amount,
      currency,
      customer_email: customerEmail,
      payment_method: {
        type: 'CARD',
        token: cardToken,
        installments
      },
      reference,
      customer_data: {
        phone_number: customerData.phone || '',
        full_name: customerData.fullName || ''
      }
    };

    // Crear la transacción en Wompi
    const response = await axios.post(
      `${WOMPI_API_URL}/transactions`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${privateKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const transaction = response.data.data;

    return {
      success: true,
      transactionId: transaction.id,
      status: transaction.status,
      reference: transaction.reference,
      redirectUrl: transaction.redirect_url, // Para 3DS si es necesario
      data: transaction
    };

  } catch (error) {
    console.error('Error creando transacción Gateway:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.error?.messages?.join(', ') || error.message,
      code: error.response?.data?.error?.type || 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Genera una firma de integridad para verificar webhooks
 * @param {Object} event - Evento recibido del webhook
 * @returns {string} Firma generada
 */
function generateWebhookSignature(event) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  
  if (!secret) {
    throw new Error('WOMPI_EVENTS_SECRET no configurada');
  }

  const concatenated = `${event.id}${event.created_at}${event.data?.transaction?.id}${event.data?.transaction?.status}${event.data?.transaction?.amount_in_cents}`;
  
  return crypto
    .createHash('sha256')
    .update(concatenated + secret)
    .digest('hex');
}

/**
 * Verifica la firma de un webhook de Wompi
 * @param {Object} event - Evento del webhook
 * @param {string} receivedSignature - Firma recibida en los headers
 * @returns {boolean} true si la firma es válida
 */
function verifyWebhookSignature(event, receivedSignature) {
  const expectedSignature = generateWebhookSignature(event);
  return expectedSignature === receivedSignature;
}

/**
 * Consulta el estado de una transacción
 * @param {string} transactionId - ID de la transacción
 * @returns {Promise<Object>} Estado de la transacción
 */
async function getTransactionStatus(transactionId) {
  try {
    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    
    const response = await axios.get(
      `${WOMPI_API_URL}/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${privateKey}`
        }
      }
    );

    return {
      success: true,
      status: response.data.data.status,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error consultando estado:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createGatewayTransaction,
  verifyWebhookSignature,
  getTransactionStatus
};
