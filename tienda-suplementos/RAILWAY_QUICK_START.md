# 🚀 PASOS RÁPIDOS PARA RAILWAY

## 1️⃣ ANTES DE EMPEZAR

### Verifica tus archivos críticos
```bash
# Desde c:\Users\juanp\InternationalNutrition

# El Dockerfile debe existir
Test-Path tienda-suplementos/backend/Dockerfile

# El package.json debe existir
Test-Path tienda-suplementos/backend/package.json

# El server.js debe existir
Test-Path tienda-suplementos/backend/server.js
```

---

## 2️⃣ HACER GIT PUSH (SI HAY CAMBIOS)

```bash
cd c:\Users\juanp\InternationalNutrition

# Ver cambios pendientes
git status

# Hacer commit
git add .
git commit -m "Preparando para despliegue en Railway"

# Push a GitHub
git push origin main
```

---

## 3️⃣ EN RAILWAY.APP

### OPCIÓN A: Usando la interfaz web (MÁS FÁCIL)

1. **Ir a https://railway.app**
2. **Login** con tu cuenta
3. **Click en "New Project"**
4. **Click en "Deploy from GitHub repo"**
5. **Selecciona**: InternationalNutrition
6. **Selecciona rama**: main
7. **Click en el proyecto creado**
8. **Click en "New Service"**
9. **Selecciona**: GitHub Repo → InternationalNutrition
10. **Espera a que cargue**, luego:
    - **Root Directory**: `tienda-suplementos/backend`
    - **Build command**: (dejar vacío, usará Dockerfile)
    - **Start command**: (dejar vacío, usará Dockerfile)

### Variables de Entorno (en Railway)

En el servicio, ve a **"Variables"** y pega:

```
MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@tu-cluster.mongodb.net/tienda_suplementos
MONGODB_DB_NAME=tienda_suplementos
JWT_SECRET=TU_JWT_SECRET_SEGURO_AQUI
JWT_EXPIRE=7d
NODE_ENV=production
SERVE_FRONTEND=true
ALLOWED_ORIGINS=http://localhost:3000
PORT=5000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_aqui
EMAIL_FROM=tu_email@gmail.com
WOMPI_PUBLIC_KEY=pub_prod_TU_CLAVE_PUBLICA_AQUI
WOMPI_PRIVATE_KEY=prv_prod_TU_CLAVE_PRIVADA_AQUI
WOMPI_INTEGRITY_SECRET=prod_integrity_TU_SECRET_INTEGRIDAD_AQUI
WOMPI_EVENTS_SECRET=prod_events_TU_SECRET_EVENTOS_AQUI
WOMPI_BASE_URL=https://production.wompi.co/v1
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## 4️⃣ VERIFICAR MONGODB ATLAS

**MUY IMPORTANTE**: Tu MongoDB debe permitir conexiones desde cualquier IP

1. **Ir a**: https://cloud.mongodb.com
2. **Login** con tu cuenta
3. **Ir a**: Cluster0 → Network Access
4. **Verificar que existe**: `0.0.0.0/0`
   - Si no existe: Click en "Add IP Address" → "Allow Access from Anywhere"
5. **Guardar cambios**

---

## 5️⃣ DEPLOY EN RAILWAY

En Railway:
1. Ve a tu proyecto y selecciona el servicio **backend**
2. Click en **"Deploy"** (si no se inicia automáticamente)
3. Ve a la pestaña **"Logs"** y espera
4. Deberías ver:
   ```
   ✅ Conectado a MongoDB
   ✅ Servidor corriendo en puerto 5000
   ```

---

## 6️⃣ OBTENER TU URL DE PRODUCCIÓN

1. En Railway, en la pestaña **"Settings"**
2. Busca **"URL"** o ve a **"Environment"**
3. Encontrarás algo como:
   ```
   https://tienda-backend-prod.railway.app
   ```

4. **GUARDA ESTA URL**, la necesitarás para el frontend

---

## 7️⃣ PROBAR TU API

```bash
# Abre tu navegador y ve a:
https://tu-url-railway.app/api/health

# O usa PowerShell:
$response = Invoke-WebRequest -Uri "https://tu-url-railway.app/api/health"
$response.StatusCode  # Deberías ver: 200
```

---

## ⚡ SI ALGO FALLA

### Error: Deploy fallido
- **Revisa los Logs** en Railway (pestaña Logs)
- **Busca el error específico**
- **Revisa que MongoDB_URI es correcto**

### Error: Cannot find module
- Verifica que `npm ci` se ejecutó correctamente
- Revisa que `package.json` está en `tienda-suplementos/backend/`

### Error: MongoDB connection failed
- Verifica MONGODB_URI en variables de entorno
- Verifica que MongoDB Atlas permite `0.0.0.0/0`

---

## 📌 PRÓXIMO PASO

Una vez que tu backend funcione, deplega el **FRONTEND** en Railway siguiendo pasos similares, pero usa:
- **Root Directory**: `tienda-suplementos/frontend`
- **Build Command**: `npm run build`
- **Start Command**: (Railway autodetecta Nginx)

¡Y listo! Tu tienda de suplementos estará en producción 🎉
