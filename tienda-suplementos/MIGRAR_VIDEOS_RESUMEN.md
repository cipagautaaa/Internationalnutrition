# 🎬 RESUMEN: MIGRAR VIDEOS A CLOUDINARY

## ✅ LO QUE ENCONTRÉ EN TU CÓDIGO

### Video Principal (Hero)
```
Localización: frontend/src/assets/images/video portada.mp4
Uso actual: Página de inicio (Home.jsx)
Tamaño: ~100 MB
En base de código: SÍ (ocupa espacio en git)

Problema: Video embebido en proyecto
Solución: Mover a Cloudinary
```

### Imágenes Estáticas
```
frontend/src/assets/images/
├── foto1.jpg        (Sede Tunja)
├── foto2.jpg        (Sede Duitama)
├── fotolocal.png    (Local)
└── Otras imágenes de productos

Total: ~113 MB de archivos estáticos
```

---

## 🎯 3 OPCIONES

### **OPCIÓN 1: Solo Video Hero (Más Rápido)**

**Tiempo:** ~5 minutos

```
1. Sube: video portada.mp4 a Cloudinary
   └─ Carpeta: suplementos/videos

2. Copia URL: 
   https://res.cloudinary.com/dvp3e4w8p/video/upload/.../video-portada.mp4

3. Actualiza: frontend/src/pages/Home.jsx
   const heroVideoUrl = 'URL_QUE_COPIASTE';

4. Cambia:
   <source src={heroVideo} />
   ↓
   <source src={heroVideoUrl} />

5. Prueba: http://localhost:5173
```

### **OPCIÓN 2: Videos + Imágenes Estáticas**

**Tiempo:** ~15 minutos

```
1. Sube todo a Cloudinary:
   - Video portada.mp4
   - foto1.jpg
   - foto2.jpg
   - fotolocal.png

2. Copia todas las URLs

3. Actualiza Home.jsx:
   const heroVideoUrl = '...';
   const foto1 = '...';
   const foto2 = '...';
   const fotoLocal = '...';

4. Reemplaza en el código
5. Prueba
```

### **OPCIÓN 3: Profesional - Config Centralizada**

**Tiempo:** ~20 minutos

```
1. Crea: frontend/src/config/cloudinary.js

2. Define todas las URLs ahí:
   export const ASSETS = {
     heroVideo: 'https://...',
     foto1: 'https://...',
     foto2: 'https://...',
   }

3. Importa en componentes:
   import { ASSETS } from '../config/cloudinary';

4. Usa en el código:
   <video src={ASSETS.heroVideo} />
   <img src={ASSETS.foto1} />

Ventaja: Más fácil de mantener
```

---

## 📊 ANTES vs DESPUÉS

### ANTES (Archivos Locales)

```
Git:
  - Frontend (3.2 GB)
    └─ assets/images/ (+113 MB)
       ├── video portada.mp4 (+100 MB)
       ├── foto1.jpg
       ├── foto2.jpg
       └── ...

Problemas:
❌ Git muy pesado
❌ Repositorio lento de clonar
❌ Video cargado desde servidor local (lento)
❌ CDN: No
```

### DESPUÉS (Cloudinary)

```
Git:
  - Frontend (3.0 GB) ✅ -200 MB

Cloudinary:
  suplementos/
  ├── videos/
  │   └── video-portada.mp4
  ├── imagenes/
  │   ├── foto1.jpg
  │   ├── foto2.jpg
  │   └── fotolocal.png
  └── productos/ (ya existe)

Ventajas:
✅ Git más ligero
✅ Video desde CDN global (RÁPIDO)
✅ Cambiar video sin redeploy
✅ Almacenamiento en nube
✅ Backups automáticos
```

---

## 🚀 FLUJO PASO A PASO

### Paso 1: Subir a Cloudinary

```
1. Abre: https://cloudinary.com/console/media_library
2. Click: "Upload Files"
3. Selecciona: video portada.mp4
4. En "Advanced" elige carpeta: suplementos/videos
5. Espera a que suba (1-2 min)
```

### Paso 2: Copiar URL

```
1. Haz click en el video subido
2. Click en "Copy URL"
3. Se copia algo como:
   https://res.cloudinary.com/dvp3e4w8p/video/upload/v1234567890/suplementos/videos/video-portada.mp4
```

### Paso 3: Actualizar Código

**Encuentra en Home.jsx línea 12:**
```jsx
import heroVideo from '../assets/images/video portada.mp4';
```

**Reemplaza por:**
```jsx
const heroVideoUrl = 'https://res.cloudinary.com/dvp3e4w8p/video/upload/v1234567890/suplementos/videos/video-portada.mp4';
```

**Luego en línea 176:**
```jsx
<source src={heroVideo} type="video/mp4" />
```

