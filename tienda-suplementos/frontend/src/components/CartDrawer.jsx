import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, AlertTriangle, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';
import { formatPrice } from '../utils/formatPrice';
import api from '../services/api';
import { 
  FREE_SHIPPING_THRESHOLD, 
  MINIMUM_ORDER_AMOUNT, 
  hasFreeShipping, 
  amountForFreeShipping, 
  freeShippingProgress 
} from '../utils/shippingCalculator';

const CartDrawer = () => {
  const { isCartOpen, closeCart, items, getTotalPrice, addToCart } = useCart();
  const navigate = useNavigate();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMinimumWarning, setShowMinimumWarning] = useState(false);

  const totalPrice = getTotalPrice();
  const isFreeShipping = hasFreeShipping(totalPrice);
  const amountNeeded = amountForFreeShipping(totalPrice);
  const progressPercent = freeShippingProgress(totalPrice);
  const meetsMinimum = totalPrice >= MINIMUM_ORDER_AMOUNT;

  // Obtener productos relacionados reales de la base de datos
  const fetchRelatedProducts = useCallback(async () => {
    console.log('🔍 Iniciando fetchRelatedProducts...');
    setLoading(true);
    
    try {
      const res = await api.get('/products', { params: { limit: 20, isActive: true } });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      console.log('📦 Productos recibidos:', data.length || 0);

      if (data.length > 0) {
        // Obtener IDs de productos en el carrito
        const cartProductIds = items.map(item => item._id || item.id || item.productId).filter(Boolean);
        console.log('🛒 Productos en carrito (IDs):', cartProductIds);

        // Filtrar productos que NO están en el carrito
        let filtered = data.filter(product => {
          if (!product || !product._id) return false;
          if (product.inStock === false || product.isActive === false) return false;
          return !cartProductIds.includes(product._id);
        });
        
        console.log('✅ Productos después de filtrar:', filtered.length);

        // Si hay productos, tomar los primeros 5
        if (filtered.length > 0) {
          const finalProducts = filtered.slice(0, 6);
          console.log('🎯 Productos finales a mostrar:', finalProducts);
          setRelatedProducts(finalProducts);
        } else {
          console.log('⚠️ No hay productos después del filtrado');
          // Si todos están en el carrito, mostrar algunos de todos modos
          const someProducts = data.slice(0, 6);
          setRelatedProducts(someProducts);
        }
      } else {
        console.warn('⚠️ No se encontraron productos o estructura incorrecta');
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener productos relacionados:', error);
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    console.log('CartDrawer - isCartOpen:', isCartOpen, 'items:', items.length);
    if (isCartOpen && items.length > 0) {
      console.log('Iniciando fetchRelatedProducts...');
      fetchRelatedProducts();
    } else if (isCartOpen && items.length === 0) {
      console.log('Carrito vacío, no se buscan productos relacionados');
      setRelatedProducts([]);
    }
  }, [isCartOpen, items, fetchRelatedProducts]);

  const getTotalDiscount = () => {
    return items.reduce((total, item) => {
      const discount = (item.originalPrice - item.price) * item.quantity;
      return total + (discount > 0 ? discount : 0);
    }, 0);
  };

  const getOriginalTotal = () => {
    return items.reduce((total, item) => {
      const originalPrice = item.originalPrice || item.price;
      return total + (originalPrice * item.quantity);
    }, 0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % relatedProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + relatedProducts.length) % relatedProducts.length);
  };

  const handleAddRelatedProduct = async (product) => {
    const productToAdd = {
      _id: product._id,
      id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      size: product.size || product.baseSize || null
    };
    
    addToCart(productToAdd);
    
    // Actualizar productos relacionados
    await fetchRelatedProducts();
  };

  const handleCheckout = (e) => {
    if (!meetsMinimum) {
      e.preventDefault();
      setShowMinimumWarning(true);
      setTimeout(() => setShowMinimumWarning(false), 5000);
      return;
    }
    closeCart();
    navigate('/wompi-checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-[9998] ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Carrito"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-semibold uppercase tracking-wide">
            {items.length} {items.length === 1 ? 'item' : 'items'} en el carrito
          </h2>
          <button onClick={closeCart} className="p-2 rounded hover:bg-gray-100" aria-label="Cerrar">
            <X size={24} />
          </button>
        </div>

        {/* Barra de progreso de envío gratis */}
        {items.length > 0 && (
          <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-b">
            {/* Barra de progreso */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div 
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                  isFreeShipping ? 'bg-red-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            {/* Mensaje */}
            {isFreeShipping ? (
              <div className="flex items-center justify-center gap-2 text-red-600 font-medium text-sm">
                <Truck size={16} />
                <span>¡Has desbloqueado el <strong>envío gratuito</strong>!</span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-700">
                  ¡Estás a <span className="font-bold text-red-600">${formatPrice(amountNeeded)}</span> de adquirir envío gratuito!
                </p>
              </div>
            )}
          </div>
        )}



        {/* Mensaje de ánimo si no tiene envío gratis */}
        {items.length > 0 && !isFreeShipping && (
          <div className="flex-shrink-0 px-4 py-2 bg-amber-50 border-b border-amber-100">
            <p className="text-xs text-amber-800 text-center">
              <Truck className="inline w-4 h-4 mr-1" />
              Ofrecemos envío gratis desde $80.000. ¡Anímate a potenciar tus ganancias y llenar tu carrito!
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-gray-600 text-center">Tu carrito está vacío.</div>
            ) : (
              <>
                <div className="divide-y">
                  {items.map((item) => (
                    <CartItem key={item._key} item={item} />
                  ))}
                </div>

                {/* También te puede gustar - SIEMPRE SE MUESTRA */}
                <div className="p-4 bg-gray-50 mt-4">
                  <h3 className="text-center font-medium mb-4">También te puede gustar</h3>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-pulse">Cargando productos...</div>
                    </div>
                  ) : relatedProducts.length > 0 ? (
                      <div className="relative">
                        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                          <button
                            onClick={prevSlide}
                            className="absolute left-2 z-10 p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
                            aria-label="Anterior"
                            disabled={relatedProducts.length <= 1}
                          >
                            <ChevronLeft size={20} />
                          </button>
                          
                          {relatedProducts[currentSlide] && (
                            <div className="flex items-center gap-3 w-full px-8">
                              <img
                                src={relatedProducts[currentSlide].image || '/placeholder-product.jpg'}
                                alt={relatedProducts[currentSlide].name}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = '/placeholder-product.jpg';
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium line-clamp-2">{relatedProducts[currentSlide].name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {relatedProducts[currentSlide].originalPrice && (
                                    <span className="text-gray-400 line-through text-xs">
                                      ${formatPrice(relatedProducts[currentSlide].originalPrice)}
                                    </span>
                                  )}
                                  <span className={relatedProducts[currentSlide].originalPrice ? "text-red-700 font-semibold" : "text-gray-800 font-semibold"}>
                                    ${formatPrice(relatedProducts[currentSlide].price)}
                                  </span>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleAddRelatedProduct(relatedProducts[currentSlide])}
                                className="p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                                aria-label="Agregar al carrito"
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 8v8M8 12h8" />
                                </svg>
                              </button>
                            </div>
                          )}

                          <button
                            onClick={nextSlide}
                            className="absolute right-2 z-10 p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
                            aria-label="Siguiente"
                            disabled={relatedProducts.length <= 1}
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>
                        
                        {/* Dots */}
                        {relatedProducts.length > 1 && (
                          <div className="flex justify-center gap-2 mt-3">
                            {relatedProducts.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentSlide ? 'bg-black' : 'bg-gray-300'
                                }`}
                                aria-label={`Ir a producto ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>No hay productos disponibles en este momento</p>
                      </div>
                    )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t bg-white">
            {items.length > 0 && (
              <>
                {/* Subtotal con descuento */}
                <div className="mb-4 text-right">
                  <div className="text-sm text-gray-600 mb-1">
                    ${formatPrice(getOriginalTotal())} - ${formatPrice(getTotalDiscount())}
                  </div>
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="text-sm font-medium">Subtotal:</span>
                    <span className="text-xl font-bold">${formatPrice(getTotalPrice())} COP</span>
                  </div>
                </div>

                {/* Advertencia de monto mínimo */}
                {showMinimumWarning && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <p className="font-semibold">Monto mínimo no alcanzado</p>
                      <p>El pedido mínimo es de <strong>${formatPrice(MINIMUM_ORDER_AMOUNT)}</strong>. Te faltan <strong>${formatPrice(MINIMUM_ORDER_AMOUNT - totalPrice)}</strong> para continuar.</p>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="space-y-3">
                  <Link
                    to="/cart"
                    className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-center font-medium hover:bg-gray-50 transition-colors uppercase tracking-wide"
                    onClick={closeCart}
                  >
                    Ver Carrito
                  </Link>
                  <button
                    onClick={handleCheckout}
                    className={`block w-full px-4 py-3 rounded-lg text-white text-center transition-colors font-medium uppercase tracking-wide flex items-center justify-center gap-2 ${
                      meetsMinimum 
                        ? 'bg-black hover:bg-gray-800' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    🔒 Paga de forma segura
                  </button>
                </div>

                {/* Métodos de pago removidos */}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
