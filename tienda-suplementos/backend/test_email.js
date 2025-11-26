require('dotenv').config();
const { sendNewOrderNotificationToAdmin, sendOrderConfirmationToCustomer } = require('./utils/emailService');

async function testEmail() {
  try {
    console.log('🧪 Probando servicio de correo...');
    
    // Datos de prueba
    const testOrder = {
      _id: '68eebf7ed567e60d0cb73650',
      orderNumber: 'ORDER-TEST123',
      status: 'paid',
      paymentStatus: 'paid',
      paymentMethod: 'wompi',
      totalAmount: 210000,
      createdAt: new Date(),
      items: [{
        product: { name: 'bipro' },
        quantity: 1,
        price: 210000
      }],
      shippingAddress: {
        fullName: 'Juan Pablo Bayona Garavito',
        phoneNumber: '3107856445',
        street: 'Avenida Universitaria #29-92',
        addressLine2: 'torre 2 apto 205',
        city: 'Tunja',
        region: 'Boyacá'
      }
    };
    
    const testUser = {
      email: 'juanpaba14@gmail.com',
      firstName: 'Juan Pablo',
      lastName: 'Bayona Garavito'
    };
    
    console.log('📧 Enviando correo al administrador...');
    await sendNewOrderNotificationToAdmin(testOrder, testUser);
    console.log('✅ Correo al admin enviado!');
    
    console.log('📧 Enviando confirmación al cliente...');
    await sendOrderConfirmationToCustomer(testOrder, testUser);
    console.log('✅ Confirmación al cliente enviada!');
    
    console.log('\n🎉 ¡Ambos correos enviados exitosamente!');
    console.log('🔍 Revisa tu bandeja de entrada y spam');
    
  } catch (error) {
    console.error('❌ Error enviando correos:', error);
  }
}

testEmail();