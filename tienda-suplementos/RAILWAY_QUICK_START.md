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
MONGODB_URI=mongodb+srv://tienda_user:1234567890@cluster0.nspy8m9.mongodb.net/tienda_suplementos?appName=Cluster0
MONGODB_DB_NAME=tienda_suplementos
JWT_SECRET=jaFahl72ZDkw7VFRM1MI8rD7sJLXRyybc4ZMy/0H2fZ/gw7c6H4mQUgo6QIjSCp3pYA+7BvnCjpjdOKTkxKAUg==
JWT_EXPIRE=7d
NODE_ENV=production
SERVE_FRONTEND=true
ALLOWED_ORIGINS=http://localhost:3000
PORT=5000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_PROVIDER=gmail
EMAIL_USER=Juanpaba14@gmail.com
EMAIL_PASS=bzon xlik zznq kqox
EMAIL_FROM=Juanpaba14@gmail.com
WOMPI_PUBLIC_KEY=pub_prod_QRg3RwTyJzwyfvZo1WnbEc4WxjZaay4g
WOMPI_PRIVATE_KEY=prv_prod_Ncxd77mreD8o7VH0SfwqcEOFEHVChPwK
WOMPI_INTEGRITY_SECRET=prod_events_5TQxSQGBLCWccC5BLwCmHy1v1tiqh9b1
WOMPI_EVENTS_SECRET=prod_integrity_lkCECjt7kLJvfbtIYuOtxy8WKvgjHQi0
WOMPI_BASE_URL=https://production.wompi.co/v1
CLOUDINARY_CLOUD_NAME=dlopfk5uj
CLOUDINARY_API_KEY=196442331228644
CLOUDINARY_API_SECRET=YLyxD2W52SfsNlv-hXm74Sm9MsM
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
