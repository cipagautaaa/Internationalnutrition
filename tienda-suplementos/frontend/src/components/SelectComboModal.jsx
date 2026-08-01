import { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import axios from '../utils/axios';
import { formatPrice } from '../utils/formatPrice';

/**
 * Modal para seleccionar un combo de la base de datos
 * Permite filtrar por categoría (Volumen / Definición) y buscar por nombre
 */
const SelectComboModal = ({ isOpen, onClose, onSelect }) => {
  const [combos, setCombos] = useState([]);
  const [filteredCombos, setFilteredCombos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Volumen', 'Definición'];

  const filterCombos = useCallback(() => {
    let filtered = [...combos];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCombos(filtered);
  }, [combos, selectedCategory, searchTerm]);

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/combos');
      const comboList = Array.isArray(data) ? data : data.data || data.combos || [];
      setCombos(comboList);
    } catch (error) {
      console.error('Error al cargar combos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCombos();
    }
  }, [isOpen, fetchCombos]);

  useEffect(() => {
    filterCombos();
  }, [filterCombos]);

  const handleSelect = (combo) => {
    onSelect(combo);
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
            <h2 className="text-2xl font-bold text-gray-900">Seleccionar Combo</h2>
            <p className="text-sm text-gray-600 mt-1">Elige un combo para destacar</p>
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
              placeholder="Buscar combo por nombre..."
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
              Todos
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

        {/* Lista de combos */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
            </div>
          ) : filteredCombos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron combos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCombos.map((combo) => (
                <button
                  key={combo._id || combo.id}
                  onClick={() => handleSelect(combo)}
                  className="group bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-red-7000 hover:shadow-lg transition-all text-left"
                >
                  <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={combo.image || '/placeholder.png'}
                      alt={combo.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <p className="text-xs text-gray-500 uppercase mb-1">{combo.category}</p>
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">
                    {combo.name}
                  </h3>
                  <p className="text-lg font-bold text-red-700">
                    ${formatPrice(combo.price)}
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

export default SelectComboModal;
