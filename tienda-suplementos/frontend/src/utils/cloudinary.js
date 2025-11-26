/**
 * Optimiza URLs de Cloudinary agregando parámetros de transformación
 * @param {string} url - URL de Cloudinary o cualquier URL
 * @param {object} options - Opciones de transformación
 * @returns {string} - URL optimizada
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url) return '';
  
  // Si no es una URL de Cloudinary, devolverla como está
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 500,
    height = 500,
    crop = 'fill', // 'fill', 'fit', 'scale', 'crop', 'thumb', 'pad'
    gravity = 'auto', // 'auto', 'center', 'face', etc.
    quality = 'auto', // 'auto', 'best', etc.
  } = options;

  // URL de ejemplo: https://res.cloudinary.com/xxx/image/upload/v123/folder/filename.jpg
  // Insertamos los parámetros de transformación antes de 'v'
  
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url; // Si no está en el formato esperado, devolverlo como está

  const baseUrl = parts[0];
  const uploadPart = parts[1];
  
  // Crear string de transformación
  const transform = `w_${width},h_${height},c_${crop},g_${gravity},q_${quality}`;
  
  return `${baseUrl}/upload/${transform}/${uploadPart}`;
};

export default optimizeCloudinaryUrl;
