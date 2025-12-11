import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Truck, X, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import QuickAddModal from './QuickAddModal';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { PRODUCT_IMAGE_ASPECT, PRODUCT_IMAGE_BASE, PRODUCT_IMAGE_HEIGHT } from '../styles/imageClasses';

/**
 * ProductCard especial para productos destacados
 * - Si es admin: muestra botones para remover/agregar productos
 * - Si es usuario: comportamiento normal
 */
const FeaturedProductCard = ({ product, onRemove, onAdd, isEmpty = false }) => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Clases responsivas para el tamaño de la tarjeta
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  
  const variants = useMemo(() => Array.isArray(product?.variants) ? product.variants : [], [product?.variants]);
  const sizeOptions = useMemo(() => {
    if (!product) return [];
    const opts = [];
    if (product.size) {
      opts.push({ _id: 'BASE', size: product.size, price: product.price, image: product.image, inStock: product.inStock !== false, __isBase: true });
    }
    variants.forEach(v => {
      if (v && v.size) {
        opts.push({ ...v, inStock: v.inStock !== false });
      }
    });
    return opts;
  }, [product, variants]);
  
  const firstAvailableOption = sizeOptions.find(opt => opt.inStock !== false) || sizeOptions[0];
  const displayPrice = firstAvailableOption ? firstAvailableOption.price : product?.price;
  const displayImage = firstAvailableOption && firstAvailableOption.image ? firstAvailableOption.image : product?.image;
  const hasAvailableStock = product?.inStock !== false && (!firstAvailableOption || firstAvailableOption.inStock !== false);

  const handleOpenQuickAdd = (e) => { e.preventDefault(); setQuickAddOpen(true); };

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
          <span className="text-lg font-semibold">Agregar Producto</span>
          <span className="text-sm text-gray-500">Click para seleccionar</span>
        </button>
      </div>
    );
  }

  // Si no hay producto, no renderizar nada
  if (!product) return null;

  // Lógica de badges estratégicos
  const isBestSeller = product.sales > 50 || product.featured;
  const isNew = product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7*24*60*60*1000);

  return (
    <div className="group relative flex flex-col h-full bg-white border-2 border-gray-300 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-red-700 transition-all duration-500 hover:-translate-y-2 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white before:via-transparent before:to-gray-50/50 before:opacity-60 before:pointer-events-none">
      {/* Badges estratégicos */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 flex flex-col gap-1 sm:gap-2">
        {isBestSeller && (
          <span className="bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 text-[9px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" />
            <span className="hidden xs:inline">MÁS VENDIDO</span>
            <span className="xs:hidden">TOP</span>
          </span>
        )}
        {isNew && (
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[9px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm">
            ✨ <span className="hidden xs:inline">NUEVO</span>
          </span>
        )}
      </div>

      {/* Botón de remover (solo admin) */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onRemove) onRemove(product._id || product.id);
          }}
          className="absolute top-4 right-4 z-30 w-9 h-9 bg-gradient-to-br from-red-700 to-red-700 hover:from-red-700 hover:to-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          title="Remover de destacados"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Imagen con hover zoom y Quick View */}
      <Link
        to={`/product/${product.id || product._id}`}
        className={`block relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100/50 ${PRODUCT_IMAGE_HEIGHT} ${PRODUCT_IMAGE_ASPECT} flex items-center justify-center`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.05),transparent_50%)] pointer-events-none"></div>
        <img
          className={`${PRODUCT_IMAGE_BASE} p-2 sm:p-4 group-hover:scale-110 transition-transform duration-500 relative z-10`}
          src={displayImage || '/placeholder-product.png'}
          alt={product.name}
        />
        
        {/* Quick View al hacer hover (solo para no-admin) */}
        {!isAdmin && (
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/20 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={handleOpenQuickAdd}
              className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100"
            >
              Vista Rápida
            </button>
          </div>
        )}
      </Link>

      {/* Divisor con efecto de profundidad */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>

      {/* Info del producto */}
      <div className="flex flex-col flex-1 p-1.5 sm:p-5 bg-gradient-to-b from-white to-gray-50/30 gap-1 sm:gap-4">
        {/* Categoría pequeña - Oculta en móvil */}
        <div className="hidden sm:flex items-center gap-2 mb-2">
          <div className="h-0.5 w-6 bg-gradient-to-r from-red-7000 to-red-700 rounded-full"></div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{product.category}</p>
        </div>
        
        {/* Título */}
        <Link to={`/product/${product.id || product._id}`}>
          <h3 className="text-xs sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors min-h-[1.5rem] sm:min-h-[2.8rem] leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Reviews - Oculto en móvil */}
        {product.rating > 0 && (
          <div className="hidden sm:flex items-center gap-2 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-600 font-medium">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Precio y botón en la misma fila (móvil) */}
        <div className="flex flex-col sm:flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2">
            {/* Precio */}
            <div className="flex items-baseline gap-1.5 flex-wrap flex-1">
              {product.originalPrice && product.originalPrice > displayPrice ? (
                <>
                  <span className="text-base sm:text-2xl font-black bg-gradient-to-r from-red-700 to-red-700 bg-clip-text text-transparent">${formatPrice(displayPrice)}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">${formatPrice(product.originalPrice)}</span>
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                    -{Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-base sm:text-2xl font-black text-gray-900">${formatPrice(displayPrice)}</span>
              )}
            </div>

            {/* CTA cuadrado solo en móvil - Ocultar si es admin */}
            {!isAdmin && (
              <button
                onClick={handleOpenQuickAdd}
                disabled={!hasAvailableStock}
                className={`sm:hidden flex items-center justify-center gap-2 font-bold text-xs rounded-lg transition-all duration-300 w-10 h-10 shrink-0 ${
                  hasAvailableStock
                    ? 'bg-gradient-to-r from-red-700 to-red-700 hover:from-red-700 hover:to-red-700 text-white transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {hasAvailableStock ? (
                  <ShoppingCart className="w-5 h-5" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* CTA completo en desktop - Ocultar si es admin */}
          {!isAdmin && (
            <button
              onClick={handleOpenQuickAdd}
              disabled={!hasAvailableStock}
              className={`hidden sm:flex w-full items-center justify-center gap-2 font-bold text-sm py-2.5 px-4 rounded-xl transition-all duration-300 ${
                hasAvailableStock
                  ? 'bg-gradient-to-r from-red-700 to-red-700 hover:from-red-700 hover:to-red-700 text-white transform hover:-translate-y-0.5'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasAvailableStock ? (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al Carrito
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Agotado
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {!isAdmin && <QuickAddModal product={product} open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />}
    </div>
  );
};

export default FeaturedProductCard;
