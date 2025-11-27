/**
 * Configuración centralizada de assets en Cloudinary
 * Todas las imágenes y videos de la app están aquí
 * Fácil de mantener: solo cambiar URLs cuando subes nuevo contenido
 */

export const CLOUDINARY_ASSETS = {
  // VIDEOS
  videos: {
    heroVideo: 'https://res.cloudinary.com/dlopfk5uj/video/upload/v1764283011/video_portada_zpsjqf.mp4',
    videoTunja: 'https://res.cloudinary.com/dlopfk5uj/video/upload/v1764283756/videotunja_pst8hl.mp4',
    videoDuitama: 'https://res.cloudinary.com/dlopfk5uj/video/upload/v1764283600/videoduitama_j8wknh.mp4',
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
