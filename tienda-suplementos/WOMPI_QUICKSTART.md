# 🚀 Pasos Rápidos: Activar Wompi Gateway

## ✅ Checklist de Configuración

### 1️⃣ Obtener credenciales de Wompi

- [ ] Ir a https://comercios.wompi.co/
- [ ] Iniciar sesión con tu cuenta
- [ ] Ir a **Configuración → API Keys**
- [ ] Copiar `Public Key` (empieza con `pub_prod_...`)
- [ ] Copiar `Private Key` (empieza con `prv_prod_...`)
- [ ] Copiar `Integrity Secret` (empieza con `prod_integrity_...`)
- [ ] Ir a **Webhooks**
- [ ] Copiar `Events Secret` (empieza con `events_...`)

---

### 2️⃣ Configurar Backend

Edita `backend/.env`:

```env
WOMPI_PUBLIC_KEY=pub_prod_XXXXXXXXXX
WOMPI_PRIVATE_KEY=prv_prod_XXXXXXXXXX
WOMPI_EVENTS_SECRET=events_XXXXXXXXXX
WOMPI_INTEGRITY_SECRET=prod_integrity_XXXXXXXXXX
```

---

### 3️⃣ Configurar Frontend

Edita `frontend/.env`:

```env
VITE_WOMPI_PUBLIC_KEY=pub_prod_XXXXXXXXXX
```

---

### 4️⃣ Reiniciar Servidores

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

### 5️⃣ Configurar Webhooks en Wompi

- [ ] Ir a https://comercios.wompi.co/
- [ ] Ir a **Configuración → Webhooks**
- [ ] Agregar nueva URL webhook:
  - **URL**: `https://tu-dominio.com/api/payments/wompi-webhook`
  - **Eventos a escuchar**:
    - ✅ `transaction.updated`
    - ✅ `transaction.approved`
    - ✅ `transaction.declined`
- [ ] Guardar configuración

⚠️ **Nota**: Para desarrollo local, usa ngrok para exponer tu servidor:
```bash
ngrok http 5000
# Copia la URL https:// que te da (ej: https://abc123.ngrok.io)
# Webhook URL: https://abc123.ngrok.io/api/payments/wompi-webhook
```

---

### 6️⃣ Probar el Flujo

1. **Ir a tu tienda** → Agregar productos al carrito
2. **Checkout** → Llenar datos de envío
3. **Seleccionar Wompi** como método de pago
4. **Ingresar datos de tarjeta**:

**Tarjeta de prueba (Sandbox):**
- Número: `4242 4242 4242 4242`
- Nombre: `TEST USER`
- Fecha: `12/25`
- CVC: `123`

**Tarjeta real (Producción):**
- Usa tu tarjeta de crédito/débito real

5. **Confirmar pago** → Deberías ver "Pago exitoso"
6. **Verificar en Wompi** → Ir al panel y ver la transacción

---

## 🐛 Solución de Problemas

### Error: "Invalid public key"
- ✅ Verifica que copiaste la clave correcta (debe empezar con `pub_prod_`)
- ✅ Reinicia el servidor frontend después de cambiar `.env`

### Error: "Unauthorized" en backend
- ✅ Verifica que `WOMPI_PRIVATE_KEY` sea correcta (debe empezar con `prv_prod_`)
- ✅ Reinicia el servidor backend

### El pago se queda en "Procesando..."
- ✅ Abre la consola del navegador (F12) y busca errores
- ✅ Revisa los logs del backend
- ✅ Verifica que las credenciales sean de producción, no de test

### Webhook no llega
- ✅ Verifica que la URL sea correcta en Wompi
- ✅ Asegúrate de que el servidor esté accesible públicamente (usa ngrok en desarrollo)
- ✅ Revisa los logs del backend cuando hagas un pago

---

## 📊 Verificar que Todo Funciona

### Checklist Final

- [ ] Backend levantado sin errores
- [ ] Frontend levantado sin errores
- [ ] Puedo agregar productos al carrito
- [ ] Puedo ir al checkout
- [ ] Veo el formulario de tarjeta de Wompi
- [ ] Puedo ingresar datos de tarjeta
- [ ] El pago se procesa correctamente
- [ ] Veo la página de "Pago exitoso"
- [ ] Recibo email de confirmación
- [ ] La orden aparece en mi panel de usuario
- [ ] En Wompi veo la transacción como APROBADA

---

## 🎉 ¡Listo!

Si todos los pasos del checklist están ✅, tu integración de Wompi Gateway está funcionando.

---

## 📞 Necesitas Ayuda?

- **Documentación completa**: Ver `WOMPI_GATEWAY_MIGRATION.md`
- **Soporte Wompi**: soporte@wompi.co
- **Documentación API**: https://docs.wompi.co/
