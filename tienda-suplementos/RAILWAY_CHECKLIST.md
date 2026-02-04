# ✅ CHECKLIST COMPLETO - DESPLIEGUE EN RAILWAY

## 📋 PRE-REQUISITOS

### Cuentas y Acceso
- [ ] Tengo cuenta en Railway (https://railway.app)
- [ ] Tengo acceso a mi repositorio GitHub (InternationalNutrition)
- [ ] Tengo acceso a MongoDB Atlas (https://cloud.mongodb.com)
- [ ] Tengo Git instalado en mi PC

### Proyecto Local
- [ ] Mi proyecto está en: `c:\Users\juanp\InternationalNutrition`
- [ ] Backend está en: `tienda-suplementos/backend`
- [ ] Archivo `package.json` existe en backend
- [ ] Archivo `server.js` existe en backend
- [ ] Archivo `Dockerfile` existe en backend
- [ ] Archivo `.env.production` existe con configuración

---

## 🔍 PASO 1: VERIFICAR ARCHIVOS LOCALES

```powershell
# Ejecuta en PowerShell para verificar archivos críticos

# Navega al proyecto
cd c:\Users\juanp\InternationalNutrition\tienda-suplementos\backend

# Verifica que los archivos existen
Test-Path package.json          # Debe devolver True
Test-Path server.js             # Debe devolver True
Test-Path Dockerfile            # Debe devolver True
Test-Path .env.production       # Debe devolver True
Test-Path app.js                # Debe devolver True
```

**✅ Checklist**:
- [ ] Todos los archivos existen
- [ ] `package.json` tiene script `"start": "node server.js"`
- [ ] `Dockerfile` tiene `CMD ["node", "server.js"]`

---

## 🔄 PASO 2: GITHUB - HACER GIT PUSH

```powershell
# Desde c:\Users\juanp\InternationalNutrition

# 1. Ver estado del repo
git status

# 2. Hacer commit de cambios (si hay)
git add .
git commit -m "Preparando backend para despliegue en Railway"

# 3. Push a GitHub
git push origin main

# 4. Verificar en GitHub que los cambios están
# Abre: https://github.com/cipagautaaa/InternationalNutrition
```

**✅ Checklist**:
- [ ] `git push` se ejecutó sin errores
- [ ] Los cambios aparecen en GitHub
- [ ] Estoy en la rama `main`

---

## 🌐 PASO 3: MONGODB ATLAS - PERMITIR CONEXIONES

Este es **MUY IMPORTANTE**. Sin esto, Railway no puede conectar a tu base de datos.

```
1. Ir a: https://cloud.mongodb.com
2. Login con tu cuenta
3. Selecciona tu proyecto
4. Selecciona "Cluster0"
5. Click en "Network Access"
6. Busca "0.0.0.0/0"
```

**Si NO existe "0.0.0.0/0"**:
```
1. Click en "Add IP Address"
2. Click en "Allow Access from Anywhere"
3. Confirmar cambios
```

**✅ Checklist**:
- [ ] Entré a MongoDB Atlas
- [ ] Fui a Network Access
- [ ] Verifiqué que "0.0.0.0/0" existe
- [ ] El cluster está activo (círculo verde)

---

## 🚀 PASO 4: RAILWAY - CREAR PROYECTO

```
1. Ir a: https://railway.app
2. Login con tu cuenta (o crear si es necesario)
3. Click en "New Project"
4. Click en "Deploy from GitHub repo"
5. Autorizar Railway a acceder a GitHub (si pide)
6. Seleccionar repositorio: "InternationalNutrition"
7. Seleccionar rama: "main"
8. Click en "Deploy Now"
```

**Espera a que Railway procese el repositorio**

**✅ Checklist**:
- [ ] Proyecto creado en Railway
- [ ] Repositorio conectado
- [ ] Rama seleccionada es "main"

---

## 🛠️ PASO 5: RAILWAY - CREAR SERVICIO BACKEND

```
1. En tu proyecto Railway
2. Click en "New Service"
3. Selecciona "GitHub Repo"
4. Selecciona "InternationalNutrition"
5. ESPERA a que Railway cargue el repo
6. Verás opciones de configuración:
   - Root Directory: tienda-suplementos/backend
   - Builder: Dockerfile (selecciona esto)
7. Click en "Deploy"
```

**✅ Checklist**:
- [ ] Servicio backend creado
- [ ] Root Directory es: `tienda-suplementos/backend`
- [ ] Builder es: `Dockerfile`

---

## 🔐 PASO 6: RAILWAY - CONFIGURAR VARIABLES DE ENTORNO

En Railway, en tu servicio backend:

```
1. Click en el servicio "backend"
2. Ve a pestaña "Variables"
3. Click en "RAW Editor" (o "Add Variable")
4. Copia y pega TODA esta configuración:
```

```
MONGODB_URI=mongodb+srv://tienda_user:1234567890@cluster0.nspy8m9.mongodb.net/tienda_suplementos?appName=Cluster0
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

5. Click en "Save"

**⚠️ IMPORTANTE**: No compartas estas variables públicamente en GitHub

**✅ Checklist**:
- [ ] Todas las variables están añadidas
- [ ] No hay errores de validación
- [ ] Variables están guardadas

---

## 📦 PASO 7: RAILWAY - CONFIGURAR BUILD (OPCIONAL PERO RECOMENDADO)

```
1. En tu servicio backend
2. Ve a "Settings"
3. Ve a "Build"
4. Verifica:
   - Builder: Dockerfile
   - Root Directory: tienda-suplementos/backend
   - Dockerfile Path: Dockerfile
5. Salva cambios
```

**✅ Checklist**:
- [ ] Builder está en Dockerfile
- [ ] Rutas están correctas

---

## 🚀 PASO 8: RAILWAY - INICIAR DEPLOY

```
1. En tu servicio backend
2. Click en "Deploy" (si no se inició automáticamente)
3. Espera a que termine el build
   - Verás mensajes como: "Building...", "Building complete"
```

**Esto toma 3-5 minutos normalmente**

**✅ Checklist**:
- [ ] Deploy iniciado
- [ ] Build en progreso

---

## 📊 PASO 9: VERIFICAR DEPLOY EN LOGS

```
1. En tu servicio backend en Railway
2. Ve a pestaña "Logs"
3. Busca estos mensajes (indica éxito):
   ✅ "npm notice created a lockfile as package-lock.json"
   ✅ "added XX packages"
   ✅ "Conectado a MongoDB"
   ✅ "Servidor corriendo en puerto 5000"
```

**Si ves errores**:
- [ ] Revisa RAILWAY_TROUBLESHOOTING.md
- [ ] Común: `MONGODB_URI is not set` → añade variables
- [ ] Común: `Cannot find module` → verifica package.json

**✅ Checklist**:
- [ ] Deploy completado sin errores (status verde)
- [ ] Logs muestran "Conectado a MongoDB"
- [ ] Logs muestran "Servidor corriendo en puerto 5000"

---

## 🌐 PASO 10: OBTENER URL DE PRODUCCIÓN

```
1. En tu servicio backend
2. Ve a "Settings" o "Environment"
3. Busca la sección "URL" o "Domains"
4. Copia la URL que se ve:
   https://tienda-suplementos-backend-prod.railway.app
   (tu URL será diferente)
```

**Guarda esta URL**, la necesitarás para el frontend.

**✅ Checklist**:
- [ ] Obtuve la URL de mi backend
- [ ] La URL está accesible (verde en Railway)

---

## ✔️ PASO 11: PROBAR LA API

### En el navegador
```
1. Abre: https://tu-url-railway.app/api/health
2. Deberías ver: {"status":"ok"} o similar
3. Código de estado: 200
```

### En PowerShell
```powershell
# Reemplaza la URL con la tuya
$url = "https://tu-url-railway.app/api/health"
$response = Invoke-WebRequest -Uri $url
Write-Host "Status Code: " $response.StatusCode
Write-Host "Body: " $response.Content
```

**✅ Checklist**:
- [ ] Accedí a `/api/health`
- [ ] Recibí respuesta 200
- [ ] API responde correctamente

---

## 🎉 PASO 12: CONFIGURACIÓN FINAL

```
1. Guarda la URL de tu backend:
   https://tu-url-railway.app

2. Para el frontend, actualiza:
   VITE_API_BASE_URL=https://tu-url-railway.app

3. Despliega el frontend siguiendo pasos similares
```

**✅ Checklist**:
- [ ] Backend funcionando en producción
- [ ] URL guardada para usar en frontend
- [ ] Listo para desplegar frontend

---

## 🆘 SI ALGO FALLA

1. **Revisa RAILWAY_TROUBLESHOOTING.md**
2. **Mira los logs en Railway** (pestaña "Logs")
3. **Verifica MongoDB Atlas** (Network Access)
4. **Verifica Variables de Entorno** (todas añadidas)
5. **Verifica Dockerfile** (existe y es correcto)

---

## 📌 RESUMEN RÁPIDO

```
✅ Git push → GitHub
✅ MongoDB Atlas → Network Access (0.0.0.0/0)
✅ Railway → New Project → GitHub
✅ Railway → New Service → Backend
✅ Railway → Variables → Copiar todas
✅ Railway → Deploy
✅ Ver Logs → Buscar "Conectado a MongoDB"
✅ Obtener URL
✅ Probar /api/health
✅ ¡LISTO! 🎉
```

---

**¿En qué paso estás? Cuéntame si necesitas ayuda con alguno específico.**
