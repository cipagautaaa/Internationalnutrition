# 🚀 SOLUCIÓN RÁPIDA - Error de CORS y Emails

## El Problema
- ❌ No se envía código de verificación al registrarse
- ❌ No se envía confirmación de compra
- ✗ Error: "No 'Access-Control-Allow-Origin' header"

## Las Causas (2 problemas)

### 1️⃣ CORS No Configurado en Railway
El frontend en Vercel no puede hablar con el backend en Railway.

### 2️⃣ Emails No Configurados en Railway
Las variables de email no están en Railway.

---

## 🔧 SOLUCIÓN EN 5 MINUTOS

### PASO 1: Ir a Railway Dashboard

1. Abre [railway.app](https://railway.app)
2. Entra en tu proyecto **InternationalNutrition**
3. Selecciona servicio **Backend**
4. Haz clic en pestaña **Variables**

### PASO 2: Agregar 5 Variables

Copia y pega estos **exactamente**:

```
ALLOWED_ORIGINS = https://internationalnutrition.vercel.app

EMAIL_PROVIDER = gmail

EMAIL_USER = tu_email@gmail.com

EMAIL_PASS = (tu contraseña de 16 caracteres de Google - ver abajo)

ADMIN_EMAIL = admin@example.com
```

#### ⚠️ Para EMAIL_PASS:
1. Ve a [Google Account](https://myaccount.google.com/security)
2. Busca "Contraseñas de aplicación"
3. Selecciona Mail + tu dispositivo
4. Copia la contraseña de 16 caracteres
5. **Pega sin espacios** en Railway

### PASO 3: Redeploy

1. En el servicio Backend, haz clic en **Redeploy**
2. Espera a que termine (2-5 minutos)
3. Verifica en los Logs que dice: `[CORS] Allowed origins: [ 'https://internationalnutrition.vercel.app' ]`

### PASO 4: Prueba

1. Ve a [internationalnutrition.vercel.app](https://internationalnutrition.vercel.app)
2. Crea una cuenta
3. **¡Deberías recibir el código por email!**

---

## 📋 Resumen de Variables

| Variable | Valor |
|---|---|
| ALLOWED_ORIGINS | https://internationalnutrition.vercel.app |
| EMAIL_PROVIDER | gmail |
| EMAIL_USER | Tu email de Gmail |
| EMAIL_PASS | Contraseña de aplicación (16 chars) |
| ADMIN_EMAIL | Email del admin |

---

## ✅ ¿Funciona?

Deberías ver:
- ✅ Código de verificación llega por email
- ✅ Confirmación de compra llega a ti y al admin
- ✅ No hay error "CORS" en la consola del navegador

---

## 🆘 Si no funciona

**Verifica en Railway Logs:**
```
📧 EMAIL_PROVIDER=gmail ✅
[CORS] Allowed origins: [ 'https://internationalnutrition.vercel.app' ] ✅
```

Si ves `NO_CONFIGURADO`, repite PASO 2 y PASO 3.

---

**Documentos completos:**
- Ver [CORS_RAILWAY_SETUP.md](./CORS_RAILWAY_SETUP.md) para más detalles sobre CORS
- Ver [EMAIL_SETUP_RAILWAY.md](./EMAIL_SETUP_RAILWAY.md) para opciones avanzadas de email

---

**Última actualización**: Diciembre 2025
