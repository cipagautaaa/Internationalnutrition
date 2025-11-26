import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';
import { formatPrice } from '../utils/formatPrice';

const CartDrawer = () => {
  const { isCartOpen, closeCart, items, getTotalPrice, addToCart } = useCart();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  // Obtener productos relacionados reales de la base de datos
  const fetchRelatedProducts = useCallback(async () => {
    console.log('🔍 Iniciando fetchRelatedProducts...');
    setLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${apiUrl}/products`;
      
      console.log('📡 Llamando a:', url);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log('📦 API Response completa:', data);
      console.log('📦 Productos recibidos:', data?.data?.length || 0);

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        // Obtener IDs de productos en el carrito
        const cartProductIds = items.map(item => item._id || item.id || item.productId).filter(Boolean);
        console.log('🛒 Productos en carrito (IDs):', cartProductIds);

        // Filtrar productos que NO están en el carrito
        let filtered = data.data.filter(product => {
          if (!product || !product._id) return false;
          return !cartProductIds.includes(product._id);
        });
        
        console.log('✅ Productos después de filtrar:', filtered.length);

        // Si hay productos, tomar los primeros 5
        if (filtered.length > 0) {
          const finalProducts = filtered.slice(0, 5);
          console.log('🎯 Productos finales a mostrar:', finalProducts);
          setRelatedProducts(finalProducts);
        } else {
          console.log('⚠️ No hay productos después del filtrado');
          // Si todos están en el carrito, mostrar algunos de todos modos
          const someProducts = data.data.slice(0, 5);
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
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Carrito"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-semibold uppercase tracking-wide">Carrito de Compras</h2>
          <button onClick={closeCart} className="p-2 rounded hover:bg-gray-100" aria-label="Cerrar">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-64px)]">
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
          <div className="p-4 border-t bg-white">
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

                {/* Botones de acción */}
                <div className="space-y-3">
                  <Link
                    to="/cart"
                    className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-center font-medium hover:bg-gray-50 transition-colors uppercase tracking-wide"
                    onClick={closeCart}
                  >
                    Ver Carrito
                  </Link>
                  <Link
                    to="/wompi-checkout"
                    className="block w-full px-4 py-3 rounded-lg bg-cyan-500 text-white text-center hover:bg-cyan-600 transition-colors font-medium uppercase tracking-wide"
                    onClick={closeCart}
                  >
                    Finalizar Compra
                  </Link>
                </div>

                {/* Métodos de pago */}
                <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">≡</span>
                  </div>
                  <div className="px-3 py-1 border rounded text-xs font-semibold">Nequi</div>
                  <div className="px-3 py-1 border rounded text-xs font-semibold">Daviplata</div>
                  <div className="px-3 py-1 border rounded text-xs font-semibold">Addi</div>
                  <div className="px-3 py-1 border rounded text-xs font-semibold text-blue-900">VISA</div>
                </div>

                <div className="text-center mt-3 text-xs text-gray-500">
                  imnnutrition.co
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
