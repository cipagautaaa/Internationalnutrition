// scripts/testAdminPinFlow.js
// Prueba completa: login admin -> debe pedir PIN -> verificar PIN -> debe entregar token final.

const fetch = global.fetch || require('node-fetch');
const PIN = '836492';
const BASE = 'http://localhost:5000';

async function run() {
  try {
    // Paso 1: login (solo email)
    const loginRes = await fetch(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@supps.com' })
    });
    const loginJson = await loginRes.json();
    console.log('Login response:', loginJson);
    if (!loginJson.success) {
      console.error('Login falló');
      process.exit(1);
    }
    if (loginJson.data.step !== 'ADMIN_PIN_REQUIRED') {
      console.error('Se esperaba ADMIN_PIN_REQUIRED, obtenido:', loginJson.data.step);
      process.exit(1);
    }
    const tempToken = loginJson.data.tempToken;
    // Paso 2: verificar PIN
    const verifyRes = await fetch(BASE + '/api/auth/admin/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, pin: PIN })
    });
    const verifyJson = await verifyRes.json();
    console.log('Verify-pin response:', verifyJson);
    if (!verifyJson.success) {
      console.error('Verificación PIN falló');
      process.exit(1);
    }
    console.log('Flow OK -> token final emitido, longitud:', verifyJson.data.token.length);
  } catch (e) {
    console.error('Error en flujo PIN:', e);
    process.exit(1);
  }
}

run();
