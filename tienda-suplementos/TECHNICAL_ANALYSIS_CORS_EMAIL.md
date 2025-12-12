# 🔧 Análisis Técnico: CORS y Emails en Railway

## 📝 Problemas Identificados

### 1. Error de CORS en Registro

**Síntoma:**
```
Access to XMLHttpRequest at 'https://internationalnutrition-production.up.railway.app/api/auth/send-code'
from origin 'https://internationalnutrition.vercel.app' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present
```

**Causa Raíz:**
El backend en Railway no está devolviendo el header `Access-Control-Allow-Origin` para permitir requests desde Vercel.

**Ubicación en Código:**
[backend/app.js](../backend/app.js) líneas 27-45:
```javascript
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
console.log('[CORS] Allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**El Problema:**
- La variable `ALLOWED_ORIGINS` no está configurada en Railway
- `allowedOrigins` array queda vacío
- Sin embargo, hay un fallback: `if (allowedOrigins.length === 0) return callback(null, true)`
- Pero este fallback SÓ funciona para requests CON origen
- Las solicitudes PREFLIGHT de CORS siguen bloqueadas

**Solución:**
Configurar `ALLOWED_ORIGINS=https://internationalnutrition.vercel.app` en Railway

---

### 2. Emails No Se Envían

**Síntoma:**
- Al registrarse: no llega código de verificación
- Al comprar: no llega confirmación ni notificación al admin

**Causa Raíz:**
Las variables de email no están configuradas en Railway:
- `EMAIL_PROVIDER` - no definida
- `EMAIL_USER` - no definida
- `EMAIL_PASS` - no definida
- `ADMIN_EMAIL` - no definida

**Ubicación en Código:**
[backend/utils/emailService.js](../backend/utils/emailService.js) líneas 1-15:
```javascript
console.log('📧 EmailService v2 con SendGrid cargado');
console.log(`📧 EMAIL_PROVIDER=${process.env.EMAIL_PROVIDER || 'NO_CONFIGURADO'}`);

const canSendEmails = () => {
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  if (provider === 'gmail') {
    return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  }
  // ... más proveedores
  return false;
};
```

**El Problema:**
1. Sin `EMAIL_PROVIDER`, `canSendEmails()` retorna `false`
2. Los emails se intenta enviar pero fallan silenciosamente
3. [backend/routes/auth.js](../backend/routes/auth.js) líneas 183-189:
```javascript
sendVerificationEmail(email, verificationCode)
  .then((info) => {
    if (info?.skipped) {
      console.log(`[send-code] Email SKIPPED (config faltante)`);
    } else {
      console.log(`[send-code] Email ENVIADO OK`);
    }
  })
  .catch((err) => {
    console.error(`[send-code] ⚠️ Error enviando email (no bloquea):`, err?.message);
  });
```

4. El error se registra en logs pero NO impide que la orden se cree
5. El usuario NO ve el error porque el endpoint devuelve 200 OK de todas formas

**Solución:**
Configurar variables de email:
- `EMAIL_PROVIDER=gmail`
- `EMAIL_USER=tu_email@gmail.com`
- `EMAIL_PASS=tu_app_password`
- `ADMIN_EMAIL=admin@example.com`

---

## 🔄 Flujo de Solicitud Afectado

### Flujo 1: Registro (Send Verification Code)

```
┌─ Frontend (Vercel) ─────────────────────────────┐
│                                                 │
│  POST /api/auth/send-code                       │
│  {email: "user@example.com", ...}               │
│                                                 │
└────────────────────────┬────────────────────────┘
                         │
                         ├─ PREFLIGHT OPTIONS REQUEST
                         │  ├─ No Access-Control-Allow-Origin header
                         │  └─ ❌ Bloqueado por CORS
                         │
                         └─ POST REQUEST (nunca se envía)
                            └─ (No llega por error CORS)

┌─ Backend (Railway) ────────────────────────────┐
│                                                 │
│  /api/auth/send-code handler                   │
│  ├─ Verifica credenciales de email             │
│  ├─ Genera código de verificación              │
│  ├─ Guarda en BD                               │
│  └─ Intenta enviar email:
│     ├─ Valida EMAIL_PROVIDER (❌ undefined)
│     ├─ canSendEmails() retorna false
│     └─ Email NO se envía
│
└────────────────────────────────────────────────┘
```

### Flujo 2: Crear Orden (Create Order)

