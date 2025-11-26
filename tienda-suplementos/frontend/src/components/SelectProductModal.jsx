import { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import axios from '../utils/axios';

const CATEGORY_NORMALIZATION_MAP = {
  'Preentrenos y Quemadores': 'Preentrenos y Quemadores',
  'Pre-entrenos y Quemadores': 'Preentrenos y Quemadores',
  'Pre entrenos y quemadores': 'Preentrenos y Quemadores',
  'Pre-entrenos y Energía': 'Preentrenos y Quemadores',
  'Pre-Workout': 'Preentrenos y Quemadores',
  'Pre workout': 'Preentrenos y Quemadores',
  'Pre entrenos': 'Preentrenos y Quemadores',
  'Pre entrenos y energia': 'Preentrenos y Quemadores',
  'Pre entrenos y energía': 'Preentrenos y Quemadores',
  'Aminoácidos': 'Aminoácidos y Recuperadores',
  'Aminoacidos y recuperadores': 'Aminoácidos y Recuperadores',
  'Vitaminas': 'Salud y Bienestar',
  'Para la salud': 'Salud y Bienestar',
  'Complementos': 'Salud y Bienestar',
  'Rendimiento hormonal': 'Salud y Bienestar',
  'Comida': 'Comidas con proteína',
  'Comidas con proteina': 'Comidas con proteína',
  'Creatina': 'Creatinas',
  'Proteinas': 'Proteínas',
  'Proteina': 'Proteínas'
};

const CATEGORY_ALIASES = {
  'Proteínas': ['Proteínas', 'Proteinas', 'Proteina'],
  'Preentrenos y Quemadores': [
    'Preentrenos y Quemadores',
    'Pre-entrenos y Quemadores',
    'Pre entrenos y quemadores',
    'Pre-entrenos y Energía',
    'Pre-Workout',
    'Pre workout',
    'Pre entrenos',
    'Pre entrenos y energia',
    'Pre entrenos y energía'
  ],
  'Creatinas': ['Creatinas', 'Creatina'],
  'Aminoácidos y Recuperadores': ['Aminoácidos y Recuperadores', 'Aminoácidos', 'Aminoacidos y recuperadores'],
  'Salud y Bienestar': ['Salud y Bienestar', 'Vitaminas', 'Para la salud', 'Complementos', 'Rendimiento hormonal'],
  'Comidas con proteína': ['Comidas con proteína', 'Comida', 'Comidas con proteina']
};

const normalizeCategory = (raw) => {
  const value = (raw || '').trim();
  return CATEGORY_NORMALIZATION_MAP[value] || value || 'Sin categoría';
};

const matchesCategory = (product, selected) => {
  if (selected === 'all') return true;
  const normalizedProduct = product.normalizedCategory || normalizeCategory(product.category);
  const aliasCandidates = CATEGORY_ALIASES[selected] || [selected];
  const normalizedAlias = aliasCandidates.map(normalizeCategory);
  return normalizedAlias.includes(normalizedProduct);
};

/**
 * Modal para seleccionar un producto de la base de datos
 * Permite filtrar por categoría y buscar por nombre
 */
const SelectProductModal = ({ isOpen, onClose, onSelect }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Categorías fijas de la tienda
  const categories = [
    'Proteínas',
    'Preentrenos y Quemadores',
    'Creatinas',
    'Aminoácidos y Recuperadores',
    'Salud y Bienestar',
    'Comidas con proteína'
  ];

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => matchesCategory(p, selectedCategory));
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Solicitar todos los productos activos con un límite alto
  const { data } = await axios.get('/products?limit=500&flat=true');
      const productList = data.data || data.products || data || [];
      const enriched = productList.map(item => ({
        ...item,
        normalizedCategory: normalizeCategory(item.category)
      }));
      console.log('📦 Productos cargados para destacados:', {
        total: enriched.length,
        porCategoria: enriched.reduce((acc, product) => {
          const key = product.normalizedCategory || 'Sin categoría';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      });
      setProducts(enriched);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, fetchProducts]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const handleSelect = (product) => {
    onSelect(product);
    onClose();
    // Reset
    setSearchTerm('');
    setSelectedCategory('all');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Seleccionar Producto</h2>
            <p className="text-sm text-gray-600 mt-1">Elige un producto para destacar</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b bg-gray-50 space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-7000 focus:border-transparent"
            />
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-red-700 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-red-700'
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-red-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de productos */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product._id || product.id}
                  onClick={() => handleSelect(product)}
                  className="group bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-red-7000 hover:shadow-lg transition-all text-left"
                >
                  <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <p className="text-xs text-gray-500 uppercase mb-1">{product.category}</p>
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-red-700">
                    ${product.price}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectProductModal;
