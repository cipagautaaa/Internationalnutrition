const crypto = require('crypto');

// Usaremos algoritmo TOTP estándar: 6 dígitos, periodo 30s, HMAC-SHA1 (compatible apps Authenticator)
// Evitamos instalar dependencia externa para mantener ligereza.

function base32ToBuffer(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let bytes = [];
  base32 = base32.replace(/=+$/, '').toUpperCase();
  for (let i = 0; i < base32.length; i++) {
    const val = alphabet.indexOf(base32[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateBase32Secret(length = 20) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const random = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += alphabet[random[i] % alphabet.length];
  }
  return secret;
}

function generateTOTP(secret, timeStep = 30, digits = 6, timestamp = Date.now()) {
  const key = base32ToBuffer(secret);
  const counter = Math.floor(timestamp / 1000 / timeStep);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / Math.pow(2, 32)), 0);
  buffer.writeUInt32BE(counter & 0xffffffff, 4);
  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  let otp = (code % Math.pow(10, digits)).toString();
  return otp.padStart(digits, '0');
}

function verifyTOTP(token, secret, window = 1, timeStep = 30, digits = 6) {
  const now = Date.now();
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const timestamp = now + errorWindow * timeStep * 1000;
    const expected = generateTOTP(secret, timeStep, digits, timestamp);
    if (expected === token) return true;
  }
  return false;
}

module.exports = { generateBase32Secret, generateTOTP, verifyTOTP };