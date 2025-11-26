import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import QuickAddModal from './QuickAddModal';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';

// ProductCard optimizado con psicología de conversión
// - Fondo blanco para percepción de limpieza
// - Badges estratégicos (más vendido, nuevo, stock bajo)
// - Hover con Quick View
// - Trust signals micro
// - Precio en rojo para captar atención

const ProductCard = ({ product }) => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product]
  );

  const sizeOptions = useMemo(() => {
    const opts = [];
    const baseSizeLabel = product.size || (variants.length === 0 ? 'Único' : 'Principal');

    if (baseSizeLabel) {
      opts.push({
        _id: product._id,
        optionId: 'BASE',
        size: baseSizeLabel,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        inStock: product.inStock !== false,
        __isBase: true,
      });
    }

    variants.forEach((variant) => {
      if (variant && variant.size) {
        opts.push({
          ...variant,
          optionId: String(variant._id || variant.id),
          inStock: variant.inStock !== false,
        });
      }
    });

    return opts;
  }, [product?._id, product?.size, product?.price, product?.originalPrice, product?.image, product?.inStock, variants]);

  const firstAvailableOption = useMemo(
    () => sizeOptions.find((opt) => opt.inStock !== false) || sizeOptions[0] || null,
    [sizeOptions]
  );

  const [selectedOptionId, setSelectedOptionId] = useState(() =>
    firstAvailableOption ? firstAvailableOption.optionId || String(firstAvailableOption._id) : null
  );

  useEffect(() => {
    if (!sizeOptions.length) {
      if (selectedOptionId !== null) {
        setSelectedOptionId(null);
      }
      return;
    }

    const preferred = firstAvailableOption || sizeOptions[0] || null;
    const preferredId = preferred ? preferred.optionId || String(preferred._id) : null;
    const currentExists = sizeOptions.some(
      (opt) => (opt.optionId || String(opt._id)) === selectedOptionId
    );

    if (!selectedOptionId && preferredId !== null) {
      setSelectedOptionId(preferredId);
      return;
    }

    if (!currentExists) {
      setSelectedOptionId(preferredId);
    }
  }, [sizeOptions, firstAvailableOption, selectedOptionId]);

  const selectedOption = useMemo(
    () => sizeOptions.find((opt) => (opt.optionId || String(opt._id)) === selectedOptionId) || null,
    [sizeOptions, selectedOptionId]
  );

  const activeOption = selectedOption || firstAvailableOption;
  const displayPrice = activeOption ? activeOption.price : product.price;
  const displayImage = activeOption?.image || product.image;
  const displayOriginalPrice = activeOption?.originalPrice ?? product.originalPrice;
  const hasDiscount = displayOriginalPrice && displayOriginalPrice > displayPrice;
  const hasAvailableStock =
    product.isActive !== false && (activeOption ? activeOption.inStock !== false : product.inStock !== false);

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const handleOpenQuickAdd = (event) => {
    event.preventDefault();
    setQuickAddOpen(true);
  };

  const isBestSeller = product.sales > 50 || product.featured;
  const isNew = product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="group relative flex flex-col h-full bg-white border-2 border-gray-300 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-red-700 transition-all duration-500 hover:-translate-y-2 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white before:via-transparent before:to-gray-50/50 before:opacity-60 before:pointer-events-none">
      {/* Badges estratégicos - posicionados arriba */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 flex flex-col gap-1 sm:gap-2">
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

      {/* Imagen con hover zoom y Quick View */}
      <Link
        to={`/product/${product.id || product._id}`}
        className="block relative overflow-hidden aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-100/50"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.05),transparent_50%)] pointer-events-none"></div>
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative z-10"
          src={displayImage || '/placeholder-product.png'}
          alt={product.name}
        />

        {/* Quick View al hacer hover */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/20 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={handleOpenQuickAdd}
            className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100"
          >
            Vista Rápida
          </button>
        </div>
      </Link>

      {/* Divisor con efecto de profundidad */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>

      {/* Info del producto */}
      <div className="flex flex-col flex-1 p-1.5 sm:p-5 bg-gradient-to-b from-white to-gray-50/30 gap-1 sm:gap-4">
        {/* Categoría pequeña - Oculta en móvil */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <div className="h-0.5 w-6 bg-gradient-to-r from-red-7000 to-red-700 rounded-full"></div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{product.category}</p>
        </div>

        {/* Título */}
        <Link to={`/product/${product.id || product._id}`}>
          <h3 className="text-xs sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors min-h-[1.5rem] sm:min-h-[2.8rem] leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Reviews (si existen) - Oculto en móvil */}
        {product.rating > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-3.5 h-3.5 ${index < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-600 font-medium">({product.reviewCount || 0})</span>
          </div>
        )}

        {sizeOptions.length > 1 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-gray-600 tracking-wide">TAMAÑO</p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((option) => {
                const optionId = option.optionId || String(option._id);
                const active = optionId === selectedOptionId;
                const disabled = option.inStock === false;
                return (
                  <button
                    key={optionId}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedOptionId(optionId)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {option.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {sizeOptions.length === 1 && sizeOptions[0]?.size && sizeOptions[0].size !== 'Único' && (
          <div className="mb-4">
            <span className="text-xs text-gray-500">Tamaño: {sizeOptions[0].size}</span>
          </div>
        )}

        {/* Precio y botón en la misma fila (móvil) */}
        <div className="flex flex-col sm:flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2">
            {/* Precio */}
            <div className="flex items-baseline gap-1.5 flex-wrap flex-1">
              {hasDiscount ? (
                <>
                  <span className="text-base sm:text-2xl font-black bg-gradient-to-r from-red-700 to-red-700 bg-clip-text text-transparent">${formatPrice(displayPrice)}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">${formatPrice(displayOriginalPrice)}</span>
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                    -{Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)}%
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
                aria-label="Elegir opciones y añadir"
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
              aria-label="Elegir opciones y añadir"
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
                  Agotado - Avísame
                </>
              )}
            </button>
          )}
        </div>

        {/* Trust signal micro - Ocultar si es admin */}
       
      </div>

      <QuickAddModal
        product={product}
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        initialVariantId={activeOption ? activeOption.optionId || String(activeOption._id) : null}
      />
    </div>
  );
};

export default ProductCard;

