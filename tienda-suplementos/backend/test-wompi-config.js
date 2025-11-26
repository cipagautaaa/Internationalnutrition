require('dotenv').config();

/**
 * Script para verificar la configuración de Wompi Gateway
 * Ejecutar con: node backend/test-wompi-config.js
 */

console.log('\n🔍 Verificando configuración de Wompi Gateway...\n');

const checks = [
  {
    name: 'WOMPI_PUBLIC_KEY',
    value: process.env.WOMPI_PUBLIC_KEY,
    expected: /^pub_(test|prod)_/,
    critical: true
  },
  {
    name: 'WOMPI_PRIVATE_KEY',
    value: process.env.WOMPI_PRIVATE_KEY,
    expected: /^prv_(test|prod)_/,
    critical: true
  },
  {
    name: 'WOMPI_EVENTS_SECRET',
    value: process.env.WOMPI_EVENTS_SECRET,
    expected: /.+/,
    critical: true
  },
  {
    name: 'WOMPI_INTEGRITY_SECRET',
    value: process.env.WOMPI_INTEGRITY_SECRET,
    expected: /.+/,
    critical: false
  }
];

let allPassed = true;
let criticalFailed = false;

checks.forEach(check => {
  const exists = !!check.value;
  const valid = exists && check.expected.test(check.value);
  const status = valid ? '✅' : (exists ? '⚠️' : '❌');
  
  console.log(`${status} ${check.name}`);
  
  if (exists) {
    // Mostrar solo los primeros 15 caracteres por seguridad
    const preview = check.value.substring(0, 15) + '...';
    console.log(`   Valor: ${preview}`);
    
    if (!valid) {
      console.log(`   ⚠️  Formato incorrecto. Debería coincidir con: ${check.expected}`);
      allPassed = false;
      if (check.critical) criticalFailed = true;
    }
  } else {
    console.log(`   ❌ Variable no definida en .env`);
    allPassed = false;
    if (check.critical) criticalFailed = true;
  }
  
  if (check.critical && !valid) {
    console.log(`   🚨 CRÍTICO: Esta variable es necesaria para que funcione el pago`);
  }
  
  console.log('');
});

// Verificar modo de producción vs sandbox
const isProduction = process.env.WOMPI_PUBLIC_KEY?.startsWith('pub_prod_');
const mode = isProduction ? 'PRODUCCIÓN' : 'SANDBOX/TEST';

console.log(`📍 Modo detectado: ${mode}`);

if (!isProduction) {
  console.log('⚠️  ADVERTENCIA: Estás usando credenciales de SANDBOX/TEST');
  console.log('   Para aceptar pagos reales, necesitas credenciales de PRODUCCIÓN');
  console.log('   Obtén tus credenciales en: https://comercios.wompi.co/\n');
}

// Resultado final
console.log('─'.repeat(60));

if (criticalFailed) {
  console.log('❌ CONFIGURACIÓN INCOMPLETA');
  console.log('   Algunas variables críticas no están configuradas correctamente.');
  console.log('   El sistema de pagos NO funcionará.\n');
  console.log('📖 Consulta: WOMPI_QUICKSTART.md para instrucciones paso a paso\n');
  process.exit(1);
} else if (!allPassed) {
  console.log('⚠️  CONFIGURACIÓN PARCIAL');
  console.log('   Algunas variables opcionales no están configuradas.');
  console.log('   El sistema de pagos debería funcionar, pero puede tener limitaciones.\n');
} else {
  console.log('✅ CONFIGURACIÓN COMPLETA');
  console.log('   Todas las variables están correctamente configuradas.');
  console.log(`   Modo: ${mode}\n`);
  
  if (isProduction) {
    console.log('🚀 ¡Listo para aceptar pagos reales!\n');
  } else {
    console.log('🧪 Listo para pruebas en sandbox\n');
  }
}

// Test rápido de conexión a la API de Wompi
console.log('🌐 Probando conexión con Wompi...\n');

const https = require('https');

const url = isProduction 
  ? 'https://production.wompi.co/v1/merchants/pub_test_'
  : 'https://sandbox.wompi.co/v1/merchants/pub_test_';

https.get(url + process.env.WOMPI_PUBLIC_KEY, (res) => {
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('✅ API de Wompi alcanzable');
    console.log(`   Status: ${res.statusCode}\n`);
  } else {
    console.log(`⚠️  Respuesta inesperada de Wompi: ${res.statusCode}\n`);
  }
}).on('error', (err) => {
  console.log('❌ Error conectando con Wompi:');
  console.log(`   ${err.message}\n`);
});

console.log('─'.repeat(60));
console.log('✨ Verificación completada\n');
