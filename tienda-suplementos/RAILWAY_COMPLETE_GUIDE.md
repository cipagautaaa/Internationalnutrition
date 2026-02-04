# 🎯 GUÍA COMPLETA Y EJEMPLOS - RAILWAY DEPLOYMENT

## 📚 TABLA DE CONTENIDOS

1. [Resumen de la arquitectura](#resumen-de-la-arquitectura)
2. [Comandos útiles](#comandos-útiles)
3. [Ejemplos de configuración](#ejemplos-de-configuración)
4. [Conexión a bases de datos](#conexión-a-bases-de-datos)
5. [Despliegue del frontend](#despliegue-del-frontend)
6. [Monitoreo y logs](#monitoreo-y-logs)

---

## 🏗️ Resumen de la arquitectura

```
┌─────────────────────────────────────────────┐
│          Internet / Usuarios                │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  Railway (Frontend)     │
        │  https://app.railway... │
        │  (Nginx)                │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Railway (Backend API)  │
        │  https://api.railway... │
        │  (Node.js/Express)      │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   MongoDB Atlas         │
        │   (Base de datos)       │
        └─────────────────────────┘
```

---

## ⚡ Comandos útiles

### Verificar estado local

```powershell
# En c:\Users\juanp\InternationalNutrition\tienda-suplementos

# Ver containers en ejecución
docker ps

# Ver logs del backend
docker logs tienda-suplementos-backend-1 -f

# Detener containers
docker-compose down

# Limpiar todo
docker-compose down -v

# Reiniciar
docker-compose up --build -d
```

### Git útil

```bash
# Ver cambios pendientes
git status

# Ver último commit
git log --oneline -5

# Revertir cambios locales
git restore .

# Ver diferencias
git diff

# Hacer commit con mensaje descriptivo
git commit -m "fix: corregir conexión a MongoDB"
```

---

## 💾 Ejemplos de configuración

### Ejemplo 1: Dockerfile optimizado

```dockerfile
# Multi-stage build para reducir tamaño
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Etapa final
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
```

### Ejemplo 2: .dockerignore completo

```
node_modules
npm-debug.log
.git
.gitignore
README.md
README.txt
.env
.env.local
.env.production
.DS_Store
.vscode
.idea
dist
build
coverage
test
tests
.test
__tests__
logs
*.log
.npm
.yarn
.cache
.next
out
.turbo
.eslintcache
```

### Ejemplo 3: .env.production optimizado

```env
# Base de datos
MONGODB_URI=mongodb+srv://tienda_user:1234567890@cluster0.nspy8m9.mongodb.net/tienda_suplementos?appName=Cluster0
MONGODB_DB_NAME=tienda_suplementos

# Servidor
PORT=5000
NODE_ENV=production
SERVE_FRONTEND=true

# Seguridad
JWT_SECRET=jaFahl72ZDkw7VFRM1MI8rD7sJLXRyybc4ZMy/0H2fZ/gw7c6H4mQUgo6QIjSCp3pYA+7BvnCjpjdOKTkxKAUg==
JWT_EXPIRE=7d
ALLOWED_ORIGINS=https://app.railway.app,https://tudominio.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_aqui
EMAIL_FROM=tu_email@gmail.com

# Wompi (Pagos)
WOMPI_PUBLIC_KEY=pub_prod_TU_CLAVE_PUBLICA_AQUI
WOMPI_PRIVATE_KEY=prv_prod_TU_CLAVE_PRIVADA_AQUI
WOMPI_INTEGRITY_SECRET=prod_integrity_TU_SECRET_INTEGRIDAD_AQUI
WOMPI_EVENTS_SECRET=prod_events_TU_SECRET_EVENTOS_AQUI
WOMPI_BASE_URL=https://production.wompi.co/v1

# Cloudinary (Imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## 🔌 Conexión a bases de datos

### Opción A: MongoDB Atlas (actual)

**MONGODB_URI**:
```
mongodb+srv://tienda_user:1234567890@cluster0.nspy8m9.mongodb.net/tienda_suplementos?appName=Cluster0
```

**Ventajas**:
- ✅ Ya tienes configurada
- ✅ Fácil de escalar
- ✅ Backups automáticos

### Opción B: MongoDB en Railway

**Crear en Railway**:
1. New Service → Marketplace
2. Buscar "MongoDB"
3. Añadir al proyecto
4. Railway te dará una URL automáticamente

**Ventajas**:
- ✅ Menos configuración
- ✅ Todo en un lugar
- ✅ Mejor para proyectos pequeños

### Opción C: PostgreSQL en Railway (alternativa)

**Si quieres cambiar a PostgreSQL**:
1. New Service → Marketplace
2. Buscar "PostgreSQL"
3. Configurar

---

## 🎨 Despliegue del frontend

Una vez que tu backend esté en Railway, puedes desplegar el frontend:

### Paso 1: Preparar frontend

```powershell
# En c:\Users\juanp\InternationalNutrition\tienda-suplementos\frontend

# Crear archivo .env.production
# Añadir:
VITE_API_BASE_URL=https://tu-url-backend.railway.app
```

### Paso 2: Crear servicio en Railway

```
1. En tu proyecto Railway
2. New Service → GitHub Repo
3. Selecciona InternationalNutrition
4. Root Directory: tienda-suplementos/frontend
5. Builder: Node.js o Dockerfile
```

### Paso 3: Configurar build y deploy

```
Build Command: npm run build
Start Command: (dejar vacío si usas Nginx)
```

### Paso 4: Variables de entorno

```
VITE_API_BASE_URL=https://tu-url-backend.railway.app
NODE_ENV=production
```

---

## 📊 Monitoreo y logs

### En Railway Dashboard

**Pestaña "Logs"**:
```
2024-11-26 10:15:23 - npm notice created a lockfile as package-lock.json
2024-11-26 10:15:25 - > npm ci --only=production
2024-11-26 10:15:50 - added 45 packages
2024-11-26 10:15:52 - Conectado a MongoDB
2024-11-26 10:15:53 - Servidor corriendo en puerto 5000
```

**Pestaña "Metrics"** (en planes pagos):
- CPU usage
- Memory usage
- Network I/O
- Response times

**Pestaña "Deployments"**:
- Ver historial de deployments
- Rollback a versiones anteriores
- Ver qué cambios se desplegaron

### Comandos para debugging

```bash
# Ver todos los servicios
curl https://tu-url-railway.app/api/health

# Ver logs en tiempo real (si tienes acceso SSH)
# Railway → Settings → CLI
railway logs -f

# Reconectar
railway connect

# Ver variables
railway variable list
```

---

## 🔒 Seguridad en producción

### 1. Variables sensibles

```powershell
# ❌ MAL - NO hacer esto
# Guardar en .env en GitHub
MONGODB_URI=mongodb+srv://user:pass@...
JWT_SECRET=mi-secreto

# ✅ BIEN - Usar Railway Variables
# Railway cifra las variables automáticamente
```

### 2. HTTPS/SSL

Railway proporciona HTTPS automáticamente:
```
✅ https://tu-backend.railway.app
```

### 3. Rate limiting

Tu backend ya tiene rate limiting configurado:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 1000,                  // 1000 solicitudes
  message: 'Demasiadas solicitudes...'
});
app.use('/api/', limiter);
```

### 4. CORS configurado

```javascript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));
```

**Para producción, ajustar**:
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

---

## 🚨 Problemas comunes y soluciones rápidas

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED` | Network Access en MongoDB Atlas → 0.0.0.0/0 |
| `Cannot find module` | Verifica `package.json` en backend |
| `Port already in use` | Railway asigna puerto automáticamente |
| `Build fails` | Revisa Logs, verifica Dockerfile |
| `Timeout` | Verifica conexión a MongoDB |
| `Module not found` | `npm ci` no se ejecutó |

---

## 📞 Recursos útiles

- **Railway Docs**: https://docs.railway.app
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Express.js**: https://expressjs.com
- **Node.js**: https://nodejs.org

---

## 🎯 Próximos pasos

1. ✅ Backend en Railway
2. [ ] Frontend en Railway
3. [ ] Dominio personalizado
4. [ ] SSL/HTTPS (automático)
5. [ ] Monitoreo y alertas
6. [ ] Backups automáticos

---

**¿Necesitas ayuda con algún paso específico? Estoy aquí para ayudarte.**
