# 🖼️ Guía de Configuración de Cloudinary

## ¿Qué es Cloudinary?
Cloudinary es un servicio en la nube para almacenar, gestionar y servir imágenes. Reemplaza el almacenamiento local en tu servidor.

## Ventajas
✅ No ocupa espacio en tu servidor
✅ Imágenes servidas desde CDN (más rápido)
✅ Transformaciones automáticas de imágenes
✅ Backups automáticos
✅ Plan gratuito generoso (25 GB almacenamiento)

---

## Paso 1: Crear Cuenta Cloudinary

1. Ve a https://cloudinary.com
2. Haz clic en **"Sign Up for Free"**
3. Completa el formulario (email, password, nombre)
4. Confirma tu email
5. ¡Listo! Tendrás acceso al dashboard

---

## Paso 2: Obtener Credenciales

1. Inicia sesión en https://cloudinary.com/console
2. En el panel principal verás:
   - **Cloud Name** (ej: `dvp3e4w8p`)
   - **API Key** (ej: `123456789012345`)
   - **API Secret** (ej: `a1b2c3d4e5f6g7h8i9j0`)

📌 **NO compartas el API Secret públicamente**

---

## Paso 3: Configurar Variables de Entorno

Abre `backend/.env` y agrega:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**Ejemplo real:**
```env
CLOUDINARY_CLOUD_NAME=dvp3e4w8p
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=a1b2c3d4e5f6g7h8i9j0
```

---

## Paso 4: Verificar la Instalación

Ya hemos instalado:
- `cloudinary` - librería de Cloudinary
- `multer-storage-cloudinary` - integración con multer

Archivos creados:
- ✅ `backend/config/cloudinary.js` - Configuración
- ✅ `backend/middleware/uploadCloudinary.js` - Middleware de upload
- ✅ `backend/routes/products.js` - Rutas actualizadas

---

## Paso 5: Crear 4 Productos de Prueba

Ejecuta:

```bash
cd backend
node testCloudinaryProducts.js
```

Esto creará 4 productos de prueba:
1. Proteína Whey Gold Standard
2. Pre-Workout C4 Energy
3. Creatina Monohidrato Pura
4. BCAA 2:1:1 Recovery

---

## Paso 6: Probar Upload de Imágenes

1. Reinicia el servidor:
```bash
npm run dev
```

2. Ve a http://localhost:5173/admin/products

3. Intenta subir una imagen en cualquier producto

4. La imagen se guardará en Cloudinary y podrás verla en:
   https://cloudinary.com/console/media_library

---

## Estructura de Carpetas en Cloudinary

Las imágenes se organizan en:
- `suplementos/productos/` - Todas las imágenes de productos

Dentro de cada carpeta verás:
- Nombre único de la imagen
- Miniatura
- URL pública
- Información de transformaciones

---

## API Response del Upload

Cuando subes una imagen, recibes:

```json
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/dvp3e4w8p/image/upload/v1234567890/suplementos/productos/abc123.jpg",
  "publicId": "suplementos/productos/abc123",
  "message": "Imagen subida exitosamente a Cloudinary"
}
```

---

## Transformaciones Automáticas

Por defecto, Cloudinary redimensiona automáticamente:
- Ancho: 800px
- Alto: 800px
- Modo: Rellenar (fill)
- Calidad: Auto-optimizada

Ejemplo URL con transformación:
```
https://res.cloudinary.com/dvp3e4w8p/image/upload/w_800,h_800,c_fill,q_auto/...
```

---

## Plan Gratuito Limits

- ✅ 25 GB almacenamiento
- ✅ 25 GB transferencia/mes
- ✅ Transformaciones ilimitadas
- ✅ 300k transforms/mes
- ⚠️ Después se ralentiza, no se bloquea

Perfecto para tiendas pequeñas/medianas.

---

## Solución de Problemas

### Error: "Variables de Cloudinary no configuradas"
**Solución:** Asegúrate de:
1. Haber completado el `.env` con las credenciales
2. Reiniciar el servidor después de agregar `.env`
3. No usar espacios en blanco extra

### Imagen no sube
**Solución:**
1. Verifica que el API Key sea correcto
2. Comprueba que el archivo sea JPG, PNG, GIF o WEBP
3. Verifica que pese menos de 5MB
4. Revisa la consola del servidor para errores

### No aparece en Cloudinary
**Solución:**
1. Ve a https://cloudinary.com/console/media_library
2. Expande la carpeta `suplementos/productos`
3. La imagen debería estar ahí en tiempo real

---

## Próximos Pasos

✅ Configurar Cloudinary para implementos
✅ Configurar Cloudinary para avatares de usuario
✅ Agregar optimización de imágenes en el frontend
✅ Configurar webhooks para sincronización automática

---

## Contacto Cloudinary Support
- 📧 https://support.cloudinary.com
- 📚 Docs: https://cloudinary.com/documentation/image_upload_api_reference
- 🎓 Tutorials: https://cloudinary.com/developers/videos
