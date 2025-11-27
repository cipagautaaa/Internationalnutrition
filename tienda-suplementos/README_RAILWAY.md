# 🚀 DESPLIEGUE EN RAILWAY - GUÍA COMPLETA

**Bienvenido al tutorial de despliegue de tu backend en Railway.**

Este proyecto contiene todo lo que necesitas para desplegar tu tienda de suplementos en producción.

---

## 📚 DOCUMENTACIÓN DISPONIBLE

### Para principiantes (Recomendado empezar aquí)

1. **[RAILWAY_VISUAL_GUIDE.md](./RAILWAY_VISUAL_GUIDE.md)** ⭐
   - Diagrama visual del proceso
   - Pasos en 10 minutos
   - Fácil de entender

2. **[RAILWAY_QUICK_START.md](./RAILWAY_QUICK_START.md)**
   - Inicio rápido
   - Pasos cortos y directos
   - Para usuarios con experiencia

### Para usuarios intermedios

3. **[RAILWAY_CHECKLIST.md](./RAILWAY_CHECKLIST.md)**
   - Checklist detallado paso a paso
   - Verificación de cada punto
   - Fácil de seguir

4. **[RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)**
   - Guía completa y detallada
   - Explicación de cada paso
   - Mejores prácticas

### Para advanced/troubleshooting

5. **[RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md)**
   - Problemas comunes y soluciones
   - Debugging avanzado
   - Configuración avanzada

6. **[RAILWAY_COMPLETE_GUIDE.md](./RAILWAY_COMPLETE_GUIDE.md)**
   - Guía técnica completa
   - Ejemplos de código
   - Arquitectura avanzada

---

## 🎯 ¿POR DÓNDE EMPIEZO?

### Si es tu primera vez:
```
1. Lee: RAILWAY_VISUAL_GUIDE.md (5 minutos)
2. Sigue: RAILWAY_CHECKLIST.md (paso a paso)
3. Si hay errores: RAILWAY_TROUBLESHOOTING.md
```

### Si ya has deployado antes:
```
1. Ve a: RAILWAY_QUICK_START.md
2. Ejecuta los pasos rápidamente
3. Referencia: RAILWAY_DEPLOYMENT_GUIDE.md si necesitas
```

### Si algo falla:
```
1. Consulta: RAILWAY_TROUBLESHOOTING.md
2. Busca tu error específico
3. Sigue las soluciones
```

---

## ⚡ RESUMEN RÁPIDO (10 MINUTOS)

### Lo que necesitas

```
✅ Cuenta en Railway (https://railway.app)
✅ GitHub (tu repo: InternationalNutrition)
✅ MongoDB Atlas (ya tienes configurado)
✅ Git instalado en Windows
```

### Proceso rápido

```bash
# 1. Git push
git push origin main

# 2. Railway.app → New Project → GitHub
# (Selecciona InternationalNutrition)

# 3. New Service → Backend
# (Root: tienda-suplementos/backend, Builder: Dockerfile)

# 4. Añadir Variables de Entorno
# (Copia todas las variables de .env.production)

# 5. Deploy
# (Railway inicia automáticamente)

# 6. Verificar Logs
# (Busca: "Conectado a MongoDB")

# 7. ¡LISTO!
# (Tu backend está en: https://tu-url.railway.app)
```

---

## 📊 ESTRUCTURA DEL PROYECTO

```
InternationalNutrition/
├── tienda-suplementos/
│   ├── backend/                          ← TÚ ESTÁS AQUÍ
│   │   ├── package.json                  ✅
│   │   ├── server.js                     ✅
│   │   ├── Dockerfile                    ✅
│   │   ├── .env.production               ✅
│   │   └── ... (otros archivos)
│   │
│   ├── frontend/
│   │   ├── vite.config.js
│   │   └── ... (código del frontend)
│   │
│   ├── docker-compose.yml                (desarrollo local)
│   ├── RAILWAY_VISUAL_GUIDE.md           ⭐ EMPIEZA AQUÍ
│   ├── RAILWAY_QUICK_START.md
│   ├── RAILWAY_CHECKLIST.md
│   ├── RAILWAY_DEPLOYMENT_GUIDE.md
│   ├── RAILWAY_TROUBLESHOOTING.md
│   ├── RAILWAY_COMPLETE_GUIDE.md
│   └── deploy-railway.ps1                (script helper)
│
└── ... (otros archivos)
```

---

## 🔗 ENLACES IMPORTANTES

### Plataformas
- **Railway**: https://railway.app
- **GitHub**: https://github.com/cipagautaaa/InternationalNutrition
- **MongoDB Atlas**: https://cloud.mongodb.com

### Recursos
- **Railway Docs**: https://docs.railway.app
- **Express.js**: https://expressjs.com
- **Node.js**: https://nodejs.org

---

## 🎓 CONCEPTOS BÁSICOS

### ¿Qué es Railway?
Plataforma en la nube que permite desplegar aplicaciones de forma fácil, sin configuración complicada.

### ¿Cómo funciona el deploy?
```
TU CÓDIGO (GitHub)
        ↓
    Railway detecta cambios
        ↓
    Descarga el código
        ↓
    Construye la imagen Docker
        ↓
    Levanta el contenedor
        ↓
    Tu app está en línea ✅
```

### ¿Qué es un Dockerfile?
Archivo que le dice a Docker cómo construir tu aplicación.

```dockerfile
FROM node:18-alpine        # Imagen base
WORKDIR /app               # Directorio
COPY package*.json ./      # Copiar dependencias
RUN npm ci                 # Instalar dependencias
COPY . .                   # Copiar código
CMD ["node", "server.js"]  # Comando para ejecutar
```

