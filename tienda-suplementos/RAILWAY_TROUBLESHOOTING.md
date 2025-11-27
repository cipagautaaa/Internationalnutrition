# 🔧 TROUBLESHOOTING Y CONFIGURACIÓN AVANZADA - RAILWAY

## 🆘 PROBLEMAS COMUNES Y SOLUCIONES

### ❌ Error: "no configuration file provided: not found"

**Causa**: Estás ejecutando `docker-compose` desde el directorio equivocado.

**Solución**:
```bash
# Primero, navega al directorio correcto
cd c:\Users\juanp\InternationalNutrition\tienda-suplementos

# Luego ejecuta docker-compose
docker-compose up --build -d
```

---

### ❌ Error: "Cannot find module 'express'"

**Causa**: Las dependencias no se instalaron.

**Solución en Railway**:
1. En tu proyecto Railway, selecciona el servicio **backend**
2. Ve a **Settings** → **Build**
3. Verifica que:
   - **Builder**: Dockerfile
   - **Root Directory**: `tienda-suplementos/backend`
4. El Dockerfile debe tener:
   ```dockerfile
   COPY package*.json ./
   RUN npm ci --only=production
   ```

---

### ❌ Error: "MONGODB_URI is not set"

**Causa**: No configuraste las variables de entorno en Railway.

**Solución**:
1. En Railway, selecciona tu servicio **backend**
2. Ve a **Variables**
3. Añade:
   ```
   MONGODB_URI=mongodb+srv://tienda_user:1234567890@cluster0.nspy8m9.mongodb.net/tienda_suplementos?appName=Cluster0
   NODE_ENV=production
   ```
4. Click en **Deploy** para reiniciar con las nuevas variables

---

### ❌ Error: "MongoError: connect ECONNREFUSED 127.0.0.1:27017"

**Causa**: El servidor no puede conectar a MongoDB Atlas.

**Soluciones**:

**A) Verificar MongoDB Atlas Network Access**
1. Ve a https://cloud.mongodb.com
2. Login
3. Cluster0 → **Network Access**
4. Click en **"Add IP Address"**
5. Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **"Confirm"**

**B) Verificar MONGODB_URI**
1. En MongoDB Atlas, ve a **Databases** → **Connect**
2. Copia el connection string
3. Reemplaza `<password>` con tu contraseña real
4. Verifica que sea: `mongodb+srv://tienda_user:1234567890@...`
5. Actualiza en Railway Variables

**C) Verificar que MongoDB está activo**
1. En MongoDB Atlas, ve a **Clusters**
2. Verifica que el cluster muestra un ícono verde (activo)
3. Si no, click en los tres puntos → **Resume**

---

### ❌ Error: "Port 5000 is already in use"

**Causa**: En local, el puerto 5000 ya está ocupado. En Railway, no es problema.

**Solución Local**:
```bash
# Buscar qué proceso usa el puerto 5000
netstat -ano | findstr :5000

# Matar el proceso (reemplaza PID con el número encontrado)
taskkill /PID <PID> /F
```

**En Railway**: Railway asigna un puerto automáticamente, no te preocupes.

---

### ❌ Error: "Dockerfile not found"

**Causa**: El archivo Dockerfile no existe en la ruta correcta.

**Solución**:
1. Verifica que existe: `tienda-suplementos/backend/Dockerfile`
2. Si no existe, créalo:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]
```

---

### ❌ Error: "Build context too large"

**Causa**: El directorio contiene demasiados archivos (node_modules, dist, etc).

**Solución**:
1. Verifica que tienes un `.gitignore` en `tienda-suplementos/backend/`:

```
node_modules/
.env
.env.production
.env.local
.DS_Store
dist/
coverage/
.git/
.vscode/
*.log
npm-debug.log*
```

2. Haz git pull después de actualizar .gitignore:
```bash
cd c:\Users\juanp\InternationalNutrition
git add .gitignore
git commit -m "Actualizar .gitignore"
git push origin main
```

---

### ❌ Error: "Buildpacks or Dockerfile is required"

**Causa**: Railway no detecta ni Dockerfile ni Buildpacks.

**Solución**:
1. En Railway, selecciona tu servicio
2. Ve a **Settings** → **Build**
3. En **Builder**, selecciona **"Dockerfile"**
4. Asegúrate de que existe `tienda-suplementos/backend/Dockerfile`
5. Click **Deploy**

---

## ✅ VERIFICAR QUE TODO FUNCIONA

### En Local

```bash
# 1. Ir al directorio correcto
cd c:\Users\juanp\InternationalNutrition\tienda-suplementos

# 2. Levantar los servicios
docker-compose up --build -d

# 3. Ver logs del backend
docker-compose logs backend

# 4. Probar la API
# Abre el navegador y ve a: http://localhost:5000/api/health
# O usa PowerShell:
Invoke-WebRequest http://localhost:5000/api/health
```

### En Railway

```bash
# 1. Ve a https://railway.app
# 2. Abre tu proyecto
# 3. Selecciona el servicio backend
# 4. Ve a la pestaña Logs
# 5. Busca:
#    ✅ "Conectado a MongoDB"
#    ✅ "Servidor corriendo en puerto 5000"

# 6. Prueba la API en la URL de tu servicio:
# https://tu-backend-railway.app/api/health
```

---

## 🔐 SEGURIDAD: VARIABLES SENSIBLES

**NUNCA** hagas commit de variables sensibles a GitHub:

```bash
# ❌ MAL: Variables en archivo .env
MONGODB_URI=mongodb+srv://user:password@...
JWT_SECRET=mi-secreto-super-importante

# ✅ BIEN: Variables en Railway UI o .env.local (gitignored)
```

**En Railway**, las variables están cifradas y seguras.

---

## 📊 MONITOREAR TU APLICACIÓN

### En Railway

1. **Logs**: Pestaña "Logs"
   - Ver errores en tiempo real
   - Ver solicitudes HTTP

2. **Metrics**: Pestaña "Metrics" (en algunos planes)
   - CPU usage
   - Memory usage
   - Network

3. **Deployments**: Historial de deployments
   - Ver qué cambios se desplegaron
   - Rollback a versiones anteriores

---

## 🔄 REDEPLOY AUTOMÁTICO

Railway redeploya automáticamente cuando:
- Haces `git push` a tu rama principal
- Cambias variables de entorno
- Actualizas Dockerfile

---

## 🛠️ DEBUGGING AVANZADO

### Ver logs completos en Railway

```bash
# En la terminal de Railway, puedes ver:
docker logs tienda-suplementos-backend-1

# O conectarte con SSH:
# (Railway proporciona instrucciones en Settings)
```

### Ver proceso en ejecución

```bash
# En Railway, dentro del contenedor:
ps aux

# Buscar node:
ps aux | grep node
```

---

## 🌍 CONFIGURAR DOMINIO PERSONALIZADO

### En Railway (para usar tu dominio)

1. Ve a **Settings** → **Environment**
2. Busca la sección **"Domains"**
3. Click en **"Add Custom Domain"**
4. Ingresa tu dominio: `api.tucomerciio.com`
5. Railway te dará registros DNS para configurar en tu proveedor

---

## 🚀 OPTIMIZACIONES

### Reducir tiempo de build

**En Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production  # Más rápido que npm install

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]
```

### Reducir tamaño de imagen

**En .dockerignore** (crear si no existe):
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.DS_Store
```

---

## 📞 SOPORTE RAILWAY

- **Documentación**: https://docs.railway.app
- **Dashboard**: https://railway.app/dashboard
- **Status**: https://status.railway.app

---

¿Necesitas ayuda con algo específico?
