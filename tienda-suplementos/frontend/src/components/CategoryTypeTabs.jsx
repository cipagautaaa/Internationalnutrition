import { useState, useEffect } from 'react';

// Etiquetas visibles (sin duplicados) por categoría
const VISIBLE_TYPES = {
  'Proteínas': ['Limpias', 'Hipercalóricas', 'Veganas'],
  // Creatina: solo mostramos tipos concretos solicitados
  'Creatina': ['Monohidratada', 'HCL'],
  'Creatinas': ['Monohidratada', 'HCL'],
  'Pre-entrenos y Quemadores': ['Pre-entrenos', 'Quemadores de grasa'],
  'Pre-entrenos y Energía': ['Pre-entrenos', 'Quemadores de grasa']
};

// Mapa de etiqueta visible/sinónimos -> forma canónica almacenada en BD
const VISIBLE_TO_CANONICAL = {
  // Proteínas
  'Limpias': 'Limpia',
  'Hipercalóricas': 'Hipercalórica',
  'Veganas': 'Vegana',
  // Creatinas
  'Monohidrato': 'Monohidrato',
  'Monohidratada': 'Monohidrato',
  'HCL': 'HCL',
  'Complejos de creatina': 'Complejos de creatina',
  'Todas': '__ALL__',
  // Pre-entrenos y Quemadores
  'Pre-entrenos': 'Pre-entrenos',
  'Quemadores de grasa': 'Quemadores de grasa',
  // Sinónimos comunes que podrían llegar desde UI o BD
  'Monohidratadas': 'Monohidrato',
  'Proteínas limpias': 'Limpia',
  'Proteínas hipercalóricas': 'Hipercalórica',
  'Proteínas veganas': 'Vegana',
  'Limpia': 'Limpia',
  'Hipercalórica': 'Hipercalórica',
  'Vegana': 'Vegana',
  'QUEMADORES DE GRASA': 'Quemadores de grasa',
  'PRE ENTRENO': 'Pre-entrenos'
};

/**
 * Componente de pestañas para filtrar productos por tipo/subcategoría
 * Solo se muestra para categorías que tienen tipos definidos (Proteínas, Creatina)
 */
