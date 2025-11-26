# 🚀 GUÍA: ACTIVAR MERCADOPAGO EN PRODUCCIÓN

## 📋 PASOS PARA ACTIVAR MERCADOPAGO REAL

### 1. Obtener Credenciales de Producción
1. Ve a [developers.mercadopago.com](https://developers.mercadopago.com)
2. Inicia sesión con tu cuenta de MercadoPago
3. Ve a "Mis aplicaciones" → "Crear aplicación"
4. Completa el formulario:
   - Nombre: "Tienda de Suplementos"
   - ¿Qué vas a hacer?: "Recibir pagos online"
   - Selecciona tu país
5. Una vez creada, ve a la sección "Credenciales"
6. Copia las credenciales de **PRODUCCIÓN**:
   - `Access Token` (comienza con `APP_USR-`)
   - `Public Key` (comienza con `APP_USR-`)

### 2. Configurar Backend (.env)
```bash
# En el archivo backend/.env, reemplaza:
MERCADOPAGO_ACCESS_TOKEN=APP_USR-TU-ACCESS-TOKEN-REAL
MERCADOPAGO_PUBLIC_KEY=APP_USR-TU-PUBLIC-KEY-REAL

# Y cambia a modo producción:
NODE_ENV=production

# Configura tus URLs reales:
FRONTEND_URL=https://tu-dominio.com
BACKEND_URL=https://tu-api-dominio.com
SUCCESS_URL=https://tu-dominio.com/payment-success
FAILURE_URL=https://tu-dominio.com/payment-failure
PENDING_URL=https://tu-dominio.com/payment-pending
WEBHOOK_URL=https://tu-api-dominio.com/api/payments/webhook
```

### 3. Configurar Frontend (.env)
```bash
# En el archivo frontend/.env, reemplaza:
VITE_API_URL=https://tu-api-dominio.com/api
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-TU-PUBLIC-KEY-REAL
```

### 4. Configurar Webhook en MercadoPago
1. En tu aplicación de MercadoPago, ve a "Webhooks"
2. Agrega la URL: `https://tu-api-dominio.com/api/payments/webhook`
3. Selecciona los eventos:
   - `payment`
   - `merchant_order`

### 5. Verificar URLs de Redirección
En tu aplicación de MercadoPago, configura las URLs autorizadas:
- Success: `https://tu-dominio.com/payment-success`
- Failure: `https://tu-dominio.com/payment-failure`
- Pending: `https://tu-dominio.com/payment-pending`

### 6. Probar en Producción
1. Realiza una compra de prueba con un monto pequeño
2. Verifica que:
   - Se crea la preferencia correctamente
   - Redirecciona a MercadoPago
   - Los webhooks se reciben
   - El stock se actualiza
   - Se actualiza el estado del pedido

### 7. Consideraciones de Seguridad
- [ ] Nunca expongas las credenciales en el código
- [ ] Usa HTTPS en producción
- [ ] Valida siempre los webhooks
- [ ] Maneja errores apropiadamente
- [ ] Registra logs para debugging

### 8. Monitoreo
- [ ] Configura alertas para pagos fallidos
- [ ] Monitorea la salud del webhook
- [ ] Revisa logs regularmente
- [ ] Configura notificaciones de errores

## 🔧 COMANDOS ÚTILES

### Verificar configuración actual:
```bash
# Backend
cd backend
node -e "console.log('Access Token:', process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 20) + '...')"

# Frontend
cd frontend
npm run build
```

### Probar webhook localmente:
```bash
# Usar ngrok para exponer tu webhook local
npx ngrok http 5000
# Usar la URL de ngrok como webhook temporal
```

## ⚠️ IMPORTANTE
- Las credenciales TEST solo funcionan en sandbox
- Las credenciales PROD procesan dinero real
- Siempre prueba primero con montos pequeños
- MercadoPago puede tardar 24-48h en aprobar tu cuenta

## 📞 SOPORTE
- Documentación: https://www.mercadopago.com.ar/developers
- Soporte: https://www.mercadopago.com.ar/ayuda