---

## ✅ PRE-REQUISITOS

### En tu PC

- [x] Node.js instalado
- [x] Git instalado
- [x] Windows PowerShell (o CMD)
- [x] Proyecto en `c:\Users\juanp\InternationalNutrition`

### Cuentas

- [x] GitHub (ya tienes)
- [x] Railway (crea en https://railway.app)
- [x] MongoDB Atlas (ya tienes)

### Archivos

- [x] `tienda-suplementos/backend/package.json`
- [x] `tienda-suplementos/backend/server.js`
- [x] `tienda-suplementos/backend/Dockerfile`
- [x] `tienda-suplementos/backend/.env.production`

---

## 🚀 PASOS PRINCIPALES

### 1️⃣ Preparación (5 minutos)
- [x] Verificar archivos
- [x] Git push a GitHub
- [x] Revisar variables de entorno

### 2️⃣ Crear Proyecto en Railway (3 minutos)
- [ ] Ir a railway.app
- [ ] Crear nuevo proyecto
- [ ] Conectar GitHub

### 3️⃣ Crear Servicio Backend (3 minutos)
- [ ] Crear servicio
- [ ] Configurar directorio raíz
- [ ] Seleccionar Dockerfile como builder

### 4️⃣ Variables de Entorno (2 minutos)
- [ ] Añadir todas las variables
- [ ] Guardar cambios

### 5️⃣ Deploy (2 minutos)
- [ ] Iniciar deploy
- [ ] Verificar logs
- [ ] Obtener URL

### 6️⃣ Verificar (1 minuto)
- [ ] Probar API
- [ ] Confirmar status 200
- [ ] Logs sin errores

---

## 🆘 AYUDA RÁPIDA

### Error: "MONGODB_URI is not set"
→ Ve a: RAILWAY_TROUBLESHOOTING.md → "MONGODB_URI is not set"

### Error: "Cannot find module"
→ Ve a: RAILWAY_TROUBLESHOOTING.md → "Cannot find module"

### Error: "MongoError: connect ECONNREFUSED"
→ Ve a: RAILWAY_TROUBLESHOOTING.md → "MongoError"

### No sé por dónde empezar
→ Ve a: RAILWAY_VISUAL_GUIDE.md

### Quiero guía paso a paso
→ Ve a: RAILWAY_CHECKLIST.md

### Necesito detalles técnicos
→ Ve a: RAILWAY_COMPLETE_GUIDE.md

---

## 📞 SOPORTE

Si tienes problemas:

1. **Busca en**: RAILWAY_TROUBLESHOOTING.md
2. **Revisa los Logs** en Railway (pestaña "Logs")
3. **Verifica MongoDB Atlas** (Network Access)
4. **Comprueba Variables** (todas configuradas)

---

## 🎉 CUANDO TERMINES

Una vez que tu backend esté en Railway:

1. **Obtén la URL**
   ```
   https://tu-backend.railway.app
   ```

2. **Usa en el frontend**
   ```
   VITE_API_BASE_URL=https://tu-backend.railway.app
   ```

3. **Despliega el frontend** (pasos similares)

4. **¡Tu tienda está en línea!** 🚀

---

## 📝 NOTAS IMPORTANTES

⚠️ **SEGURIDAD**:
- ❌ NUNCA hagas commit de `.env` con valores reales
- ✅ Usa Railway Variables para producción
- ✅ Las variables se cifran automáticamente

⚠️ **MONGODB**:
- Verifica que `0.0.0.0/0` está en Network Access
- Sin esto, Railway no puede conectar a BD

⚠️ **DOCKERFILE**:
- Debe existir en `tienda-suplementos/backend/`
- Railway lo necesita para construir la app

---

## 🎓 APRENDER MÁS

- **Railway Docs**: https://docs.railway.app
- **Docker Basics**: https://docker.com
- **Node.js Guide**: https://nodejs.org/docs
- **Express.js**: https://expressjs.com

---

## 📋 RESUMEN DE DOCUMENTOS

| Documento | Para qué | Duración |
|-----------|----------|----------|
| RAILWAY_VISUAL_GUIDE.md | Entender el proceso | 5 min |
| RAILWAY_QUICK_START.md | Deploy rápido | 10 min |
| RAILWAY_CHECKLIST.md | Verificar cada paso | 15 min |
| RAILWAY_DEPLOYMENT_GUIDE.md | Guía detallada | 20 min |
| RAILWAY_TROUBLESHOOTING.md | Problemas y soluciones | ref |
| RAILWAY_COMPLETE_GUIDE.md | Configuración avanzada | ref |

---

## ✨ EXTRAS

### Script Helper
```powershell
# Ejecutar en PowerShell desde tienda-suplementos/
.\deploy-railway.ps1
```

Ofrece un menú para:
- Verificar archivos
- Hacer git push
- Levantar docker-compose
- Ver logs
- Probar API
- Y más...

---

## 🚀 COMIENZA AHORA

### Opción 1: Visual (Recomendado)
```
Abre: RAILWAY_VISUAL_GUIDE.md
Duración: 5-10 minutos
Nivel: Principiante
```

### Opción 2: Checklist
```
Abre: RAILWAY_CHECKLIST.md
Duración: 15 minutos
Nivel: Intermedio
```

### Opción 3: Guía Completa
```
Abre: RAILWAY_DEPLOYMENT_GUIDE.md
Duración: 20 minutos
Nivel: Avanzado
```

---

**¡Adelante! Tu backend en producción te espera. 🎉**

---

*Documento actualizado: November 26, 2025*
*Proyecto: International Nutrition - Tienda Suplementos*
*GitHub: cipagautaaa/InternationalNutrition*
