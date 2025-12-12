# 📧 Configurar Emails en Railway - Guía Completa

## El Problema con los Emails

Tienes dos problemas con emails:
1. **Registro**: No se envía el código de verificación al crear una cuenta
2. **Órdenes**: No se envía confirmación al admin ni al cliente al hacer compra

Ambos problemas tienen la misma causa: **variables de email no configuradas en Railway**

---

## ✅ Solución: Configurar Email en Railway

### Opción 1: Usar Gmail (Recomendado - Más Simple)

#### Paso 1: Obtener contraseña de aplicación de Gmail

1. Ve a tu cuenta de Google: [myaccount.google.com](https://myaccount.google.com)
2. En el menú izquierdo, haz clic en **Seguridad**
3. En la parte inferior derecha, busca **Contraseñas de aplicación**
4. Selecciona:
   - **App**: Mail
   - **Device**: Windows Computer (o tu dispositivo)
5. Google te mostrará una contraseña de 16 caracteres
6. **Cópiala** (aparece como: `xxxx xxxx xxxx xxxx`)

#### Paso 2: Agregar variables en Railway

Ve a Railway Dashboard:
1. Abre tu proyecto **InternationalNutrition**
2. Selecciona el servicio **Backend**
3. Ve a **Variables** (Environment Variables)
4. Agrega estas 4 variables:

| Key | Valor |
|---|---|
| `EMAIL_PROVIDER` | `gmail` |
| `EMAIL_USER` | tu_correo@gmail.com |
| `EMAIL_PASS` | (la contraseña de 16 caracteres de Google) |
| `ADMIN_EMAIL` | el_email_del_admin@example.com |

**Ejemplo:**
```
EMAIL_PROVIDER = gmail
EMAIL_USER = juan.suplementos@gmail.com
EMAIL_PASS = lmno pqrs tuvw xyz (sin espacios)
ADMIN_EMAIL = admin@example.com
```

#### Paso 3: Redeploy
Haz clic en **Redeploy** en el servicio de Backend.

---

### Opción 2: Usar SendGrid (Alternativa - Si Gmail Falla)

Si tienes problemas con Gmail en Railway (a veces SMTP está bloqueado), usa SendGrid:

#### Paso 1: Crear cuenta en SendGrid
1. Ve a [sendgrid.com](https://sendgrid.com)
2. Crea una cuenta gratis
3. Verifica tu email

#### Paso 2: Crear API Key
1. En el dashboard, ve a **API Keys**
2. Haz clic en **Create API Key**
3. Dale un nombre: `Railway`
4. Copia la API Key (será muy larga)

#### Paso 3: Agregar variables en Railway

| Key | Valor |
|---|---|
| `EMAIL_PROVIDER` | `sendgrid` |
| `SENDGRID_API_KEY` | (tu API Key de SendGrid) |
| `EMAIL_FROM` | noreply@internationalnutrition.com |
| `ADMIN_EMAIL` | el_email_del_admin@example.com |

#### Paso 4: Redeploy

---

## 🧪 Probar que Funciona

### Test 1: Crear Nueva Cuenta

1. Ve a **https://internationalnutrition.vercel.app**
2. Haz clic en **Crear cuenta**
3. Rellena:
   - Nombre completo: `Juan Test`
   - Email: `test@example.com` (cualquier email válido)
   - Teléfono: `123213123`
   - Cumpleaños: `16/12/2003`
   - Contraseña: `Test1234`
4. Haz clic en **Continuar**

**Resultado esperado:**
- ✅ Debe llegar un correo con el código
- El código debe aparecer en tu bandeja de entrada

### Test 2: Hacer una Compra

1. Crea una cuenta (siguiendo Test 1)
2. Verifica el email con el código
3. Agrega productos al carrito
4. Ve a checkout
5. Selecciona "Transferencia bancaria" como método de pago
6. Haz clic en **Crear orden**

**Resultado esperado:**
- ✅ Debes recibir un correo de confirmación en `test@example.com`
- ✅ El ADMIN_EMAIL debe recibir una notificación de la nueva orden

---

## 📋 Checklist Completo

- [ ] He accedido a Railway Dashboard
- [ ] He entrado al servicio Backend
- [ ] He configurado las 4 variables de email correctamente:
  - [ ] `EMAIL_PROVIDER`
  - [ ] `EMAIL_USER`
  - [ ] `EMAIL_PASS`
  - [ ] `ADMIN_EMAIL`
- [ ] He hecho Redeploy
- [ ] El Redeploy se completó exitosamente
- [ ] He probado crear una cuenta y recibí el código
- [ ] He hecho una compra y ambos emails se enviaron

---

## ⚠️ Solucionar Problemas Comunes

### "No recibo ningún email"

**Verifica en Railway Logs:**
1. Abre el Backend en Railway
2. Ve a **Logs**
3. Busca las líneas que empiezan con `📧`
4. Deberías ver algo como:
   ```
   📧 EmailService v2 con SendGrid cargado
   📧 EMAIL_PROVIDER=gmail
   📧 EMAIL_FROM=...
   ```

Si ves `EMAIL_PROVIDER=NO_CONFIGURADO`, no agregaste la variable correctamente.

### "El Redeploy falla"

1. Abre los logs del deployment
2. Busca errores específicos
3. Asegúrate que la `EMAIL_PASS` de Gmail es la de **Contraseña de aplicación** (no la contraseña normal de Google)

### "Email se envía pero llega al spam"

- Verifica que `EMAIL_FROM` sea un email válido
- En Gmail, debes usar `EMAIL_FROM` similar a `EMAIL_USER` o con el dominio verificado

### "Contraseña de aplicación no funciona en Gmail"

1. Verifica que NO tienes espacios en la contraseña
2. Gmail muestra: `lmno pqrs tuvw xyz` → Debes poner sin espacios: `lmnopqrstuvwxyz`
3. Asegúrate que tienes activada la **autenticación de 2 pasos** en tu Google

---

## 📧 Variables de Email Explicadas

| Variable | Qué es | Ejemplo |
|---|---|---|
| `EMAIL_PROVIDER` | El servicio que usas para enviar | `gmail` o `sendgrid` |
| `EMAIL_USER` | Email que envía (Gmail) | `juan.suplementos@gmail.com` |
| `EMAIL_PASS` | Contraseña de aplicación de Google | `lmnopqrstuvwxyz` (16 caracteres) |
| `SENDGRID_API_KEY` | Token de SendGrid (si usas SendGrid) | Muy larga (100+ caracteres) |
| `EMAIL_FROM` | Nombre y email mostrado al usuario | `Tienda Suplementos <noreply@domain.com>` |
| `ADMIN_EMAIL` | Email que recibe notificaciones | `admin@example.com` |

---

## 🔗 Referencias Útiles

- [Google App Passwords](https://myaccount.google.com/apppasswords)
- [SendGrid Documentation](https://sendgrid.com/docs/)
- [Railway Environment Variables](https://docs.railway.app/deploy/environment-variables)

---

**Última actualización**: Diciembre 2025
