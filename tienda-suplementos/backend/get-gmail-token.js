/**
 * Script para obtener el Refresh Token de Gmail OAuth2
 * 
 * INSTRUCCIONES:
 * 1. Configura GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET en tu .env
 * 2. Ejecuta: node get-gmail-token.js
 * 3. Abre el enlace en el navegador
 * 4. Autoriza la aplicación
 * 5. Copia el código que aparece en la URL de redirección
 * 6. Pégalo en la terminal
 * 7. El script te dará el GMAIL_REFRESH_TOKEN
 */

// Usar override para evitar que variables persistentes del terminal (PowerShell)
// de ejecuciones anteriores rompan el flujo con invalid_client.
require('dotenv').config({ override: true });
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Falta GMAIL_CLIENT_ID o GMAIL_CLIENT_SECRET en .env');
  console.log('\nAgrega estas variables a tu archivo .env:');
  console.log('GMAIL_CLIENT_ID=tu_client_id');
  console.log('GMAIL_CLIENT_SECRET=tu_client_secret');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generar URL de autorización
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  // Scope mínimo requerido para enviar emails
  scope: ['https://www.googleapis.com/auth/gmail.send'],
  prompt: 'consent'
});

console.log('====================================');
console.log('🔐 OBTENER GMAIL REFRESH TOKEN');
console.log('====================================\n');
console.log('1. Abre este enlace en tu navegador:\n');
console.log(authUrl);
console.log('\n2. Autoriza la aplicación con tu cuenta de Gmail');
console.log('3. Serás redirigido a una página que puede dar error (está bien)');
console.log('4. Copia el parámetro "code" de la URL');
console.log('   Ejemplo: http://localhost:3000/oauth2callback?code=ESTE_CODIGO&scope=...');
console.log('\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Pega el código aquí: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n====================================');
    console.log('✅ ¡TOKEN OBTENIDO EXITOSAMENTE!');
    console.log('====================================\n');
    console.log('Agrega esta variable a Railway:\n');
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n');
    console.log('Variables completas para Railway:');
    console.log('--------------------------------');
    console.log('EMAIL_PROVIDER=gmail-oauth');
    console.log(`EMAIL_USER=${process.env.EMAIL_USER || 'tu_email@gmail.com'}`);
    console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
  }
  rl.close();
});
