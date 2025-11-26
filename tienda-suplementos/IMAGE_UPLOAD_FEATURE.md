# Funcionalidad de Carga de Imágenes

## Descripción
Se ha implementado la funcionalidad para subir imágenes de productos desde el explorador de archivos, además de poder usar URLs externas.

## Características

### Backend
- **Endpoint**: `POST /api/products/upload-image`
- **Middleware**: Multer para manejo de archivos
- **Autenticación**: Requiere usuario admin autenticado
- **Validaciones**:
  - Tipos permitidos: jpeg, jpg, png, gif, webp
  - Tamaño máximo: 5MB
  - Las imágenes se guardan en `backend/public/uploads/`
  - Nombre de archivo único con timestamp

### Frontend
- **Ubicación**: Formulario de productos (`ProductForm.jsx`)
- **Opciones de carga**:
  1. **URL**: Ingresa la URL de una imagen externa
  2. **Archivo local**: Selecciona una imagen desde tu computadora
  
- **Características**:
  - Vista previa de la imagen seleccionada
  - Validación de tipo de archivo en el cliente
  - Validación de tamaño (5MB máximo)
  - Indicador de progreso durante la subida
  - Mensajes de error claros
  - Funciona tanto para imagen principal como para variantes

## Uso

### Para agregar imagen principal:
1. En el formulario de productos, busca el campo "Imagen"
2. Opción 1: Pega la URL de una imagen externa
3. Opción 2: Haz clic en "📁 Elegir archivo" y selecciona una imagen de tu computadora
4. Verás una vista previa de la imagen seleccionada

### Para agregar imagen a variantes:
1. En la sección de variantes, cada variante tiene su propio campo de imagen
2. Puedes usar URL o el botón 📁 para seleccionar un archivo
3. La imagen se muestra en miniatura al lado del botón de carga

## Configuración requerida

### Backend
```bash
cd backend
npm install multer
```

### Variables de entorno
No se requieren variables adicionales. Las imágenes se sirven desde:
- Desarrollo: `http://localhost:5000/uploads/[nombre-archivo]`
- Producción: `https://tu-dominio.com/uploads/[nombre-archivo]`

## Notas técnicas

- Las imágenes se almacenan en `backend/public/uploads/`
- Los nombres de archivo incluyen timestamp para evitar colisiones
- Express sirve archivos estáticos desde la carpeta `/uploads`
- Las URLs de imágenes subidas se construyen automáticamente con el dominio del servidor

## Mejoras futuras
- Compresión automática de imágenes
- Soporte para múltiples imágenes por producto
- Integración con servicios de almacenamiento en la nube (AWS S3, Cloudinary)
- Recorte y edición de imágenes en el cliente
