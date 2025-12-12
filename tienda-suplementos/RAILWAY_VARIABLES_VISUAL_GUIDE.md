# 📱 Railway Dashboard - Checklist Visual

## 🎯 Ubicación Exacta en Railway

### Paso 1: Entrar a Railway
```
1. Ve a railway.app
2. Inicia sesión
3. Haz clic en proyecto "InternationalNutrition"
```

### Paso 2: Seleccionar Backend
En la pantalla de proyecto verás:
- `backend` ← **SELECCIONA ESTE**
- frontend
- database (MongoDB)

### Paso 3: Ir a Variables
Dentro del servicio Backend, verás tabs:
- **Variables** ← **HACES CLIC AQUÍ**
- Deployments
- Logs
- Settings

---

## 📝 Agregar Variables - Paso a Paso

### Cuando abras "Variables":

Verás una lista como esto:
```
NODE_ENV = production
JWT_SECRET = jaFahl72ZDkw...
MONGODB_URI = mongodb+srv://...
```

### Para agregar una variable:
1. Busca botón **+ Add Variable** o **+ New Variable**
2. En campo **Name**: `ALLOWED_ORIGINS`
3. En campo **Value**: `https://internationalnutrition.vercel.app`
4. Presiona **Enter** o **Save**

### Repite para cada variable:
1. `ALLOWED_ORIGINS` → `https://internationalnutrition.vercel.app`
2. `EMAIL_PROVIDER` → `gmail`
3. `EMAIL_USER` → Tu email de Gmail
4. `EMAIL_PASS` → Tu contraseña de aplicación
5. `ADMIN_EMAIL` → Email del admin

---

## 🔄 Redeploy

Después de agregar las variables:

1. Ve a pestaña **Deployments**
2. Verás lista de deployments anteriores
3. En el más reciente, haz clic en botón **Redeploy** (icono de recarga)
4. Espera a que muestre ✅ en verde

---

## 📊 Verificar en Logs

Para confirmar que funcionó:

1. Ve a pestaña **Logs**
2. Busca estas líneas (pueden estar al inicio):
   ```
   📧 EmailService v2 con SendGrid cargado
   📧 EMAIL_PROVIDER=gmail
   [CORS] Allowed origins: [ 'https://internationalnutrition.vercel.app' ]
   ```

Si ves estas líneas = **¡Está funcionando!** ✅

---

## ⚠️ Errores Comunes

### "Porqué mi variable no se guarda?"
- Asegúrate de hacer clic en **Save** o presionar **Enter**
- Espera a que aparezca un ✓ verde

### "El Redeploy falla"
- Abre los **Logs** del deployment
- Busca `Error:` para ver el problema
- Probablemente EMAIL_PASS esté mal (con espacios o incompleto)

### "Aún sale error CORS en el navegador"
- Abre los **Logs** del Backend
- Verifica que dice: `[CORS] Allowed origins: [ 'https://internationalnutrition.vercel.app' ]`
- Si no lo ves, el redeploy no se completó

---

## 🖥️ Screenshot Guía

```
┌─ Railway Dashboard ──────────────────────────────┐
│                                                  │
│  Proyecto: InternationalNutrition                │
│  ┌────────────────────────────────────────────┐  │
│  │ backend ← SELECCIONA ESTE                  │  │
│  │ frontend                                   │  │
│  │ database                                   │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Tab: Variables ← HACES CLIC AQUÍ               │
│                                                  │
│  NODE_ENV = production                         │
│  JWT_SECRET = ***                              │
│  MONGODB_URI = ***                             │
│  ALLOWED_ORIGINS = https://international...   │ ← AGREGAR
│  EMAIL_PROVIDER = gmail                         │ ← AGREGAR
│  EMAIL_USER = ***                               │ ← AGREGAR
│  EMAIL_PASS = ***                               │ ← AGREGAR
│  ADMIN_EMAIL = ***                              │ ← AGREGAR
│                                                  │
│  [+ Add Variable]                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## ✅ Final Checklist

- [ ] Entré a railway.app
- [ ] Seleccioné proyecto InternationalNutrition
- [ ] Entré al servicio Backend
- [ ] Fui a pestaña Variables
- [ ] Agregué ALLOWED_ORIGINS = https://internationalnutrition.vercel.app
- [ ] Agregué EMAIL_PROVIDER = gmail
- [ ] Agregué EMAIL_USER = (mi email)
- [ ] Agregué EMAIL_PASS = (contraseña de 16 chars)
- [ ] Agregué ADMIN_EMAIL = (email del admin)
- [ ] Fui a Deployments y hice Redeploy
- [ ] Esperé a que Redeploy terminara ✅
- [ ] Verifiqué en Logs que las variables están presentes
- [ ] Probé crear una cuenta en Vercel y recibí el código

---

**Última actualización**: Diciembre 2025
