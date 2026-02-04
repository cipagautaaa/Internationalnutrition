# 🎯 RESUMEN VISUAL - DESPLIEGUE RAILWAY EN 10 MINUTOS

## 📊 Diagrama del proceso

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  TU COMPUTADORA (Windows)                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ c:\Users\juanp\InternationalNutrition               │   │
│  │   ├── tienda-suplementos/                           │   │
│  │   │   ├── backend/ (Express + Node.js)              │   │
│  │   │   │   ├── package.json ✅                       │   │
│  │   │   │   ├── server.js ✅                          │   │
│  │   │   │   ├── Dockerfile ✅                         │   │
│  │   │   │   └── .env.production ✅                    │   │
│  │   │   └── frontend/ (React/Vite)                    │   │
│  │   └── docker-compose.yml                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│           ⬇️  GIT PUSH                                       │
│                                                               │
│  GitHub                                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ https://github.com/cipagautaaa/                     │   │
│  │ InternationalNutrition                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  INTERNET (Railway.app)                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Railway Project: International Nutrition            │   │
│  │                                                      │   │
│  │ Service 1: Backend (Node.js)                        │   │
│  │ ├── Build: Dockerfile                              │   │
│  │ ├── Root: tienda-suplementos/backend                │   │
│  │ ├── URL: https://backend.railway.app ✅            │   │
│  │ └── Logs: "Conectado a MongoDB" ✅                 │   │
│  │                                                      │   │
│  │ Service 2: Frontend (React - opcional)              │   │
│  │ ├── Build: npm run build                           │   │
│  │ ├── Root: tienda-suplementos/frontend               │   │
│  │ └── URL: https://app.railway.app                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│           ⬇️  CONECTA CON                                    │
│                                                               │
│  MongoDB Atlas (Nube)                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Cluster0 (tienda_suplementos)                        │   │
│  │ ├── Network Access: 0.0.0.0/0 ✅                   │   │
│  │ ├── Collections: productos, usuarios, etc           │   │
│  │ └── Connection: MONGODB_URI ✅                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ⏱️ PASOS EN ORDEN (10 MINUTOS)

### 📋 Paso 1: Verificar archivos (1 minuto)

```powershell
# Abre PowerShell y ejecuta:
cd c:\Users\juanp\InternationalNutrition\tienda-suplementos\backend

# Verifica que existen:
Test-Path package.json      # ✅ Debe ser True
Test-Path server.js         # ✅ Debe ser True
Test-Path Dockerfile        # ✅ Debe ser True
Test-Path .env.production   # ✅ Debe ser True
```

**Resultado esperado**: ✅ Todos True

---

### 🔄 Paso 2: Git Push (2 minutos)

```powershell
# Desde c:\Users\juanp\InternationalNutrition
cd c:\Users\juanp\InternationalNutrition

# 1. Ver cambios
git status

# 2. Hacer commit
git add .
git commit -m "Deploy: preparar backend para Railway"

# 3. Push a GitHub
git push origin main
```

**Resultado esperado**: 
```
✅ main -> main [new branch]
```

---

### 🌐 Paso 3: Railway - Crear Proyecto (3 minutos)

1. Abre https://railway.app
2. Click **"New Project"**
3. Click **"Deploy from GitHub repo"**
4. Selecciona: **InternationalNutrition**
5. Selecciona rama: **main**
6. Espera a que cargue...

**Resultado esperado**: Proyecto creado en Railway

---

### 🛠️ Paso 4: Railway - Crear Servicio Backend (2 minutos)

1. En tu proyecto Railway
2. Click **"New Service"**
3. Selecciona **"GitHub Repo"**
4. Selecciona **"InternationalNutrition"**
5. Configura:
   - **Root Directory**: `tienda-suplementos/backend`
   - **Builder**: `Dockerfile`
6. Click **"Deploy"**

**Resultado esperado**: Servicio creado y deploy iniciado

---

### 🔐 Paso 5: Añadir Variables de Entorno (1 minuto)

En Railway, en tu servicio backend:

1. Click en **"Variables"**
2. Copia y pega esto:

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

3. Click **"Save"**

**Resultado esperado**: Variables guardadas sin errores

---

### ✅ Paso 6: Verificar Deploy (1 minuto)

En Railway:

1. Selecciona tu servicio backend
2. Ve a **"Logs"**
3. Busca estos mensajes:
   ```
   ✅ Conectado a MongoDB
   ✅ Servidor corriendo en puerto 5000
   ```

4. Verifica que el status es **verde** (Running)

**Resultado esperado**: Backend corriendo sin errores

---

## 🎉 LISTO EN 10 MINUTOS

Tu backend está deployado en: https://tu-url-railway.app

### Para probar

1. **En el navegador**, ve a:
   ```
   https://tu-url-railway.app/api/health
   ```

2. **En PowerShell**, ejecuta:
   ```powershell
   Invoke-WebRequest https://tu-url-railway.app/api/health
   ```

3. **Deberías ver**:
   ```
   Status Code: 200
   ```

---

## 📌 SI NECESITAS AYUDA

Revisa estos archivos en orden:

1. **RAILWAY_QUICK_START.md** ← Problemas comunes
2. **RAILWAY_CHECKLIST.md** ← Verificar cada paso
3. **RAILWAY_TROUBLESHOOTING.md** ← Solucionar errores
4. **RAILWAY_DEPLOYMENT_GUIDE.md** ← Guía completa detallada

---

## 🚀 PRÓXIMO PASO: FRONTEND

Una vez que el backend funcione:

1. Copia la URL de tu backend: `https://tu-url-railway.app`
2. En `tienda-suplementos/frontend/.env.production`, añade:
   ```
   VITE_API_BASE_URL=https://tu-url-railway.app
   ```
3. Despliega el frontend siguiendo pasos similares

---

## 📊 VARIABLES DE ENTORNO EXPLICADAS

| Variable | Qué es | Dónde obtenerla |
|----------|--------|-----------------|
| `MONGODB_URI` | Conexión a BD | MongoDB Atlas |
| `JWT_SECRET` | Seguridad de login | `.env.production` |
| `WOMPI_*` | Pagos (Wompi) | Tu cuenta Wompi |
| `CLOUDINARY_*` | Imágenes (CDN) | Tu cuenta Cloudinary |
| `EMAIL_*` | Correos | Tu Gmail |

---

## ✨ COMANDOS ÚTILES

```powershell
# En local - Levantar todo
cd c:\Users\juanp\InternationalNutrition\tienda-suplementos
docker-compose up --build -d

# Ver logs del backend
docker logs tienda-suplementos-backend-1 -f

# Detener todo
docker-compose down

# Probar API
Invoke-WebRequest http://localhost:5000/api/health
```

---

**¡A desplegar! 🚀**