**Reemplaza por:**
```jsx
<source src={heroVideoUrl} type="video/mp4" />
```

### Paso 4: Prueba

```
1. Reinicia servidor: npm run dev
2. Abre: http://localhost:5173
3. Verifica que el video se carga
4. ¡Listo! ✅
```

---

## 🎨 CONFIGURACIÓN CENTRALIZADA (RECOMENDADO)

### Crear archivo: `frontend/src/config/cloudinary.js`

```javascript
// Configuración centralizada de Cloudinary
export const CLOUDINARY_CONFIG = {
  cloudName: 'dvp3e4w8p', // Reemplaza con tu cloud name
};

export const CLOUDINARY_URLS = {
  // Videos
  heroVideo: 'https://res.cloudinary.com/dvp3e4w8p/video/upload/v1234567890/suplementos/videos/video-portada.mp4',
  
  // Imágenes
  foto1: 'https://res.cloudinary.com/dvp3e4w8p/image/upload/v1234567890/suplementos/imagenes/foto1.jpg',
  foto2: 'https://res.cloudinary.com/dvp3e4w8p/image/upload/v1234567890/suplementos/imagenes/foto2.jpg',
  fotoLocal: 'https://res.cloudinary.com/dvp3e4w8p/image/upload/v1234567890/suplementos/imagenes/fotolocal.png',
};
```

### Usar en Home.jsx

```javascript
import { CLOUDINARY_URLS } from '../config/cloudinary';

// ...

const stores = [
  { name: 'Sede Tunja', image: CLOUDINARY_URLS.foto1 },
  { name: 'Sede Duitama', image: CLOUDINARY_URLS.fotoLocal }
];

// ...

<video autoPlay loop muted>
  <source src={CLOUDINARY_URLS.heroVideo} type="video/mp4" />
</video>
```

---

## 📁 ESTRUCTURA FINAL EN CLOUDINARY

```
Cloudinary Dashboard
└── Media Library
    └── suplementos/
        ├── videos/
        │   └── video-portada.mp4 ← Hero video
        ├── imagenes/
        │   ├── foto1.jpg ← Tienda Tunja
        │   ├── foto2.jpg ← Tienda Duitama
        │   └── fotolocal.png ← Local
        └── productos/
            ├── proteina.jpg
            ├── creatina.jpg
            └── ... (ya existentes)
```

---

## 🆘 POSIBLES ERRORES Y SOLUCIONES

### Error 1: "El video no se ve"

```
❌ URL incorrecta o no copiada bien
✅ Solución:
   1. Verifica URL en Cloudinary dashboard
   2. Copia "Direct Link" (no "Playback")
   3. Pégala exactamente en el código
   4. Reinicia servidor (npm run dev)
```

### Error 2: "Página en blanco"

```
❌ Problemas con importación
✅ Solución:
   1. Verifica que quitaste "import heroVideo from..."
   2. No uses "import" con URLs string
   3. Debe ser "const heroVideoUrl = 'url...'"
   4. Mira la consola (F12) por errores
```

### Error 3: "El video está pixelado"

```
❌ Compresión automática de Cloudinary
✅ Solución:
   1. Re-sube video con mejor calidad
   2. O usa transformación: ?q_auto:best
   3. URL completa: .../video-portada.mp4?q_auto:best
```

---

## ✅ CHECKLIST

- [ ] Video identificado: video portada.mp4
- [ ] Imágenes identificadas: foto1, foto2, fotolocal
- [ ] Carpetas creadas en Cloudinary (videos, imagenes)
- [ ] Video subido a Cloudinary
- [ ] URL copiada correctamente
- [ ] Home.jsx actualizado
- [ ] Servidor reiniciado (npm run dev)
- [ ] Video se ve en http://localhost:5173 ✅
- [ ] Imágenes también subidas (opcional)
- [ ] Archivo local puede borrarse (opcional)

---

## 💡 BENEFICIOS FINALES

```
✅ Git más ligero (-113 MB)
✅ Videos se cargan desde CDN (RÁPIDO ⚡)
✅ Puedes cambiar video sin redeploy
✅ Imágenes optimizadas automáticamente
✅ Backups en la nube
✅ Análisis de tráfico
✅ Transformaciones automáticas
```

---

## 📚 Documentación Completa

Lee: `MIGRAR_VIDEOS_CLOUDINARY.md`

Contiene:
- Pasos detallados
- Transformaciones avanzadas
- Troubleshooting completo
- Ejemplos de código

---

**¿Listo para migrar los videos?**

Te doy 2 opciones:

1. **Opción Rápida** (5 min):
   - Solo video hero a Cloudinary
   - Cambio simple en Home.jsx

2. **Opción Profesional** (20 min):
   - Video + imágenes a Cloudinary
   - Archivo de configuración centralizado
   - Más fácil de mantener

**¿Cuál prefieres?** 🚀