```
┌─ Frontend (Vercel) ─────────────────────────────┐
│                                                 │
│  POST /api/orders/create                        │
│  {items: [...], totalAmount, ...}               │
│                                                 │
└────────────────────────┬────────────────────────┘
                         │
                         ├─ PREFLIGHT OPTIONS REQUEST
                         │  ├─ No Access-Control-Allow-Origin header
                         │  └─ ❌ Bloqueado por CORS
                         │
                         └─ POST REQUEST (nunca se envía)
                            └─ (No llega por error CORS)

┌─ Backend (Railway) ────────────────────────────┐
│                                                 │
│  /api/orders/create handler                    │
│  ├─ Valida items y stock                       │
│  ├─ Crea orden en BD                           │
│  ├─ Intenta enviar emails:
│  │  ├─ sendNewOrderNotificationToAdmin()
│  │  │  └─ createTransporterAsync()
│  │  │     └─ EMAIL_PROVIDER undefined
│  │  │        └─ ❌ No se envía
│  │  │
│  │  └─ sendOrderConfirmationToCustomer()
│  │     └─ createTransporterAsync()
│  │        └─ EMAIL_PROVIDER undefined
│  │           └─ ❌ No se envía
│  │
│  └─ Retorna 200 OK (orden creada)
│     (Pero los emails fallaron)
│
└────────────────────────────────────────────────┘
```

---

## 🔐 Configuración Correcta

### Variables Necesarias en Railway

```
╔════════════════════════════════════════════════╗
║          VARIABLES EN RAILWAY DASHBOARD        ║
╠════════════════════════════════════════════════╣
║                                                ║
║  1. CORS                                       ║
║     ALLOWED_ORIGINS = https://...vercel.app   ║
║                                                ║
║  2. EMAIL PROVIDER                             ║
║     EMAIL_PROVIDER = gmail                     ║
║                                                ║
║  3. EMAIL CREDENTIALS                          ║
║     EMAIL_USER = tu_email@gmail.com            ║
║     EMAIL_PASS = app_password_16_chars         ║
║                                                ║
║  4. EMAIL ADDRESSES                            ║
║     ADMIN_EMAIL = admin@example.com            ║
║     EMAIL_FROM = Tienda <noreply@...>          ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### Código Esperado Después de Configurar

```javascript
// En app.js
[CORS] Allowed origins: [ 'https://internationalnutrition.vercel.app' ]

// En emailService.js
📧 EmailService v2 con SendGrid cargado
📧 EMAIL_PROVIDER=gmail
📧 EMAIL_FROM=Tienda <noreply@domain.com>
```

---

## 📊 Comparación: Antes vs Después

### ANTES (Problema):

```
POST https://railway-backend/api/auth/send-code
│
├─ Navegador envía PREFLIGHT (OPTIONS)
│  └─ Railway no autoriza
│     └─ Browser bloquea → Error CORS ❌
│
└─ Request nunca llega al servidor
```

```
Si por algún milagro llegara:
│
├─ Backend recibe solicitud
├─ Intenta enviar email
│  └─ EMAIL_PROVIDER no existe
│     └─ No se envía ❌
├─ Devuelve 200 OK
└─ Usuario espera email que nunca llega 😞
```

### DESPUÉS (Solución):

```
POST https://railway-backend/api/auth/send-code
│
├─ Navegador envía PREFLIGHT (OPTIONS)
│  └─ Railway autoriza
│     ├─ Devuelve Access-Control-Allow-Origin ✅
│     └─ Browser permite continuar
│
└─ Request llega al servidor
   ├─ Crea usuario
   ├─ Genera código de verificación
   ├─ Envía email vía Gmail ✅
   │  └─ Usuario recibe código 😊
   └─ Devuelve 200 OK
```

---

## 🧪 Testing Manual

### Verificar CORS:

```bash
# En el navegador, abre DevTools (F12)
# Ve a Console y ejecuta:

fetch('https://internationalnutrition-production.up.railway.app/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))

# Deberías ver:
# ✅ {message: "Servidor funcionando correctamente"}
# ❌ CORS error si no está configurado
```

### Verificar Email:

```bash
# En los Logs de Railway, después de Redeploy:
# Busca estas líneas:

[CORS] Allowed origins: [ 'https://internationalnutrition.vercel.app' ]
📧 EMAIL_PROVIDER=gmail
✅ Notificación de orden enviada al admin
```

---

## 📚 Archivos Relacionados

| Archivo | Rol |
|---|---|
| `backend/app.js` | Configuración de CORS |
| `backend/routes/auth.js` | Rutas de autenticación y send-code |
| `backend/routes/orders.js` | Rutas de órdenes |
| `backend/utils/emailService.js` | Lógica de envío de emails |
| `backend/.env.example` | Plantilla de variables (ENV) |
| `backend/.env.production.example` | Plantilla para producción |

---

## 🔗 Referencias

- [CORS en Express.js](https://expressjs.com/en/resources/middleware/cors.html)
- [Nodemailer Documentación](https://nodemailer.com/)
- [Railway Environment Variables](https://docs.railway.app/deploy/environment-variables)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)

---

**Última actualización**: Diciembre 2025
