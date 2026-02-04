# 🚀 GUÍA COMPLETA: Desplegar Backend en Railway

Este tutorial te guiará paso a paso para desplegar tu backend Node.js + Express + MongoDB en Railway.

---

## 📋 REQUISITOS PREVIOS

1. **Cuenta en Railway** - Crea una en https://railway.app
2. **GitHub** - Tu proyecto debe estar en un repositorio de GitHub (público o privado)
3. **Git instalado** - Para hacer push de cambios
4. **Variables de entorno configuradas** - Las tenemos en tu `.env.production`

---

## PASO 1: Preparar tu Repositorio en GitHub

### 1.1 Verificar que el repo existe
```bash
# Verifica que tu proyecto está en GitHub
# Ve a: https://github.com/cipagautaaa/InternationalNutrition
```

### 1.2 Asegúrate de tener un archivo `.gitignore` en el backend
Tu backend debe tener un `.gitignore` que excluya:
```
node_modules/
.env
.env.production
.env.local
.DS_Store
dist/
```

### 1.3 Hacer push de cambios (si hay)
```bash
# Desde c:\Users\juanp\InternationalNutrition
git add .
git commit -m "Preparando para despliegue en Railway"
git push origin main
```

---

## PASO 2: Crear Proyecto en Railway

### 2.1 Ir a Railway.app
1. Abre https://railway.app
2. Inicia sesión con tu cuenta (o crea una si es necesario)

### 2.2 Crear nuevo proyecto
1. Haz clic en **"New Project"** o **"Create Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Conecta tu cuenta de GitHub (si no está conectada)
4. Selecciona el repositorio **`InternationalNutrition`**
5. Selecciona la rama **`main`**
6. Elige **Deploy from Dockerfile** (opcional pero recomendado)

---

## PASO 3: Configurar el Servicio Backend

### 3.1 Crear servicio de Backend
1. Una vez creado el proyecto en Railway, haz clic en **"New Service"**
2. Selecciona **"GitHub Repo"**
3. Conecta el repo `InternationalNutrition`
4. En la configuración, especifica el directorio raíz: `tienda-suplementos/backend`

### 3.2 Configurar variables de entorno
En el panel de Railway, ve a la pestaña **"Variables"** y añade:

```
MONGODB_URI=mongodb+srv://tienda_user:1234567890@cluster0.nspy8m9.mongodb.net/tienda_suplementos?appName=Cluster0
MONGODB_DB_NAME=tienda_suplementos
JWT_SECRET=TU_JWT_SECRET_SEGURO_AQUI
JWT_EXPIRE=7d
NODE_ENV=production
SERVE_FRONTEND=true
ALLOWED_ORIGINS=https://tu-frontend.railway.app,http://localhost:3000
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

## PASO 4: Configurar MongoDB Atlas

### 4.1 Verificar conexión a MongoDB
Tu `MONGODB_URI` ya está configurado. Verifica en MongoDB Atlas que:

1. Ve a https://cloud.mongodb.com
2. Inicia sesión con tu cuenta
3. Ve a **Cluster0** → **Network Access**
4. Asegúrate de que **`0.0.0.0/0`** (permitir todas las IPs) está añadido
   - Si no está, haz clic en **"Add IP Address"** → **"Allow Access from Anywhere"**

### 4.2 Crear base de datos si no existe
1. En MongoDB Atlas, ve a **Databases**
2. Verifica que existe la base de datos `tienda_suplementos`
3. Si no existe, crea una colección vacía o railway la creará automáticamente

---

## PASO 5: Configurar el Dockerfile (IMPORTANTE)

Tu backend tiene un `Dockerfile`. Verifica que exista en `tienda-suplementos/backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

Si el archivo NO existe, cópialo desde la raíz donde está en tu docker-compose.yml.

---

## PASO 6: Configurar el Contexto de Build en Railway

### 6.1 Ir a Settings del servicio
1. En Railway, abre tu proyecto
2. Selecciona el servicio **backend**
3. Ve a **Settings** → **Build**

