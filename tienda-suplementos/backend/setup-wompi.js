#!/usr/bin/env node

console.log('🎯 CONFIGURACIÓN DE WOMPI PARA TU TIENDA DE SUPLEMENTOS');
console.log('=====================================================\n');

console.log('📋 PASOS PARA CONFIGURAR WOMPI:');
console.log('===============================\n');

console.log('1️⃣ REGISTRARSE EN WOMPI:');
console.log('   🌐 Ve a: https://comercios.wompi.co/');
console.log('   📝 Completa el registro de tu negocio');
console.log('   ✅ Verifica tu email\n');

console.log('2️⃣ OBTENER CREDENCIALES DE PRUEBA:');
console.log('   🔑 Ve a: "Desarrolladores" > "Secretos para integración técnica"');
console.log('   📋 Copia estas 3 claves:');
console.log('      • Llave pública de prueba (pub_test_...)');
console.log('      • Llave privada de prueba (prv_test_...)'); 
console.log('      • Secreto de integridad de prueba (test_integrity_...)\n');

console.log('3️⃣ CONFIGURAR VARIABLES DE ENTORNO:');
console.log('   📂 Backend (.env):');
console.log('   ─────────────────────');
console.log('   WOMPI_PUBLIC_KEY=pub_test_TU_CLAVE_PUBLICA');
console.log('   WOMPI_PRIVATE_KEY=prv_test_TU_CLAVE_PRIVADA');
console.log('   WOMPI_INTEGRITY_SECRET=test_integrity_TU_SECRETO');
console.log('   WOMPI_BASE_URL=https://sandbox.wompi.co/v1\n');

console.log('   📂 Frontend (.env):');
console.log('   ─────────────────────');
console.log('   VITE_WOMPI_PUBLIC_KEY=pub_test_TU_CLAVE_PUBLICA\n');

console.log('4️⃣ DATOS DE PRUEBA PARA TESTING:');
console.log('   💳 Tarjetas de prueba (Sandbox):');
console.log('   ──────────────────────────────');
console.log('   ✅ VISA aprobada:     4242424242424242');
console.log('   ✅ Mastercard aprobada: 5555555555554444');
console.log('   ❌ Visa declinada:    4000000000000002');
console.log('   📅 Fecha: Cualquier fecha futura');
console.log('   🔐 CVC: Cualquier 3 dígitos');
console.log('   👤 Nombre: Cualquier nombre\n');

console.log('5️⃣ VENTAJAS VS MERCADOPAGO:');
console.log('   ✅ Proceso más simple para el usuario');
console.log('   ✅ No requiere cuenta de billetera');
console.log('   ✅ Pago directo con tarjeta');
console.log('   ✅ Widget integrado en tu sitio');
console.log('   ✅ Mejor experiencia de usuario');
console.log('   ✅ Captura todos los datos necesarios\n');

console.log('6️⃣ PARA PRODUCCIÓN:');
console.log('   🏭 Usa las credenciales de producción:');
console.log('      • pub_prod_... (pública)');
console.log('      • prv_prod_... (privada)');
console.log('      • prod_integrity_... (integridad)');
console.log('   🌐 URL: https://production.wompi.co/v1\n');

console.log('📞 SOPORTE:');
console.log('   📧 Email: soporte@wompi.co');
console.log('   📖 Docs: https://docs.wompi.co/');
console.log('   💬 Chat en: https://comercios.wompi.co/\n');

console.log('🚀 ¡Tu tienda está lista para recibir pagos más simples!\n');

console.log('💡 CONSEJO: Wompi es mucho mejor que MercadoPago para e-commerce');
console.log('   porque no requiere que los usuarios tengan billeteras o cuentas.');
console.log('   ¡Solo ingresan su tarjeta y pagan!');