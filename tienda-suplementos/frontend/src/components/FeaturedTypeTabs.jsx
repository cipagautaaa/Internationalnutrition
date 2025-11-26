import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import ProductCard from './ProductCard';

/**
 * Componente de pestañas para filtrar productos y combos por objetivo (Volumen/Definición)
 * Muestra los productos destacados arriba y debajo muestra productos y combos filtrados
 */
export default function FeaturedTypeTabs() {
  const types = ['Volumen', 'Definición'];
  const [selectedType, setSelectedType] = useState('Volumen');
  const [combos, setCombos] = useState([]);
  const [combosLoading, setCombosLoading] = useState(true);

  // Obtener combos de la API
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setCombosLoading(true);
        const { data } = await axios.get('/combos');
        setCombos(data || []);
      } catch (error) {
        console.error('Error cargando combos:', error);
      } finally {
        setCombosLoading(false);
      }
    };

    fetchCombos();
  }, []);

  // Filtrar combos por categoría seleccionada
  const filteredCombos = combos.filter(combo => {
    return combo.category === selectedType && combo.inStock;
  });

  const allItems = [...filteredCombos];

  return (
    <div className="w-full space-y-10">
      {/* Header con título y botones alineados */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {/* Título a la izquierda */}
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-gray-900 tracking-tight">Combos Anabólicos</h2>
          <p className="text-base sm:text-lg text-gray-600 font-light">Encuentra el combo perfecto para tu objetivo</p>
        </div>
        
        {/* Botones - más centrados */}
        <div className="w-full lg:w-auto">
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
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
          
          {/* Indicador de selección */}
          <div className="mt-3 inline-flex px-4 py-2 bg-white rounded-full border border-red-700 text-sm text-gray-700">
            <span className="font-semibold">
              Mostrando: <span className="text-black font-bold">{selectedType}</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Grid de productos y combos filtrados */}
      <div className="w-full">
        {combosLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-6">
            {allItems.map(item => (
              <ProductCard 
                key={item.id || item._id} 
                product={item} 
                isCombo={!!item.category && (item.category === 'Volumen' || item.category === 'Definición')}
              />
            ))}
          </div>
        )}
        
        {!combosLoading && allItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay productos ni combos disponibles para {selectedType}</p>
          </div>
        )}
      </div>
    </div>
  );
}
