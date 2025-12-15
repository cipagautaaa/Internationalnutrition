import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useCart } from '../context/CartContext';
import ComboQuickView from './ComboQuickView';

const HomeComboSection = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Volumen');
  const [imageErrors, setImageErrors] = useState({});
  const { addToCart, openCart } = useCart();
  const [quickCombo, setQuickCombo] = useState(null);

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/combos');
      const combosData = Array.isArray(response.data) ? response.data : response.data.data || response.data.combos || [];
      // Ordenar siempre por precio ascendente dentro de cada categoría (más baratos primero)
      const sortedCombos = combosData
        .slice()
        .sort((a, b) => {
          const priceA = Number(a?.price) || Number.MAX_SAFE_INTEGER;
          const priceB = Number(b?.price) || Number.MAX_SAFE_INTEGER;
          if (priceA !== priceB) return priceA - priceB;
          // Desempate estable por orden explícito y fecha
          if (a.orden !== undefined && b.orden !== undefined && a.orden !== b.orden) {
            return a.orden - b.orden;
          }
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        });
      setCombos(sortedCombos);
    } catch (error) {
      console.error('Error cargando combos:', error);
      setCombos([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por categoría y ordenar por precio ascendente con useMemo
  const filteredCombos = useMemo(() => {
    const filtered = combos
      .filter(combo => combo.category === activeCategory)
      .sort((a, b) => {
        const priceA = Number(a?.price) || Number.MAX_SAFE_INTEGER;
        const priceB = Number(b?.price) || Number.MAX_SAFE_INTEGER;
        return priceA - priceB;
      })
      .slice(0, 4);
    console.log('🏠 Home Combos ordenados:', activeCategory, filtered.map(c => ({ name: c.name, price: c.price })));
    return filtered;
  }, [combos, activeCategory]);

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
    openCart();
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

                  {/* Overlay vista rápida */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/25 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setQuickCombo(combo); }}
                      className="transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:bg-gray-100"
                    >
                      Vista Rápida
                    </button>
                  </div>

                  {/* Etiqueta ENVIO GRATIS */}
                  <div className="absolute top-3 right-3 z-20">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-yellow-400 text-gray-900 text-xs font-bold shadow-lg">
                      ENVIO GRATIS
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex flex-col p-4 sm:p-5 gap-3 flex-1">
                  {/* Categoría */}
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1 bg-red-700 rounded-full"></span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      COMBO {combo.category?.toUpperCase()}
                    </span>
                  </div>

                  {/* Nombre */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                    {combo.name}
                  </h3>

                  {/* Descripción productos */}
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 flex-1">
                    {combo.description}
                  </p>

                  {/* Precio + Botón carrito */}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {formatPrice(combo.price)}
                    </p>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (combo.inStock === false) return;
                        handleAddComboToCart(combo);
                      }}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl text-sm font-semibold transition-all shadow-md ${
                        combo.inStock === false
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-700 text-white hover:bg-red-800 hover:shadow-lg hover:scale-105'
                      }`}
                      aria-label="Agregar combo al carrito"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>

                  {combo.inStock === false && (
                    <p className="text-[11px] font-semibold text-red-600">Sin stock disponible</p>
                  )}
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

        <ComboQuickView combo={quickCombo} open={!!quickCombo} onClose={() => setQuickCombo(null)} />
      </div>
    </section>
  );
};

export default HomeComboSection;
