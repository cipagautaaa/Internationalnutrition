/**
 * Configuración centralizada de assets en ImageKit
 * Todas las imágenes y videos de la app están aquí
 * Fácil de mantener: solo cambiar URLs cuando subes nuevo contenido
 * 
 * ⚠️ IMPORTANTE: Reemplaza IMAGEKIT_BASE con tu URL endpoint de ImageKit
 */

// URL endpoint de ImageKit
const IMAGEKIT_BASE = 'https://ik.imagekit.io/International';

/**
 * TRANSFORMACIONES DE IMAGEKIT
 * 
 * Para VIDEOS:
 * - tr:q-auto = calidad automática
 * - tr:f-auto = formato automático  
 * - tr:w-1280 = ancho máximo
 * 
 * Para generar POSTER/THUMBNAIL de un video:
 * - Añadir /ik-thumbnail.jpg al final del video
 * - O usar: tr:so-0 (snapshot at 0 seconds)
 */

export const IMAGEKIT_ASSETS = {
  // IMÁGENES ESTÁTICAS (Home y tiendas)
  images: {
    foto1: `${IMAGEKIT_BASE}/imagenes/foto1.jpg?tr=w-1200,h-800,fo-auto,q-auto`,
    foto2: `${IMAGEKIT_BASE}/imagenes/foto2.jpg?tr=w-1920,h-600,fo-auto,q-auto`,
    fotoLocal: `${IMAGEKIT_BASE}/imagenes/fotolocal.jpg?tr=w-1200,h-800,fo-auto,q-auto`,
  },

  // IMÁGENES DE CATEGORÍAS
  categoryHeroes: {
    proteinas: `${IMAGEKIT_BASE}/categorias/proteinas.png?tr=w-1920,h-600,fo-auto,q-auto`,
    creatina: `${IMAGEKIT_BASE}/categorias/creatinas.png?tr=w-1920,h-600,fo-auto,q-auto`,
    preentrenos: `${IMAGEKIT_BASE}/categorias/preentrenos.png?tr=w-1920,h-600,fo-auto,q-auto`,
    aminoacidos: `${IMAGEKIT_BASE}/categorias/aminoacidos.png?tr=w-1920,h-600,fo-auto,q-auto`,
    vitaminas: `${IMAGEKIT_BASE}/categorias/vitaminas.png?tr=w-1920,h-600,fo-auto,q-auto`,
    comidas: `${IMAGEKIT_BASE}/categorias/comidas.png?tr=w-1920,h-600,fo-auto,q-auto`,
  }
};

/**
 * NOTAS IMPORTANTES PARA IMAGEKIT:
 * 
 * 1. TRANSFORMACIONES EN URL (parámetro tr=):
 *    - w-{width}: ancho en píxeles
 *    - h-{height}: alto en píxeles
 *    - q-{1-100}: calidad (100 = máxima)
 *    - q-auto: calidad automática
 *    - f-auto: formato automático (webp/avif si el navegador lo soporta)
 *    - fo-auto: focus automático (para crop)
 *    - c-maintain_ratio: mantener proporción
 *    - so-{seconds}: snapshot de video en segundo específico
 *
 * 2. VENTAJAS DE IMAGEKIT:
 *    ✅ CDN Global: servido desde datacenter más cercano
 *    ✅ Compresión automática de videos
 *    ✅ Generación de thumbnails automática
 *    ✅ Transformaciones en tiempo real
 *    ✅ Caché agresivo en CDN
 *    ✅ Soporte para WebP y AVIF
 *
 * 3. ESTRUCTURA RECOMENDADA EN IMAGEKIT:
 *    /
 *    ├── imagenes/
 *    │   ├── foto1.jpg
 *    │   ├── foto2.jpg
 *    │   └── fotolocal.jpg
 *    └── categorias/
 *        ├── proteinas.png
 *        └── ...
 */
