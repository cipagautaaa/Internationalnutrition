import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();

  // Clases responsivas para el item del carrito
  const itemClasses = `flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow
    sm:p-6 border border-gray-100`;
  
  const imageClasses = `w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-md object-cover`;

  const handleIncrement = () => {
    updateQuantity(item._key, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item._key, item.quantity - 1);
    }
  };

  const originalPrice = item.originalPrice || item.price;
  const discount = originalPrice - item.price;
  const hasDiscount = discount > 0;

  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Imagen del producto */}
        <div className="flex-shrink-0">
          <img
            src={item.image || '/placeholder-product.jpg'}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
        </div>

        {/* Información del producto */}
        <div className="flex-1 flex flex-col gap-3">
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">{item.name}</h3>
            
            {/* Precios */}
            <div className="space-y-1">
              {hasDiscount && (
                <div className="text-xs text-gray-400 line-through">
                  ${formatPrice(originalPrice)}
                </div>
              )}
              <div className="text-lg font-bold text-red-700">
                ${formatPrice(item.price)}
              </div>
              {hasDiscount && (
                <div className="inline-flex items-center gap-1 text-[11px] bg-black text-white px-2 py-1 rounded-full">
                  <span>Ahorro</span>
                  <span>(-${formatPrice(discount)})</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden">
              <button
                onClick={handleDecrement}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
                aria-label="Disminuir cantidad"
              >
                <Minus size={16} />
              </button>
              <div className="px-4 py-2 font-semibold min-w-[48px] text-center border-x border-gray-300">
                {item.quantity}
              </div>
              <button
                onClick={handleIncrement}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={() => removeFromCart(item._key)}
              className="text-gray-400 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
              aria-label="Eliminar del carrito"
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Variantes si existen */}
      {(item.size || item.flavor) && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {item.size && <span className="mr-2">Tamaño: {item.size}</span>}
          {item.flavor && <span>Sabor: {item.flavor}</span>}
        </div>
      )}
    </div>
  );
};

export default CartItem;
