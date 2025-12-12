# ✅ Verificar Emails de Órdenes (Wompi)

## 🧪 Cómo Probar

### Paso 1: Haz una compra en tu tienda
1. Ve a [internationalnutrition.vercel.app](https://internationalnutrition.vercel.app)
2. Agrega productos al carrito
3. Ve a checkout
4. Selecciona **Wompi** como método de pago
5. Completa el pago (puedes usar tarjeta de prueba)

### Paso 2: Revisa los Logs de Railway

En Railway, Backend → Logs, deberías ver:

```
✅ Webhook procesado: Orden [ID], Estado: paid
📧 Enviando emails de confirmación...
✅ Email al admin enviado
✅ Email al cliente enviado
```

### Paso 3: Verifica Emails

- ✅ **Bandeja de entrada del usuario**: Debe llegar email de confirmación de orden
- ✅ **ADMIN_EMAIL** (configurado en Railway): Debe llegar notificación con detalles

---

## 📋 Checklist: Variables Necesarias en Railway

Verifica que tienes configuradas **TODAS** estas variables:

| Variable | Ejemplo | Status |
|---|---|---|
| `EMAIL_PROVIDER` | `sendgrid` | ✅ |
| `SENDGRID_API_KEY` | `SG.xxx...` | ✅ |
| `EMAIL_FROM` | `internationalnutritioncol@gmail.com` | ✅ |
| `ADMIN_EMAIL` | `admin@example.com` | ✅ |
| `WOMPI_EVENTS_SECRET` | (de tu cuenta Wompi) | ✅ |

---

## 🐛 Si NO llegan los Emails

### Verifica en Logs estas líneas:

```
❌ Si ves esto:
[ERR_BAD_REQUEST]
Error enviando correos en webhook
Status 403 o 401

✅ Si ves esto:
📧 Enviando emails de confirmación...
✅ Email al admin enviado
✅ Email al cliente enviado
```

### Soluciones Comunes:

| Error | Solución |
|---|---|
| `Status 403` | EMAIL_FROM no está verificado en SendGrid |
| `Status 401` | SENDGRID_API_KEY es inválida |
| `"Order not found"` | Problema con wompiReference o wompiTransactionId |
| No aparecen logs de email | El webhook no se está recibiendo |

---

## 🔍 Verificar Webhook de Wompi

Si no ves logs de webhook:

1. En tu cuenta de **Wompi Dashboard**
2. Ve a **Settings** → **Webhooks**
3. Verifica que la URL es:
   ```
   https://internationalnutrition-production.up.railway.app/api/wompi/wompi-webhook
   ```
4. Debe estar **activa** ✅

---

## 📧 Qué Emailes Debería Recibir

### Email 1: Confirmación al Cliente
```
To: email_del_cliente@example.com
Subject: ✅ Confirmación de Orden - INTSUPPS #ABC123
Contenido:
- Número de orden
- Total pagado
- Productos ordenados
- Dirección de envío
```

### Email 2: Notificación al Admin
```
To: ADMIN_EMAIL (de Railway)
Subject: 🛒 Nueva Orden Recibida - #ABC123
Contenido:
- Información del cliente
- Dirección de envío
- Detalles de todos los productos
- Total
```

---

## 📱 Si Falta ADMIN_EMAIL

Si NO configuraste `ADMIN_EMAIL` en Railway:
1. Ve a Railway → Backend → Variables
2. Agrega: `ADMIN_EMAIL` = tu email
3. Redeploy
4. Haz una nueva compra

Entonces:
- ✅ Emails irán a `ADMIN_EMAIL`
- ✅ Notificación será recibida por el admin

---

## ✅ Último Paso

Después de hacer una compra:

```bash
# En Railway Logs, deberías ver:

📧 [sendVerificationEmail] Iniciando envío a admin@example.com
✅ Notificación de orden enviada al admin: admin@example.com
✅ Email al cliente enviado

# Y deberías recibir 2 emails:
1. admin@example.com - Notificación de nueva orden
2. cliente@example.com - Confirmación de orden
```

---

**Última actualización**: Diciembre 2025
