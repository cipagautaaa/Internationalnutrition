require('dotenv').config();
const { sendVerificationEmail, sendPasswordResetEmail } = require('./utils/emailService');

async function testVerificationEmails() {
  console.log('====================================');
  console.log('🧪 PROBANDO EMAILS DE VERIFICACIÓN');
  console.log('====================================\n');
  
  // Mostrar configuración actual
  console.log('📧 CONFIGURACIÓN ACTUAL:');
  console.log('  EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'NO CONFIGURADO');
  console.log('  SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ PRESENTE' : '❌ FALTANTE');
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || 'NO CONFIGURADO');
  console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADO');
  console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ PRESENTE' : '❌ FALTANTE');
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('\n');

  // Email de prueba - cambiar por un email real para probar
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testCode = '123456';
  
  console.log(`📧 Email de prueba: ${testEmail}`);
  console.log(`📧 Código de prueba: ${testCode}\n`);

  try {
    console.log('1️⃣ Probando sendVerificationEmail...');
    const result1 = await sendVerificationEmail(testEmail, testCode);
    console.log('   Resultado:', JSON.stringify(result1, null, 2));
    
    if (result1?.skipped) {
      console.log('   ⚠️ Email SALTADO (configuración faltante o error)');
      if (result1?.error) {
        console.log('   ❌ Error:', result1.error);
      }
    } else {
      console.log('   ✅ Email de verificación enviado correctamente');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n');
  
  try {
    console.log('2️⃣ Probando sendPasswordResetEmail...');
    const result2 = await sendPasswordResetEmail(testEmail, testCode);
    console.log('   Resultado:', JSON.stringify(result2, null, 2));
    
    if (result2?.skipped) {
      console.log('   ⚠️ Email SALTADO (configuración faltante o error)');
      if (result2?.error) {
        console.log('   ❌ Error:', result2.error);
      }
    } else {
      console.log('   ✅ Email de recuperación enviado correctamente');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n====================================');
  console.log('🏁 PRUEBA FINALIZADA');
  console.log('====================================');
}

testVerificationEmails();