### 6.2 Configurar Build
- **Builder**: Selecciona **"Dockerfile"**
- **Root Directory**: `tienda-suplementos/backend`
- **Dockerfile Path**: `Dockerfile` (relativo al Root Directory)

### 6.3 Configurar Deploy
- **Start Command**: Deja vacío (usará el CMD del Dockerfile)
- **Restart Policy**: `unless-stopped`

---

## PASO 7: Conectar MongoDB a Railway (Alternativa)

### Opción A: Usar tu MongoDB Atlas actual (RECOMENDADO)
- Ya está configurado con `MONGODB_URI`
- No necesitas hacer nada más

### Opción B: Crear MongoDB en Railway
1. En Railway, haz clic en **"New Service"**
2. Busca **"MongoDB"** en Marketplace
3. Añádelo al proyecto
4. Railway te dará una `DATABASE_URL` automáticamente
5. Copia esa URL a la variable `MONGODB_URI` en tu backend

---

## PASO 8: Desplegar

### 8.1 Trigger el Deploy
1. En Railway, el deploy debería iniciarse automáticamente cuando conectes el repo
2. Si no, ve a **Deploy** y haz clic en **"Deploy"**

### 8.2 Monitorear el Deploy
1. Ve a la pestaña **"Logs"**
2. Verás los logs en tiempo real
3. Busca mensajes como:
   - ✅ `Conectado a MongoDB`
   - ✅ `Servidor corriendo en puerto 5000`

### 8.3 Obtener la URL de tu backend
1. Ve a **Settings** → **Environment**
2. Encontrarás una URL como: `https://tu-backend-railway.railway.app`
3. Esta es la URL de tu API en producción

---

## PASO 9: Verificar que funciona

### 9.1 Probar la API
```bash
# Abre tu navegador o usa curl
curl https://tu-backend-railway.railway.app/api/health

# Deberías obtener un 200 OK
```

### 9.2 Ver logs en tiempo real
```bash
# En Railway, pestaña "Logs" - verás:
# Conectado a MongoDB
# Servidor corriendo en puerto 5000
```

---

## PASO 10: Configurar el Frontend (si lo despliegas también)

Una vez que tu backend esté en Railway:

1. Obtén la URL de tu backend: `https://tu-backend-railway.railway.app`
2. En tu frontend (React/Vite), actualiza la variable de entorno:
   ```
   VITE_API_BASE_URL=https://tu-backend-railway.railway.app
   ```
3. Despliega el frontend en Railway siguiendo pasos similares

---

## ⚠️ TROUBLESHOOTING

### Error: "Conectando a MongoDB: ECONNREFUSED"
- Verifica que `MONGODB_URI` es correcto
- Verifica que MongoDB Atlas permite conexiones desde cualquier IP (0.0.0.0/0)

### Error: "Cannot find module"
- Verifica que `package.json` está en `tienda-suplementos/backend/`
- Verifica que el `npm install` se ejecutó correctamente

### Error: "Port already in use"
- Railway asigna un puerto automáticamente, no uses puertos fijos

### Build falla
- Verifica que el `Dockerfile` existe en `tienda-suplementos/backend/`
- Verifica que `server.js` existe
- Revisa los logs para más detalles

---

## 📝 CHECKLIST FINAL

- [ ] Repositorio en GitHub actualizado (`git push`)
- [ ] Cuenta en Railway creada
- [ ] Proyecto creado en Railway
- [ ] Servicio backend añadido
- [ ] Todas las variables de entorno configuradas
- [ ] MongoDB Atlas permite conexiones desde cualquier IP
- [ ] Dockerfile existe en `tienda-suplementos/backend/`
- [ ] Deploy completado sin errores
- [ ] Logs muestran "Conectado a MongoDB" y "Servidor corriendo"
- [ ] API responde en `https://tu-backend-railway.railway.app`

---

## 🎯 RESUMEN RÁPIDO

```
1. Git push → GitHub
2. Railway.app → New Project → GitHub
3. Añadir servicio Backend
4. Configurar variables de entorno
5. Deploy
6. Verificar en Logs
7. Obtener URL: https://tu-backend-railway.railway.app
```

---

¿Necesitas ayuda con algún paso específico?
