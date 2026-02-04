require('dotenv').config();
const crypto = require('crypto');

console.log('=== DIAGNÓSTICO COMPLETO WOMPI ===\n');

// 1. Verificar credenciales
const creds = {
  publicKey: process.env.WOMPI_PUBLIC_KEY,
  privateKey: process.env.WOMPI_PRIVATE_KEY,
  integritySecret: process.env.WOMPI_INTEGRITY_SECRET,
  eventsSecret: process.env.WOMPI_EVENTS_SECRET
};

console.log('📋 CREDENCIALES DETECTADAS EN BACKEND:');
console.log('Public Key:', creds.publicKey ? creds.publicKey.substring(0, 25) + '...' : '❌ NO DEFINIDA');
console.log('Private Key:', creds.privateKey ? creds.privateKey.substring(0, 25) + '...' : '❌ NO DEFINIDA');
console.log('Integrity Secret:', creds.integritySecret ? creds.integritySecret.substring(0, 30) + '...' : '❌ NO DEFINIDA');
console.log('Events Secret:', creds.eventsSecret ? creds.eventsSecret.substring(0, 30) + '...' : '❌ NO DEFINIDA');

// 2. Verificar si están intercambiadas
console.log('\n⚠️ VERIFICACIÓN DE INTERCAMBIO DE SECRETS:');

const integrityHasEvents = creds.integritySecret && creds.integritySecret.includes('events');
const eventsHasIntegrity = creds.eventsSecret && creds.eventsSecret.includes('integrity');

if (integrityHasEvents) {
  console.log('🚨 ALERTA: INTEGRITY_SECRET contiene "events" - POSIBLEMENTE INTERCAMBIADO');
}
if (eventsHasIntegrity) {
  console.log('🚨 ALERTA: EVENTS_SECRET contiene "integrity" - POSIBLEMENTE INTERCAMBIADO');
}

if (creds.integritySecret && creds.integritySecret.startsWith('prod_integrity')) {
  console.log('✅ INTEGRITY_SECRET tiene prefijo correcto (prod_integrity)');
}
if (creds.eventsSecret && creds.eventsSecret.startsWith('prod_events')) {
  console.log('✅ EVENTS_SECRET tiene prefijo correcto (prod_events)');
}

// 3. Simular generación de firma exactamente como el código lo hace
console.log('\n🔐 TEST DE FIRMA DE INTEGRIDAD:');
const testReference = 'ORDER_test123';
const testAmountCents = 14500000; // $145.000 COP en centavos
const testCurrency = 'COP';

const concatenated = `${testReference}${testAmountCents}${testCurrency}${creds.integritySecret}`;
const hash = crypto.createHash('sha256').update(concatenated).digest('hex');

console.log('Referencia:', testReference);
console.log('Monto (centavos):', testAmountCents);
console.log('Monto (pesos):', testAmountCents / 100);
console.log('Moneda:', testCurrency);
console.log('String concatenado:', `${testReference}${testAmountCents}${testCurrency}[SECRET]`);
console.log('Hash SHA-256 generado:', hash);

// 4. Verificar formato de monto
console.log('\n💰 VERIFICACIÓN DE FORMATO DE MONTO:');
const testPrices = [145000, 145000.00, '145000', 14500000];
testPrices.forEach(price => {
  const inCents = Math.round(Number(price) * (price < 100000 ? 100 : 1));
  console.log(`Input: ${price} (${typeof price}) -> Centavos: ${inCents}`);
});

// 5. Verificación de URL base
console.log('\n🌐 URL BASE DE WOMPI:');
console.log('WOMPI_BASE_URL:', process.env.WOMPI_BASE_URL || 'https://production.wompi.co/v1 (default)');

// 6. Resumen
console.log('\n📊 RESUMEN:');
const issues = [];

if (!creds.publicKey) issues.push('Falta WOMPI_PUBLIC_KEY');
if (!creds.privateKey) issues.push('Falta WOMPI_PRIVATE_KEY');
if (!creds.integritySecret) issues.push('Falta WOMPI_INTEGRITY_SECRET');
if (integrityHasEvents || eventsHasIntegrity) issues.push('Los secrets podrían estar intercambiados');

if (issues.length === 0) {
  console.log('✅ Configuración de credenciales parece correcta');
} else {
  console.log('❌ Problemas detectados:');
  issues.forEach(i => console.log('  - ' + i));
}

console.log('\n📝 NOTA: Verifica que estas credenciales coincidan EXACTAMENTE con las del dashboard de Wompi');
console.log('   Dashboard: https://comercios.wompi.co -> Desarrollo -> Llaves de API');
