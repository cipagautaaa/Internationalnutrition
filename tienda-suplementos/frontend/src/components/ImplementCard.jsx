import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { PRODUCT_IMAGE_BASE, PRODUCT_IMAGE_HEIGHT } from '../styles/imageClasses';

const ImplementCard = ({ implement }) => {
  const [selectedSize, setSelectedSize] = useState(implement.sizes?.[0] || null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Optimizar URL de imagen para Cloudinary
  const optimizedImage = implement.image ? optimizeCloudinaryUrl(implement.image, {
    width: 500,
    height: 500,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto'
  }) : null;

  const handleAddToCart = () => {
    addToCart({
      _id: implement._id || implement.id,
      id: implement._id || implement.id,
      name: implement.name,
      price: implement.price,
      image: implement.image,
      quantity: 1,
      size: selectedSize,
      isImplement: true
    });
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(220,38,38,0.15)] hover:border-red-700 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
      
      {/* Imagen del implemento */}
      <div className={`relative bg-gradient-to-br from-gray-50 via-white to-gray-100/50 ${PRODUCT_IMAGE_HEIGHT} flex items-center justify-center overflow-hidden`}>
        {optimizedImage && !imageError ? (
          <img 
            src={optimizedImage} 
            alt={implement.name}
            className={`${PRODUCT_IMAGE_BASE} p-2 sm:p-4 transition-all duration-300 ${imageLoaded ? 'group-hover:scale-105' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
          />
        ) : null}
        
        {/* Fallback icon - solo mostrar si no hay imagen o falló */}
        {!optimizedImage || imageError || !imageLoaded ? (
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
        ) : null}
        
        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-semibold">
            ✓ Stock
          </span>
        </div>
      </div>

      {/* Divisor */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
        
        {/* Nombre */}
        <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors">
          {implement.name}
        </h3>

        {/* Selector de tallas - SIEMPRE VISIBLE */}
        {implement.sizes && implement.sizes.length > 0 && (
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              📏 Talla
            </label>
            <div className="flex flex-wrap gap-2 w-full">
              {implement.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex-1 min-w-[40px] px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedSize === size
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Precio */}
        <div className="pt-2">
          <p className="text-lg sm:text-xl font-bold text-red-700">
            {formatPrice(implement.price)}
          </p>
        </div>

        {/* Botón */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 text-sm active:scale-95 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Agregar al Carrito</span>
        </button>

        {/* Info adicional */}
        <div className="text-xs text-gray-500 text-center pt-2">
          Envío gratis desde $50.000
        </div>
      </div>
    </div>
  );
};

export default ImplementCard;
