/**
 * Configuración centralizada de assets en Cloudinary
 * Todas las imágenes y videos de la app están aquí
 * Fácil de mantener: solo cambiar URLs cuando subes nuevo contenido
 */

// Base de Cloudinary para transformaciones
const CLOUDINARY_BASE = 'https://res.cloudinary.com/dlopfk5uj';

// Transformaciones de video para optimización
// q_auto = calidad automática, f_auto = formato automático (webm para navegadores modernos)
// vc_auto = codec automático, br_2m = bitrate máximo 2mbps para reducir peso
const VIDEO_TRANSFORMS = 'q_auto,f_auto,vc_auto';
const VIDEO_TRANSFORMS_HERO = 'q_auto:good,f_auto,vc_auto'; // Mejor calidad para hero

export const CLOUDINARY_ASSETS = {
  // VIDEOS - Con transformaciones de optimización
  videos: {
    // Video hero con buena calidad (es lo primero que ve el usuario)
    heroVideo: `${CLOUDINARY_BASE}/video/upload/${VIDEO_TRANSFORMS_HERO}/v1764283011/video_portada_zpsjqf.mp4`,
    // Videos de tiendas con compresión más agresiva (están más abajo en la página)
    videoTunja: `${CLOUDINARY_BASE}/video/upload/${VIDEO_TRANSFORMS}/v1764283756/videotunja_pst8hl.mp4`,
    videoDuitama: `${CLOUDINARY_BASE}/video/upload/${VIDEO_TRANSFORMS}/v1764283600/videoduitama_j8wknh.mp4`,
  },

  // POSTERS/THUMBNAILS de videos (primer frame del video, optimizado como imagen)
  videoPosters: {
    heroVideo: `${CLOUDINARY_BASE}/video/upload/so_0,f_auto,q_auto,w_1920,h_1080,c_fill/v1764283011/video_portada_zpsjqf.jpg`,
    videoTunja: `${CLOUDINARY_BASE}/video/upload/so_0,f_auto,q_auto,w_800,h_600,c_fill/v1764283756/videotunja_pst8hl.jpg`,
    videoDuitama: `${CLOUDINARY_BASE}/video/upload/so_0,f_auto,q_auto,w_800,h_600,c_fill/v1764283600/videoduitama_j8wknh.jpg`,
  },

  // IMÁGENES ESTÁTICAS (Home y tiendas)
  images: {
    foto1: 'https://res.cloudinary.com/dlopfk5uj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill/suplementos/imagenes/foto1.jpg',
    foto2: 'https://res.cloudinary.com/dlopfk5uj/image/upload/f_auto,q_auto,w_1920,h_600,c_fill/suplementos/imagenes/foto2.jpg',
    fotoLocal: 'https://res.cloudinary.com/dlopfk5uj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill/suplementos/imagenes/fotolocal.jpg',
  },

  // IMÁGENES DE CATEGORÍAS (CategoryConfigs)
  categoryHeroes: {
    proteinas: 'https://res.cloudinary.com/dlopfk5uj/image/upload/f_auto,q_auto,w_1920,h_600,c_fill/v1764226210/p0rpqpx3xlhw9p1tw6jj.png',
    creatina: 'https://res.cloudinary.com/dlopfk5uj/image/upload/f_auto,q_auto,w_1920,h_600,c_fill/v1764226293/sxgo7pofw7ismftbqmdg.png',
    preentrenos: 'https://res.cloudinary.com/dlopfk5uj/image/upload/f_auto,q_auto,w_1920,h_600,c_fill/v1764226119/nfd2pmmofhvfxa9bubzm.png',
    aminoacidos: 'https://res.cloudinary.com/dlopfk5uj/image/upload/f_auto,q_auto,w_1920,h_600,c_fill/v1764214864/prhxvunhfn1qwuptqk2m.png',
    vitaminas: 'https://res.cloudinary.com/dlopfk5uj/image/upload/f_auto,q_auto,w_1920,h_600,c_fill/v1764219856/oivqdvcf30xynjlpt2vc.png',
    comidas: 'https://res.cloudinary.com/dlopfk5uj/image/upload/f_auto,q_auto,w_1920,h_600,c_fill/v1764226210/p0rpqpx3xlhw9p1tw6jj.png',
  }
};

/**
 * NOTAS IMPORTANTES:
 * 
 * 1. TRANSFORMACIONES CLOUDINARY EN URL:
 *    - f_auto: formato automático (WebP para navegadores modernos)
 *    - q_auto: calidad automática (optimiza peso vs calidad)
 *    - w_1920, h_600: dimensión óptima
 *    - c_fill: crop automático si la relación de aspecto no coincide
 *    - v1234567890: versionado automático de Cloudinary
 *
 * 2. VENTAJAS:
 *    ✅ CDN Global: servido desde datacenter más cercano al usuario
 *    ✅ Compresión automática: reduce peso de archivos
 *    ✅ Transformación en tiempo real: no necesita compilar
 *    ✅ Cachés múltiples: navegador + CDN
 *    ✅ Lazy loading: solo carga cuando se ve
 *
 * 3. PARA ACTUALIZAR UN ASSET:
 *    - Ve a: https://cloudinary.com/console/media_library
 *    - Sube nuevo archivo (reemplaza el anterior)
 *    - Copia URL y pégala aquí
 *    - No necesitas redeploy (si lo cargas desde esta config)
 *
 * 4. ESTRUCTURA DE CARPETAS EN CLOUDINARY:
 *    suplementos/
 *    ├── videos/
 *    │   ├── video-portada.mp4
 *    │   └── video-duitama.mp4
 *    ├── imagenes/
 *    │   ├── foto1.jpg
 *    │   ├── foto2.jpg
 *    │   └── fotolocal.jpg
 *    └── categorias/
 *        ├── proteinas.jpg
 *        ├── creatinas.jpg
 *        └── ...
 */
