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
    const event = req.body;
    const strictWebhookValidation =
      process.env.NODE_ENV === 'production' &&
      String(process.env.WOMPI_STRICT_WEBHOOK_SIGNATURE || 'true').toLowerCase() !== 'false';

    // Validación de firma OBLIGATORIA en producción
    // Wompi envía un checksum en el header o en el body (signature.checksum)
    const EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET;
    
    if (EVENTS_SECRET) {
      // Obtener checksum del evento - puede venir en header o en body
      const receivedChecksum = req.headers['x-event-checksum'] 
        || event.signature?.checksum 
        || null;
      
      if (!receivedChecksum) {
        console.warn('⚠️ Webhook sin checksum recibido');
        if (strictWebhookValidation) {
          return {
            success: false,
            error: 'Webhook sin checksum (rechazado en modo estricto)'
          };
        }
        // En no-producción permitimos continuar para facilitar pruebas locales.
      } else {
        // Wompi: la firma es SHA-256 de la concatenación de los valores
        // indicados en signature.properties + events_secret
        const transaction = event.data?.transaction || {};
        let concatenated;
        
        // Usar signature.properties si está disponible (formato nuevo Wompi)
        if (event.signature?.properties && Array.isArray(event.signature.properties)) {
          const values = event.signature.properties.map(prop => {
            // Resolver propiedades anidadas como "transaction.id"
            const parts = prop.split('.');
            let value = event.data;
            for (const part of parts) {
              value = value?.[part];
            }
            return value !== undefined && value !== null ? String(value) : '';
          });
          concatenated = values.join('') + EVENTS_SECRET;
        } else {
          // Formato legacy: transaction.id + transaction.status + transaction.amount_in_cents + events_secret
          concatenated = `${transaction.id}${transaction.status}${transaction.amount_in_cents}${EVENTS_SECRET}`;
        }
        
        const expectedChecksum = crypto
          .createHash('sha256')
          .update(concatenated)
          .digest('hex');
        
        if (receivedChecksum !== expectedChecksum) {
          // Intentar formato alternativo con más campos
          const altConcatenated = `${event.event}${transaction.id}${transaction.status}${transaction.status_message || ''}${transaction.amount_in_cents}${event.sent_at}${EVENTS_SECRET}`;
          const altChecksum = crypto
            .createHash('sha256')
            .update(altConcatenated)
            .digest('hex');
          
          if (receivedChecksum !== altChecksum) {
            // Tercer intento: HMAC con timestamp
            const signature = req.headers['x-signature'];
            const timestamp = req.headers['x-timestamp'];
            if (signature && timestamp) {
              const hmacSignature = crypto
                .createHmac('sha256', EVENTS_SECRET)
                .update(timestamp + JSON.stringify(req.body))
                .digest('hex');
              if (signature !== hmacSignature) {
                console.warn('⚠️ Firma de webhook inválida (todos los métodos fallaron)', {
                  receivedChecksum: receivedChecksum?.substring(0, 12) + '...',
                  expectedChecksum: expectedChecksum?.substring(0, 12) + '...',
                  transactionId: transaction.id,
                  status: transaction.status
                });
                if (strictWebhookValidation) {
                  return {
                    success: false,
                    error: 'Firma de webhook inválida'
                  };
                }
                console.warn('⚠️ Procesando webhook con firma inválida (solo permitido fuera de producción)');
              } else {
                console.log('✅ Webhook firma verificada (método HMAC)');
              }
            } else {
              if (strictWebhookValidation) {
                return {
                  success: false,
                  error: 'Checksum de webhook inválido'
                };
              }
              console.warn('⚠️ Checksum de webhook no coincide - continuando fuera de producción', {
                transactionId: transaction.id,
                status: transaction.status
              });
            }
          } else {
            console.log('✅ Webhook firma verificada (formato extendido)');
          }
        } else {
          console.log('✅ Webhook firma verificada correctamente');
        }
      }
    } else {
      console.warn('⚠️ WOMPI_EVENTS_SECRET no configurado - webhook NO verificado');
      if (strictWebhookValidation) {
        return {
          success: false,
          error: 'WOMPI_EVENTS_SECRET no configurado en producción'
        };
      }
    }
    
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