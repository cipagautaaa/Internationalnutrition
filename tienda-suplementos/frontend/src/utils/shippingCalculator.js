/**
 * Utilidades para cálculo de envío
 * - Envío gratis a partir de $80,000
 * - Monto mínimo de compra: $20,000
 * - Costo de envío según distancia desde Boyacá
 */

export const FREE_SHIPPING_THRESHOLD = 80000;
export const MINIMUM_ORDER_AMOUNT = 20000;

// Costos de envío por departamento (desde Boyacá)
// Boyacá es el más cercano ($10,000), los más lejanos hasta $20,000
const SHIPPING_COSTS_BY_DEPARTMENT = {
  // Boyacá y cercanos - $10,000
  'boyaca': 10000,
  'boyacá': 10000,
  'cundinamarca': 10000,
  'bogota': 10000,
  'bogotá': 10000,
  
  // Cercanos - $12,000
  'santander': 12000,
  'meta': 12000,
  'casanare': 12000,
  'arauca': 13000,
  
  // Medio - $14,000
  'tolima': 14000,
  'huila': 14000,
  'caldas': 14000,
  'risaralda': 14000,
  'quindio': 14000,
  'quindío': 14000,
  'antioquia': 14000,
  'norte de santander': 14000,
  
  // Lejanos - $16,000
  'valle del cauca': 16000,
  'valle': 16000,
  'cauca': 16000,
  'cesar': 16000,
  'magdalena': 16000,
  'bolivar': 16000,
  'bolívar': 16000,
  'atlantico': 16000,
  'atlántico': 16000,
  'sucre': 16000,
  'cordoba': 16000,
  'córdoba': 16000,
  
  // Muy lejanos - $18,000
  'nariño': 18000,
  'narino': 18000,
  'putumayo': 18000,
  'caqueta': 18000,
  'caquetá': 18000,
  'la guajira': 18000,
  'guajira': 18000,
  
  // Los más lejanos - $20,000
  'choco': 20000,
  'chocó': 20000,
  'amazonas': 20000,
  'vaupes': 20000,
  'vaupés': 20000,
  'guainia': 20000,
  'guainía': 20000,
  'vichada': 20000,
  'guaviare': 20000,
  'san andres': 20000,
  'san andrés': 20000,
  'san andres y providencia': 20000,
};

// Costo por defecto para departamentos no listados
const DEFAULT_SHIPPING_COST = 15000;

/**
 * Normaliza el nombre del departamento para búsqueda
 */
const normalizeDepartment = (department) => {
  if (!department) return '';
  return department
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Calcula el costo de envío según el departamento
 */
export const getShippingCost = (department) => {
  if (!department) return DEFAULT_SHIPPING_COST;
  
  const normalized = normalizeDepartment(department);
  
  // Buscar coincidencia exacta o parcial
  for (const [key, cost] of Object.entries(SHIPPING_COSTS_BY_DEPARTMENT)) {
    if (normalized === normalizeDepartment(key) || normalized.includes(normalizeDepartment(key))) {
      return cost;
    }
  }
  
  return DEFAULT_SHIPPING_COST;
};

/**
 * Verifica si aplica envío gratis
 */
export const hasFreeShipping = (subtotal) => {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
};

/**
 * Calcula cuánto falta para envío gratis
 */
export const amountForFreeShipping = (subtotal) => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return FREE_SHIPPING_THRESHOLD - subtotal;
};

/**
 * Calcula el porcentaje de progreso hacia envío gratis
 */
export const freeShippingProgress = (subtotal) => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 100;
  return Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
};

/**
 * Verifica si el pedido cumple el monto mínimo
 */
export const meetsMinimumOrder = (subtotal) => {
  return subtotal >= MINIMUM_ORDER_AMOUNT;
};

/**
 * Lista de departamentos de Colombia para selects
 */
export const COLOMBIA_DEPARTMENTS = [
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés y Providencia',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
];
