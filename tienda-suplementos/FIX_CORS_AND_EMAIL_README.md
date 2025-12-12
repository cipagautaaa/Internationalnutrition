# 🐛 SOLUCIONAR: Error CORS y Emails No Enviados

## 📌 Resumen del Problema

Tienes 2 problemas que se solucionan juntos:

| Problema | Error | Solución |
|---|---|---|
| Al registrarse, no llega código | "Network Error" + CORS error | Configurar `ALLOWED_ORIGINS` en Railway |
| Al comprar, no se envían emails | Silenciosos (no llegan) | Configurar variables de email en Railway |

---

## 🚀 Solución Rápida (5 minutos)

### 1. Abre Railway Dashboard
- Ve a [railway.app](https://railway.app)
- Abre proyecto **InternationalNutrition**
- Selecciona servicio **Backend**
- Tab: **Variables**

### 2. Agrega 5 Variables

```
ALLOWED_ORIGINS = https://internationalnutrition.vercel.app
EMAIL_PROVIDER = gmail
EMAIL_USER = tu_email@gmail.com
EMAIL_PASS = (ver guía: GOOGLE_APP_PASSWORD.md)
ADMIN_EMAIL = admin@example.com
```

### 3. Redeploy
- Ve a tab **Deployments**
- Haz clic en **Redeploy**
- Espera 2-5 minutos

### 4. Prueba
- Ve a [internationalnutrition.vercel.app](https://internationalnutrition.vercel.app)
- Crea una cuenta
- ✅ Debe llegar el código por email

---

## 📚 Guías Detalladas

Para instrucciones paso a paso con screenshots:

1. **[QUICK_FIX_CORS_EMAIL.md](./QUICK_FIX_CORS_EMAIL.md)** 
   - Solución en 5 minutos (RECOMENDADO PARA EMPEZAR)

2. **[RAILWAY_VARIABLES_VISUAL_GUIDE.md](./RAILWAY_VARIABLES_VISUAL_GUIDE.md)**
   - Guía visual con screenshots de dónde hacer clic en Railway

3. **[GOOGLE_APP_PASSWORD.md](./GOOGLE_APP_PASSWORD.md)**
   - Cómo obtener la contraseña de aplicación de Google
   - Importante si no tienes EMAIL_PASS

4. **[CORS_RAILWAY_SETUP.md](./CORS_RAILWAY_SETUP.md)**
   - Explicación detallada del error CORS
   - Por qué ocurre y cómo se soluciona

5. **[EMAIL_SETUP_RAILWAY.md](./EMAIL_SETUP_RAILWAY.md)**
   - Configuración avanzada de emails
   - Opciones: Gmail vs SendGrid
   - Solucionar problemas de entrega

---

## 🔍 Verificar que Funciona

### En Railway Logs (Backend):

```
✅ Deberías ver estas líneas:

📧 EMAIL_PROVIDER=gmail
[CORS] Allowed origins: [ 'https://internationalnutrition.vercel.app' ]
✅ Notificación de orden enviada al admin: admin@example.com
```

### En tu Navegador:

```
✅ No debe haber error "ERR_FAILED" en la consola
✅ No debe haber error "CORS policy" 
✅ El código debe llegar a tu email
```

---

## 🆘 Si Aún No Funciona

### Checklist de Verificación:

- [ ] Las variables están agregadas en Railway
- [ ] Hiciste Redeploy después de agregar variables
- [ ] El Redeploy se completó (estado: verde ✅)
- [ ] Esperaste 2-5 minutos después de Redeploy
- [ ] Recargaste la página de Vercel (Ctrl+F5 o Cmd+Shift+R)
- [ ] EMAIL_PASS no tiene espacios
- [ ] EMAIL_USER es tu email de Gmail
- [ ] Tienes autenticación de 2 pasos activada en Google

### Abre los Logs de Railway:

1. Backend → Logs
2. Busca: `[CORS]` y `EMAIL_PROVIDER`
3. Si no ves estas líneas, el Redeploy no se aplicó
4. Intenta Redeploy nuevamente

---

## 📊 Variables Configuradas vs No Configuradas

### Antes (Problema):
```
❌ ALLOWED_ORIGINS - NO EXISTE
❌ EMAIL_PROVIDER - NO EXISTE
❌ EMAIL_USER - NO EXISTE
❌ EMAIL_PASS - NO EXISTE
❌ ADMIN_EMAIL - NO EXISTE

Resultado:
- ✗ CORS Error
- ✗ Emails no se envían
- ✗ Error "Network Error"
```

### Después (Solución):
```
✅ ALLOWED_ORIGINS = https://internationalnutrition.vercel.app
✅ EMAIL_PROVIDER = gmail
✅ EMAIL_USER = juan@gmail.com
✅ EMAIL_PASS = lmnopqrstuvwxyz
✅ ADMIN_EMAIL = admin@example.com

Resultado:
- ✅ Frontend puede comunicarse con Backend
- ✅ Código de verificación se envía
- ✅ Confirmación de orden se envía
- ✅ Admin recibe notificación de orden
```

---

## 🎯 Orden de Lectura Recomendado

**Si tienes poco tiempo:**
1. [QUICK_FIX_CORS_EMAIL.md](./QUICK_FIX_CORS_EMAIL.md) ← EMPIEZA AQUI
2. [GOOGLE_APP_PASSWORD.md](./GOOGLE_APP_PASSWORD.md) ← Si no tienes EMAIL_PASS

**Si quieres entender todo:**
1. Este README
2. [QUICK_FIX_CORS_EMAIL.md](./QUICK_FIX_CORS_EMAIL.md)
3. [RAILWAY_VARIABLES_VISUAL_GUIDE.md](./RAILWAY_VARIABLES_VISUAL_GUIDE.md)
4. [GOOGLE_APP_PASSWORD.md](./GOOGLE_APP_PASSWORD.md)
5. [CORS_RAILWAY_SETUP.md](./CORS_RAILWAY_SETUP.md)
6. [EMAIL_SETUP_RAILWAY.md](./EMAIL_SETUP_RAILWAY.md)

---

## 📞 Resumen de Archivos

| Archivo | Para Qué | Tiempo |
|---|---|---|
| QUICK_FIX_CORS_EMAIL.md | Solución paso a paso | 5 min |
| RAILWAY_VARIABLES_VISUAL_GUIDE.md | Dónde hacer clic en Railway | 2 min |
| GOOGLE_APP_PASSWORD.md | Obtener contraseña de Google | 5 min |
| CORS_RAILWAY_SETUP.md | Entender el error CORS | 10 min |
| EMAIL_SETUP_RAILWAY.md | Opciones avanzadas de email | 10 min |

---

## ✅ Última Verificación

Una vez que todo funcione, deberías poder:

1. ✅ Registrarte y recibir código de verificación
2. ✅ Verificar tu email con el código
3. ✅ Hacer login
4. ✅ Hacer una compra
5. ✅ Recibir confirmación en tu email
6. ✅ Admin recibe notificación de la orden

---

**¿Necesitas ayuda? Revisa el archivo específico para tu problema.**

---

**Última actualización**: Diciembre 2025
