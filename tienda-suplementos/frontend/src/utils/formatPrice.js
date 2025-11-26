/**
 * Formatea un número como precio con separadores de miles
 * @param {number} price - El precio a formatear
 * @param {string} separator - El separador a usar (por defecto '.')
 * @returns {string} El precio formateado
 */
export const formatPrice = (price, separator = '.') => {
  if (!price && price !== 0) return '0';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '0';
  
  return Math.floor(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

export default formatPrice;
