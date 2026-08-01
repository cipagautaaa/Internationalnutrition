import { Link } from 'react-router-dom';
import { ShoppingCart, X, Plus } from 'lucide-react';
import { useState } from 'react';
import ComboQuickView from './ComboQuickView';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

/**
 * ComboCard especial para "Combos del Mes"
 * - Si es admin: muestra botones para remover/agregar combos
 * - Si es usuario: comportamiento normal
 */
const FeaturedComboCard = ({ combo, onRemove, onAdd, isEmpty = false }) => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const { addToCart, openCart } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Si es un slot vacío y NO es admin, no mostrar nada
  if (isEmpty && !isAdmin) {
    return null;
  }

  // Si es un slot vacío Y es admin, mostrar botón para agregar
  if (isEmpty && isAdmin) {
    return (
      <div className="group relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-red-7000 transition-all duration-300 flex items-center justify-center min-h-[400px]">
        <button
          onClick={onAdd}
          className="flex flex-col items-center gap-3 text-gray-400 hover:text-red-700 transition-colors p-8"
        >
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-red-700 transition-colors">
            <Plus className="w-10 h-10" />
          </div>
          <span className="text-lg font-semibold">Agregar Combo</span>
          <span className="text-sm text-gray-500">Click para seleccionar</span>
        </button>
      </div>
    );
  }

  // Si no hay combo, no renderizar nada
  if (!combo) return null;

  const comboId = combo._id || combo.id;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (combo.inStock === false) return;
    addToCart({
      _id: comboId,
      id: comboId,
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
    <div className="group relative flex flex-col h-full bg-white border-2 border-gray-300 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-red-700 transition-all duration-500 hover:-translate-y-2">
      {/* Botón de remover (solo admin) */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onRemove) onRemove(comboId);
          }}
          className="absolute top-4 right-4 z-30 w-9 h-9 bg-gradient-to-br from-red-700 to-red-700 hover:from-red-700 hover:to-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          title="Remover de combos del mes"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Imagen con hover zoom y Quick View */}
      <Link
        to={`/combo/${comboId}`}
        className="block relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100/50 aspect-square flex items-center justify-center"
      >
        <img
          className="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-110 transition-transform duration-500 relative z-10"
          src={combo.image || '/placeholder-product.png'}
          alt={combo.name}
        />

        {!isAdmin && (
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/20 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100"
            >
              Vista Rápida
            </button>
          </div>
        )}
      </Link>

      {/* Info del combo */}
      <div className="flex flex-col flex-1 p-1.5 sm:p-5 bg-gradient-to-b from-white to-gray-50/30 gap-1 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 mb-2">
          <div className="h-0.5 w-6 bg-gradient-to-r from-red-7000 to-red-700 rounded-full"></div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Combo {combo.category}</p>
        </div>

        <Link to={`/combo/${comboId}`}>
          <h3 className="text-xs sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors min-h-[1.5rem] sm:min-h-[2.8rem] leading-tight">
            {combo.name}
          </h3>
        </Link>

        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-1.5 flex-wrap flex-1">
              {combo.originalPrice && combo.originalPrice > combo.price ? (
                <>
                  <span className="text-base sm:text-2xl font-black bg-gradient-to-r from-red-700 to-red-700 bg-clip-text text-transparent">${formatPrice(combo.price)}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">${formatPrice(combo.originalPrice)}</span>
                </>
              ) : (
                <span className="text-base sm:text-2xl font-black text-gray-900">${formatPrice(combo.price)}</span>
              )}
            </div>

            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={combo.inStock === false}
                className={`flex items-center justify-center gap-2 font-bold text-xs rounded-lg transition-all duration-300 w-10 h-10 shrink-0 ${
                  combo.inStock !== false
                    ? 'bg-gradient-to-r from-red-700 to-red-700 hover:from-red-700 hover:to-red-700 text-white transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {!isAdmin && <ComboQuickView combo={combo} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />}
    </div>
  );
};

export default FeaturedComboCard;