export default function CategoryTypeTabs({ category, products, onFilteredProducts }) {
  // Aceptar categoría en singular o plural
  const baseTypes = VISIBLE_TYPES[category] || VISIBLE_TYPES[category?.trim()] || [];

  // Usar una declaración de función (hoisted) para poder llamarla antes de su definición textual
  function canonical(value) {
    if (!value) return value;
    const key = typeof value === 'string' ? value.trim() : value;
    return VISIBLE_TO_CANONICAL[key] || key;
  }

  // Ocultar pestañas vacías dinámicamente (si no hay productos para ese tipo)
  const availableCanonicalTypes = new Set(
    (products || [])
      .map(p => p?.tipo || p?.productType || p?.type || '')
      .filter(Boolean)
      .map(canonical)
  );
  const types = baseTypes.filter(t => t === 'Todas' || availableCanonicalTypes.has(canonical(t)) || category === 'Pre-entrenos y Quemadores' || category === 'Pre-entrenos y Energía');

  const [selectedType, setSelectedType] = useState(types[0] || '');

  const getDefaultType = (cat) => {
    if (cat === 'Proteínas' || cat === 'Proteina' || cat === 'Proteinas') return 'Limpia';
    if (cat === 'Creatina' || cat === 'Creatinas') return 'Monohidratada';
    if (cat === 'Pre-entrenos y Quemadores' || cat === 'Pre-entrenos y Energía') return 'Pre-entrenos';
    return null;
  };

  // canonical ya definida arriba

  // Heurística mínima para inferir tipo cuando no viene del backend
  const inferTipoFromName = (name = '', cat = '') => {
    const n = String(name).toLowerCase();
    const c = String(cat).toLowerCase();
    if (c.includes('pre-entrenos') || c.includes('pre entrenos')) {
      // Palabras comunes en termogénicos/quemadores
      const burnerHints = /(lipo|hydroxi|burn|stack|cut|drene|core|redux|slim|shred|fat\s*burn)/i;
      if (burnerHints.test(n)) return 'Quemadores de grasa';
      return 'Pre-entrenos';
    }
    return undefined;
  };

  // Filtrar productos usando forma canónica
  const filterProducts = (uiType) => {
    if (!onFilteredProducts) return;
    const selectedCanonical = canonical(uiType);
    
    // Si selecciona "Todas", no filtramos
    if (selectedCanonical === '__ALL__') {
      onFilteredProducts(products || []);
      return;
    }
    
    // Para Proteínas Limpias, mostrar Limpias + Veganas juntas
    if ((category === 'Proteínas' || category === 'Proteinas') && selectedCanonical === 'Limpia') {
      const filtered = (products || []).filter(product => {
        const rawType = product.tipo || product.productType || product.type || '';
        const guessed = inferTipoFromName(product.name, product.category || category) || getDefaultType(category);
        const pType = rawType || guessed;
        const canon = canonical(pType);
        return canon === 'Limpia' || canon === 'Vegana';
      });
      onFilteredProducts(filtered);
      return;
    }
    
    // Filtrado normal para otros tipos
    const filtered = (products || []).filter(product => {
      const rawType = product.tipo || product.productType || product.type || '';
      const guessed = inferTipoFromName(product.name, product.category || category) || getDefaultType(category);
      const pType = rawType || guessed;
      return canonical(pType) === selectedCanonical;
    });
    onFilteredProducts(filtered);
  };

  const handleTypeChange = (type) => {
    // Si es Veganas en Proteínas, primero cargar todas y luego hacer scroll
    if ((category === 'Proteínas' || category === 'Proteinas') && type === 'Veganas') {
      // Primero cambiar a "Limpias" para mostrar todas (limpias + veganas)
      setSelectedType('Limpias');
      filterProducts('Limpias');
      
      // Hacer scroll después de un pequeño delay para que el DOM se actualice
      setTimeout(() => {
        const veganSection = document.getElementById('vegan-proteins-section');
        if (veganSection) {
          veganSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }
    
    setSelectedType(type);
    filterProducts(type);
  };

  useEffect(() => {
    // Si el tipo seleccionado desapareció por filtro dinámico, reubicar al primero
    if (types.length && !types.includes(selectedType)) {
      setSelectedType(types[0]);
    }
    if (types.length) {
      filterProducts(selectedType || types[0]);
    } else if (onFilteredProducts) {
      onFilteredProducts(products || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, category, types.length]);

  if (!types.length) return null;

  return (
    <div className="flex flex-col items-center w-full mb-10 space-y-6">
      {/* Título del selector para hacerlo más visible */}
      <div className="text-center px-4">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Selecciona el tipo de producto
        </h3>
        <p className="text-sm text-gray-600">Filtra por categoría específica</p>
      </div>

      {/* Pestañas más grandes y visibles */}
      <div className="w-full px-4">
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {types.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`
              whitespace-nowrap px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 
              focus:outline-none focus:ring-2 focus:ring-red-700 transform sm:px-6 sm:py-3 sm:text-base md:text-lg
              ${selectedType === type
                ? 'bg-gradient-to-r from-red-700 to-red-700 text-white shadow-xl scale-105 border-2 border-red-700'
                : 'bg-white text-gray-700 hover:bg-red-50 hover:text-black border-2 border-gray-300 hover:border-red-700 shadow-md hover:shadow-lg hover:scale-102'}
            `}
          >
            {type}
          </button>
        ))}
        </div>
      </div>

      {/* Indicador de selección actual más visible */}
      <div className="px-4">
        <div className="px-4 py-2 bg-white rounded-full border border-red-700 text-sm text-gray-700">
          <span className="font-semibold">
          Mostrando: <span className="text-black font-bold text-xl">{selectedType}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
