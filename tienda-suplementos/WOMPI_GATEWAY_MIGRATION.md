# Migración de Wompi: Checkout Widget → Gateway API

## 🎯 Problema Resuelto

Tu cuenta de Wompi está configurada en modo **Gateway** pero el código anterior usaba el **Widget de Checkout**, lo cual es incompatible. El error "habilita métodos de pago" ocurría porque el widget solo funciona con cuentas en modo Checkout.

## ✅ Solución Implementada

Se ha creado una integración completa usando la **API Gateway de Wompi** que funciona correctamente con tu cuenta.

---

## 📁 Archivos Creados/Modificados

### Frontend

1. **`frontend/src/components/WompiGatewayPayment.jsx`** ✨ NUEVO
   - Componente de pago con formulario de tarjeta
   - Tokenización directa con la API de Wompi
   - Validación de datos de tarjeta (número, CVC, fecha)
   - Interfaz segura y responsive

2. **`frontend/src/components/Checkout.jsx`** 🔧 MODIFICADO
   - Ahora redirige a `/wompi-gateway-payment` en lugar de `/wompi-payment`
   - Pasa `orderId`, `total` y `customerEmail` al nuevo componente

3. **`frontend/src/App.jsx`** 🔧 MODIFICADO
   - Importado `WompiGatewayPayment`
   - Agregada ruta `/wompi-gateway-payment`
   - Actualizado `isCheckoutRoute` para incluir la nueva ruta

### Backend

4. **`backend/utils/wompiGateway.js`** ✨ NUEVO
   - `createGatewayTransaction()`: Crea transacciones con la API Gateway
   - `getTransactionStatus()`: Consulta el estado de una transacción
   - `verifyWebhookSignature()`: Valida webhooks de Wompi
   - Manejo completo de errores

5. **`backend/routes/payments.js`** 🔧 MODIFICADO
   - Nueva ruta POST `/api/payments/wompi-gateway-payment`
   - Procesa pagos con tokenización
   - Actualiza estado de la orden según respuesta de Wompi
   - Soporte para 3DS (redireccionamiento si es necesario)

---

## ⚙️ Configuración Requerida

### 1. Variables de Entorno (Backend)

Edita `backend/.env` y **reemplaza** las credenciales de Wompi con las de **producción**:

```env
# Wompi Gateway - PRODUCCIÓN
WOMPI_PUBLIC_KEY=pub_prod_XXXXXXXXXX
WOMPI_PRIVATE_KEY=prv_prod_XXXXXXXXXX
WOMPI_EVENTS_SECRET=events_XXXXXXXXXX
WOMPI_INTEGRITY_SECRET=prod_integrity_XXXXXXXXXX
```

**¿Dónde encontrar estas credenciales?**
1. Ve a https://comercios.wompi.co/
2. Inicia sesión con tu cuenta
3. Ve a **Configuración → API Keys**
4. Copia las credenciales de **Producción** (las que empiezan con `pub_prod_` y `prv_prod_`)
5. Para `WOMPI_EVENTS_SECRET`, ve a **Webhooks → Secreto de eventos**
6. Para `WOMPI_INTEGRITY_SECRET`, está en la misma sección de API Keys

⚠️ **Asegúrate de usar las claves de PRODUCCIÓN, no las de TEST/SANDBOX**

### 2. Variables de Entorno (Frontend)

Edita `frontend/.env` y actualiza:

```env
VITE_WOMPI_PUBLIC_KEY=pub_prod_XXXXXXXXXX
```

⚠️ **IMPORTANTE**: 
- Solo usa la clave **pública** (`pub_prod_...`) en el frontend
- NUNCA expongas la clave privada (`prv_prod_...`) en el frontend
- Reinicia el servidor de desarrollo después de cambiar el .env

### 3. Configurar Webhooks en Wompi

Para recibir notificaciones de pago (aprobado, rechazado, etc.):

1. Ve a https://comercios.wompi.co/
2. Navega a **Configuración → Webhooks**
3. Agrega la URL de tu webhook: `https://tu-dominio.com/api/payments/wompi-webhook`
4. Selecciona los eventos:
   - `transaction.updated`
   - `transaction.approved`
   - `transaction.declined`

---

## 🔄 Flujo de Pago Gateway

```
1. Usuario completa el checkout
   ↓
2. Se crea una orden pendiente en la base de datos
   ↓
3. Usuario es redirigido a /wompi-gateway-payment
   ↓
4. Usuario ingresa datos de tarjeta:
   - Número de tarjeta (16 dígitos)
   - Nombre (como aparece en la tarjeta)
   - Fecha de expiración (MM/AA)
   - CVC (3-4 dígitos)
   ↓
5. Frontend tokeniza la tarjeta con Wompi
   POST https://production.wompi.co/v1/tokens/cards
   ↓
6. Se obtiene un token de tarjeta (no almacena datos sensibles)
   ↓
7. Se envía el token al backend
   POST /api/payments/wompi-gateway-payment
   ↓
8. Backend crea la transacción con Wompi
   POST https://production.wompi.co/v1/transactions
   ↓
9. Respuestas posibles:
   
   a) APPROVED ✅
      - Orden marcada como pagada
      - Usuario redirigido a /payment-success
   
   b) PENDING (3DS requerido) 🔐
      - Usuario redirigido a página de autenticación del banco
      - Vuelve a tu sitio después de autenticar
   
   c) DECLINED ❌
      - Orden marcada como fallida
      - Usuario ve mensaje de error
   
10. Webhooks actualizan el estado final
```

