# 🔧 Configurar CORS en Railway para Vercel

## El Problema
El error que ves es un **error de CORS (Cross-Origin Resource Sharing)**:

```
Access to XMLHttpRequest at 'https://internationalnutrition-production.up.railway.app/api/auth/send-code' 
from origin 'https://internationalnutrition.vercel.app' has been blocked by CORS policy
```

Esto significa que tu frontend en Vercel no puede comunicarse con tu backend en Railway porque el servidor no está configurado para permitir requests desde el dominio de Vercel.

---

## ✅ Solución: Configurar ALLOWED_ORIGINS en Railway

### Paso 1: Accede al Dashboard de Railway
1. Ve a [railway.app](https://railway.app)
2. Entra en tu cuenta
3. Selecciona tu proyecto: **InternationalNutrition**
4. Selecciona el servicio de **Backend** (el que está en Railway)

### Paso 2: Ve a Variables de Entorno
En el panel del Backend:
- Haz clic en **Variables** (o **Environment Variables**)
- Verás una lista de variables existentes

### Paso 3: Añade ALLOWED_ORIGINS
1. Haz clic en el botón **+ Agregar Variable** o **+ Add Variable**
2. En el campo **Key** escribe:
   ```
   ALLOWED_ORIGINS
   ```

3. En el campo **Value** escribe:
   ```
   https://internationalnutrition.vercel.app
   ```

4. **Presiona Enter o guarda**

### Paso 4: Redeploy del Backend
Después de agregar la variable, debes redeploy:
1. En el servicio del Backend, busca la sección **Deployment** o **Deployments**
2. Haz clic en el botón **Redeploy** o **Trigger Deploy**
3. Espera a que se complete (toma 2-5 minutos)

---

## ✅ Si Tienes Múltiples Dominios

Si en el futuro tienes más dominios (ejemplo: tu propio dominio personalizado), puedes agregarlos separados por comas:

```
https://internationalnutrition.vercel.app,https://www.tudominio.com,https://tudominio.com
```

---

## 🧪 Verificar que Funcionó

Después de redeploy, prueba en tu frontend:

1. Ve a **https://internationalnutrition.vercel.app**
2. Intenta crear una cuenta
3. Si ves que el código llega al correo, ¡funcionó!

---

## 📋 Checklist de Configuración

- [ ] He entrado a Railway Dashboard
- [ ] He seleccionado el servicio de Backend
- [ ] He agregado la variable `ALLOWED_ORIGINS` con valor `https://internationalnutrition.vercel.app`
- [ ] He hecho Redeploy
- [ ] El Redeploy se completó exitosamente
- [ ] Probé crear una nueva cuenta en Vercel y recibí el código por correo

---

## ❌ Si Aún no Funciona

### Verifica el Redeploy
- Abre los **Logs** del Backend en Railway
- Busca una línea que diga: `[CORS] Allowed origins: [ 'https://internationalnutrition.vercel.app' ]`
- Si NO ves esta línea, el redeploy no se aplicó correctamente

### Redeploy Manual
Si el redeploy no funcionó:
1. Ve a **Deployments** en Railway
2. Haz clic en el último deployment
3. Haz clic en **Redeploy**
4. Espera a que se complete completamente

### Limpiar Caché
Si el navegador está cacheando la respuesta anterior:
1. En tu navegador, abre Developer Tools (F12)
2. Ve a **Application** → **Cache Storage**
3. Elimina todos los caches
4. Recarga la página

---

## 📧 Para los Emails en Órdenes

El mismo problema de CORS afecta a los emails de órdenes. Una vez que hayas configurado `ALLOWED_ORIGINS` correctamente, también se arreglarán automáticamente los emails de compra.

Los emails se enviarán a:
- **Admin**: `ADMIN_EMAIL` en Railway
- **Vendedor**: Email del vendedor registrado en la orden

Verifica que estas variables estén configuradas en Railway:
- `EMAIL_USER` (tu email de Gmail)
- `EMAIL_PASS` (tu App Password de Gmail, no la contraseña normal)
- `EMAIL_FROM` (nombre y email del remitente)
- `ADMIN_EMAIL` (email del admin)

---

## 🆘 Problemas Comunes

### "Variable no se guarda en Railway"
- Asegúrate de presionar **Enter** o hacer clic en **Save/Guardar**
- Espera a que aparezca un checkmark verde

### "El Redeploy falla"
- Abre los logs para ver el error específico
- Contacta con Railway Support si persiste

### "Aún sale error de CORS después de redeploy"
- Abre DevTools (F12) → Network
- Mira la respuesta de la request fallida
- Si aún dice "No 'Access-Control-Allow-Origin' header", el redeploy no se aplicó
- Intenta redeploy nuevamente

---

**Última actualización**: Diciembre 2025
