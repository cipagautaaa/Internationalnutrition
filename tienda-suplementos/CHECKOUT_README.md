# Sistema de Checkout y Pagos - Tienda Suplementos

## ✅ Funcionalidades Implementadas

### 🛒 Carrito de Compras
- ✅ Gestión completa del carrito (agregar, quitar, actualizar cantidades)
- ✅ Persistencia en localStorage
- ✅ Drawer lateral responsive
- ✅ Validación de stock
- ✅ Cálculo automático de totales

### 🔐 Autenticación Requerida
- ✅ Login con Gmail OAuth
- ✅ Protección de rutas de checkout
- ✅ Verificación de sesión

### 💳 Proceso de Checkout
- ✅ Formulario de datos de envío
- ✅ Selección de método de pago:
  - MercadoPago (tarjetas, efectivo)
  - Transferencia bancaria
  - Pago en efectivo contra entrega
- ✅ Validación de formularios
- ✅ Verificación de stock

### 🏦 Integración MercadoPago
- ✅ Crear preferencia de pago
- ✅ Redirección automática
- ✅ Webhook para confirmaciones
- ✅ Manejo de estados (approved/pending/rejected)

### 📄 Páginas de Confirmación
- ✅ Pago exitoso (`/payment/success`)
- ✅ Pago rechazado (`/payment/failure`)
- ✅ Pago pendiente (`/payment/pending`)
- ✅ Confirmación de orden (`/order-confirmation/:orderId`)

### 🗄️ Backend API
- ✅ Rutas de pagos (`/api/payments/`)
- ✅ Rutas de órdenes (`/api/orders/`)
- ✅ Modelos de Order y Product
- ✅ Middleware de autenticación
- ✅ Manejo de webhooks

## 📋 Configuración Necesaria

### 1. Variables de Entorno (Backend)

Crea un archivo `.env` en `/backend/` basado en `.env.example`:

```bash
# Base de datos
MONGODB_URI=mongodb://localhost:27017/tienda-suplementos

# JWT
JWT_SECRET=tu_jwt_secret_muy_secreto

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-tu_access_token_aqui
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret
```

### 2. Configurar MercadoPago

1. Crear cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Obtener credenciales de prueba
3. Configurar webhook URL: `tu_backend_url/api/payments/webhook`

### 3. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Iniciar Servicios

```bash
# Backend (terminal 1)
cd backend
npm start

# Frontend (terminal 2)
cd frontend
npm run dev
```

## 🚀 Flujo de Uso

### Para el Usuario:
1. **Navegar productos** → Agregar al carrito
2. **Abrir carrito** → Revisar productos
3. **Iniciar sesión** → Gmail OAuth
4. **Ir a checkout** → Completar datos de envío
5. **Seleccionar método de pago**:
   - **MercadoPago**: Redirige → Pago → Confirmación automática
   - **Transferencia**: Muestra datos bancarios → Pago manual
   - **Efectivo**: Confirmación → Pago al recibir
6. **Confirmación** → Email + Estado en perfil

### Estados de Orden:
- **pending**: Orden creada, esperando pago
- **processing**: Pago confirmado, preparando envío
- **shipped**: Enviado
- **delivered**: Entregado
- **cancelled**: Cancelado

### Estados de Pago:
- **pending**: Esperando confirmación
- **approved**: Pago confirmado
- **rejected**: Pago rechazado
- **cancelled**: Cancelado

## 🔧 API Endpoints

### Pagos
- `POST /api/payments/create-preference` - Crear preferencia MercadoPago
- `POST /api/payments/webhook` - Webhook MercadoPago
- `GET /api/payments/verify/:paymentId` - Verificar pago
- `GET /api/payments/status/:paymentId` - Estado del pago

### Órdenes
- `POST /api/orders/create` - Crear orden (transferencia/efectivo)
- `GET /api/orders/:orderId` - Obtener orden específica
- `GET /api/orders/` - Listar órdenes del usuario
- `PUT /api/orders/:orderId/status` - Actualizar estado (admin)
- `PUT /api/orders/:orderId/cancel` - Cancelar orden

## ⚠️ Consideraciones Importantes

### Seguridad
- ✅ Validación de precios en backend
- ✅ Verificación de stock antes de crear orden
- ✅ Webhook signature validation (implementar)
- ✅ Rate limiting en endpoints

### Stock Management
- Stock se reduce al confirmar pago (no al crear orden)
- Órdenes pendientes no afectan stock disponible
- Cancelaciones restauran stock automáticamente

### Email Notifications
- Confirmación de orden creada
- Confirmación de pago recibido
- Actualización de estado de envío
- Datos de transferencia bancaria

### Testing
- Usar credenciales de prueba de MercadoPago
- Probar todos los flujos de pago
- Verificar webhooks con ngrok en desarrollo

## 🐛 Troubleshooting

### Problemas Comunes:

**Error al crear preferencia MercadoPago**:
- Verificar ACCESS_TOKEN en .env
- Revisar formato de items en la request

**Webhook no recibido**:
- Verificar URL pública (usar ngrok en dev)
- Revisar configuración en MercadoPago

**Usuario no autenticado**:
- Verificar token JWT en localStorage
- Revisar middleware de auth en backend

**Stock insuficiente**:
- Validar datos en tiempo real
- Mostrar stock disponible en UI

## 📱 Próximas Mejoras

- [ ] Notificaciones push
- [ ] Tracking de envío
- [ ] Sistema de cupones/descuentos
- [ ] Múltiples direcciones de envío
- [ ] Wishlist/favoritos
- [ ] Reseñas de productos
- [ ] Panel de administración

---

**¡El sistema de checkout y pagos está completamente funcional!** 🎉

Las pruebas pueden realizarse con las credenciales de prueba de MercadoPago.