---

## 🧪 Pruebas

### Tarjetas de Prueba (Sandbox)

Si quieres probar primero en sandbox antes de usar producción:

**Tarjeta Aprobada:**
- Número: `4242424242424242`
- CVC: `123`
- Fecha: Cualquier fecha futura (ej: `12/25`)
- Nombre: Cualquier nombre

**Tarjeta Rechazada:**
- Número: `4111111111111111`

### Modo Producción

Para usar tarjetas reales:

1. Cambia las credenciales en `.env` a las de producción
2. Reinicia el servidor backend
3. Asegúrate de tener HTTPS habilitado (Wompi lo requiere en producción)

---

## 🔒 Seguridad

### ✅ Implementado

- **Tokenización**: Los datos de tarjeta nunca pasan por tu servidor
- **HTTPS**: Requerido para transacciones reales
- **Validación de webhooks**: Se verifica la firma de eventos
- **Variables de entorno**: Credenciales no están en el código

### ⚠️ Recomendaciones

1. **No almacenes datos de tarjetas**: Ya está implementado correctamente
2. **Usa HTTPS en producción**: Obligatorio para PCI compliance
3. **Monitorea logs**: Revisa errores de transacciones regularmente
4. **Rate limiting**: Ya tienes middleware de rate limiting implementado

---

## 🐛 Solución de Problemas

### Error: "Invalid token"
**Causa**: El token de tarjeta expiró o es inválido  
**Solución**: Los tokens expiran en 30 minutos. El usuario debe volver a ingresar la tarjeta.

### Error: "Unauthorized"
**Causa**: Credenciales de Wompi incorrectas  
**Solución**: Verifica que las claves en `.env` sean correctas y de producción.

### Error: "Card declined"
**Causa**: El banco rechazó la transacción  
**Solución**: El usuario debe intentar con otra tarjeta o contactar a su banco.

### Webhook no llega
**Causa**: URL incorrecta o servidor no accesible  
**Solución**:
1. Verifica que la URL en Wompi sea correcta
2. Asegúrate de que el servidor esté en HTTPS
3. Revisa logs del servidor para ver si llegan las peticiones

### El pago queda en PENDING indefinidamente
**Causa**: 3DS no fue completado o webhook no procesado  
**Solución**:
1. Verifica que los webhooks estén configurados
2. Consulta el estado manualmente: `GET /api/payments/verify-transaction/:transactionId`

---

## 📊 Diferencias: Checkout vs Gateway

| Aspecto | Checkout (Antiguo) | Gateway (Nuevo) |
|---------|-------------------|-----------------|
| **Interfaz** | Widget de Wompi | Formulario propio |
| **Control** | Limitado | Total |
| **Personalización** | Básica | Completa |
| **PCI Compliance** | Wompi gestiona | Tu responsabilidad (tokenización) |
| **Experiencia UX** | Redirección externa | Flujo en tu sitio |
| **Compatibilidad** | Solo cuentas Checkout | Solo cuentas Gateway |

---

## 🚀 Próximos Pasos

1. **Configurar credenciales de producción** en `.env`
2. **Configurar webhooks** en el panel de Wompi
3. **Probar transacciones reales** con tarjetas de prueba
4. **Monitorear logs** durante las primeras transacciones
5. **Opcional**: Agregar más métodos de pago (PSE, Nequi, etc.)

---

## 📞 Soporte

- **Documentación Wompi Gateway**: https://docs.wompi.co/docs/en/transacciones-gateway
- **Panel de comercios Wompi**: https://comercios.wompi.co/
- **Contacto Wompi**: soporte@wompi.co

---

## ✨ Archivos Antiguos (Puedes eliminarlos)

Estos archivos ya no son necesarios con la nueva integración Gateway:

- `frontend/src/components/WompiPaymentSimple.jsx` (usaba widget)
- `frontend/src/components/WompiCheckout.jsx` (usaba widget)
- `backend/utils/wompi.js` (para widget)

**No los elimines aún** hasta confirmar que la nueva integración funciona correctamente.

---

## 🎉 Beneficios de la Migración

✅ Compatible con tu cuenta Gateway  
✅ Mayor control sobre la experiencia de pago  
✅ Mejor integración con tu diseño  
✅ Datos de tarjeta nunca pasan por tu servidor  
✅ Soporte para 3DS (autenticación fuerte)  
✅ Webhooks para estados en tiempo real  

---

**¡Listo!** Tu integración de Wompi Gateway está completa. Ahora solo necesitas configurar las credenciales y probar. 🚀
