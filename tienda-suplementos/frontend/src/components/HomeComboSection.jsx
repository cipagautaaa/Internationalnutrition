import { useState, useEffect } from 'react';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useCart } from '../context/CartContext';

const HomeComboSection = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Volumen');
  const [imageErrors, setImageErrors] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/combos');
      const combosData = Array.isArray(response.data) ? response.data : response.data.data || response.data.combos || [];
      // Ordenar por el campo 'orden' si existe, sino por createdAt
      const sortedCombos = combosData.sort((a, b) => {
        if (a.orden !== undefined && b.orden !== undefined) {
          return a.orden - b.orden;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setCombos(sortedCombos);
    } catch (error) {
      console.error('Error cargando combos:', error);
      setCombos([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCombos = combos.filter(combo => combo.category === activeCategory).slice(0, 4);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddComboToCart = (combo) => {
    addToCart({
      _id: combo._id,
      id: combo._id,
      name: combo.name,
      price: combo.price,
      image: combo.image,
      quantity: 1,
      isCombo: true,
      category: combo.category
    });
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
            Combos Anabólicos
          </h2>
          <p className="text-base sm:text-xl text-gray-600 font-light">
            Encuentra el combo perfecto para tu objetivo
          </p>
        </div>

        {/* Tabs de categoría */}
        <div className="flex justify-center mb-12 gap-4">
          {['Volumen', 'Definición'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
                activeCategory === cat
                  ? 'bg-red-700 text-white shadow-lg shadow-red-700/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active category badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full border-2 border-red-700 text-red-700 font-medium text-sm">
            Mostrando: <span className="ml-2 font-bold">{activeCategory}</span>
          </div>
        </div>

        {/* Grid de combos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
          </div>
        ) : filteredCombos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredCombos.map((combo) => {
              const comboId = combo._id || combo.id;
              const imageSrc = combo.image || null;
              const showImage = !!imageSrc && !imageErrors[comboId];

              return (
              <Link
                key={comboId}
                to={`/combo/${comboId}`}
                className="group relative bg-white border-2 border-gray-300 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-red-700 transition-all duration-500 hover:-translate-y-2 flex flex-col"
              >
                {/* Imagen del combo */}
                <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100/50 w-full overflow-hidden sm:aspect-square">
                  {showImage && (
                    <img
                      src={imageSrc}
                      alt={combo.name}
                      className="w-full h-auto sm:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => {
                        setImageErrors((prev) => ({ ...prev, [comboId]: true }));
                      }}
                    />
                  )}

                  {/* Fallback icon */}
                  {!showImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100/50">
                      <div className="text-gray-300">
                        <svg
                          className="w-16 h-16 sm:w-20 sm:h-20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Category badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-700 text-white text-xs font-semibold">
                      {combo.category}
                    </span>
                  </div>
                </div>

                {/* Divisor */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                {/* Contenido */}
                <div className="flex flex-col p-3 sm:p-4 gap-2">
                  {/* Nombre */}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors min-h-[2rem]">
                    {combo.name}
                  </h3>

                  {/* Descripción productos */}
                  <p className="hidden sm:block text-xs text-gray-600 line-clamp-2 min-h-[2rem]">
                    {combo.description}
                  </p>

                  {/* Precio */}
                  <div className="mt-auto">
                    <p className="text-xl sm:text-2xl font-bold text-red-700">
                      {formatPrice(combo.price)}
                    </p>
                  </div>

                  {/* Botón */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddComboToCart(combo);
                    }}
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 text-sm active:scale-95 inline-flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Agregar al Carrito
                  </button>
                </div>
              </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay combos disponibles en esta categoría</p>
          </div>
        )}

        {/* Ver más */}
        <div className="text-center">
          <Link
            to={`/combos-${activeCategory.toLowerCase()}`}
            className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg px-10 py-4 transition-all shadow-lg hover:shadow-xl"
          >
            Ver Todos los Combos de {activeCategory}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeComboSection;
