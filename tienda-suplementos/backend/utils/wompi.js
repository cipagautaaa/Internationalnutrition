const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Configuración de Wompi
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET;
const WOMPI_BASE_URL = process.env.WOMPI_BASE_URL || 'https://production.wompi.co/v1';

// Función para generar firma de integridad
const generateIntegritySignature = (reference, amountInCents, currency, expirationTime = null) => {
  let concatenatedString = `${reference}${amountInCents}${currency}`;
  
  if (expirationTime) {
    concatenatedString += expirationTime;
  }
  
  concatenatedString += WOMPI_INTEGRITY_SECRET;
  
  return crypto
    .createHash('sha256')
    .update(concatenatedString)
    .digest('hex');
};

// Crear transacción para Wompi Widget
const createWompiTransaction = async (orderData) => {
  try {
    const { items, customerData, shippingAddress, total, reference } = orderData;
    
    if (!WOMPI_PUBLIC_KEY || !WOMPI_INTEGRITY_SECRET) {
      throw new Error('Credenciales de Wompi no configuradas');
    }

    // Calcular monto en centavos
    const amountInCents = Math.round(total * 100);
    const currency = 'COP';
    
    // Generar firma de integridad
    const signature = generateIntegritySignature(reference, amountInCents, currency);
    
    console.log(`🎯 Wompi Transaction: ${reference} - $${total} COP`);
    console.log(`📱 Customer: ${customerData.fullName} (${customerData.email})`);
    console.log(`📍 Shipping: ${shippingAddress.city}, ${shippingAddress.region}`);
    
    return {
      success: true,
      transactionData: {
        publicKey: WOMPI_PUBLIC_KEY,
        reference,
        amountInCents,
        currency,
        signature,
        // Datos prellenados para el widget
        customerData: {
          email: customerData.email,
          fullName: customerData.fullName,
          phoneNumber: customerData.phoneNumber,
          phoneNumberPrefix: '+57',
          legalId: customerData.legalId,
          legalIdType: customerData.legalIdType
        },
        shippingAddress: {
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          region: shippingAddress.region,
          country: shippingAddress.country || 'CO',
          phoneNumber: shippingAddress.phoneNumber,
          postalCode: shippingAddress.postalCode || ''
        }
      }
    };
    
  } catch (error) {
    console.error('Error creando transacción Wompi:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verificar estado de transacción
const verifyWompiTransaction = async (transactionId) => {
  try {
    const url = `${WOMPI_BASE_URL}/transactions/${transactionId}`;
    const resp = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const transaction = resp.data;
    console.log(`🔍 Verificando transacción: ${transactionId}`);
    console.log(`📊 Status: ${transaction.data?.status}`);
    console.log(`💰 Amount: ${transaction.data?.amount_in_cents / 100} COP`);

    return {
      success: true,
      transaction: transaction.data
    };

  } catch (error) {
    console.error('Error verificando transacción Wompi:', error && error.message);
    return {
      success: false,
      error: error.response?.data || error.message || String(error)
    };
  }
};

// Crear pago directo con API (alternativa al widget)
const createDirectPayment = async (paymentData) => {
  try {
    const {
      cardToken,
      amountInCents,
      currency,
      customerEmail,
      reference,
      customerData,
      shippingAddress
    } = paymentData;

    const paymentBody = {
      amount_in_cents: amountInCents,
      currency,
      customer_email: customerEmail,
      payment_method: {
        type: 'CARD',
        token: cardToken
      },
      reference,
      customer_data: customerData,
      shipping_address: shippingAddress
    };

    const url = `${WOMPI_BASE_URL}/transactions`;
    const resp = await axios.post(url, paymentBody, {
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const result = resp.data;

    console.log(`💳 Pago directo creado: ${result.data?.id}`);
    console.log(`📊 Status: ${result.data?.status}`);

    return {
      success: true,
      payment: result.data
    };

  } catch (error) {
    console.error('Error creando pago directo:', error && error.message);
    return {
      success: false,
      error: error.response?.data || error.message || String(error)
    };
  }
};

// Procesar webhook de Wompi
const processWompiWebhook = (req) => {
  try {
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    const body = JSON.stringify(req.body);
    
    // Verificar firma del webhook (opcional pero recomendado)
    if (signature && WOMPI_INTEGRITY_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', WOMPI_INTEGRITY_SECRET)
        .update(timestamp + body)
        .digest('hex');
        
      if (signature !== expectedSignature) {
        console.warn('⚠️ Firma de webhook inválida');
        return { success: false, error: 'Firma inválida' };
      }
    }
    
    const event = req.body;
    
    console.log(`📡 Webhook Wompi: ${event.event}`);
    console.log(`🔗 Transaction ID: ${event.data?.transaction?.id}`);
    console.log(`📊 Status: ${event.data?.transaction?.status}`);
    
    return {
      success: true,
      event
    };
    
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Obtener métodos de pago disponibles
const getAvailablePaymentMethods = async () => {
  try {
    // Por defecto retornar métodos disponibles
    const mockMethods = [
      {
        name: 'CARD',
        payment_method_type: 'CARD',
        acceptance_status: 'ACCEPTED'
      },
      {
        name: 'PSE',
        payment_method_type: 'PSE',
        acceptance_status: 'ACCEPTED'
      }
    ];
    
    // Intentar obtener métodos reales desde la API de Wompi
    const url = `${WOMPI_BASE_URL}/payment_methods`;
    try {
      const resp = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const methods = resp.data?.data || resp.data || [];
      if (methods && methods.length > 0) {
        console.log(`💳 Métodos de pago obtenidos desde Wompi: ${methods.length}`);
        return {
          success: true,
          methods
        };
      }
    } catch (err) {
      console.warn('⚠️ No fue posible obtener métodos reales desde Wompi:', err && err.message);
    }
    
    // Fallback a mock si la petición falla o no retorna métodos
    console.log('✅ Usando métodos de pago por defecto (CARD, PSE)');
    return {
      success: true,
      methods: mockMethods
    };
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createWompiTransaction,
  verifyWompiTransaction,
  createDirectPayment,
  processWompiWebhook,
  getAvailablePaymentMethods,
  generateIntegritySignature
};