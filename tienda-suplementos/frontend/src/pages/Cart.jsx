import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import api from '../services/api';

const Cart = () => {
  const { items, getTotalPrice, addToCart } = useCart();
  const navigate = useNavigate();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  // Obtener productos relacionados reales de la base de datos
  const fetchRelatedProducts = useCallback(async () => {
    console.log('🔍 Iniciando fetchRelatedProducts (Cart page)...');
    setLoading(true);
    
    try {
      const res = await api.get('/products', { params: { limit: 20, isActive: true } });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      console.log('📦 Productos recibidos (Cart):', data.length || 0);

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
        
        console.log('✅ Productos después de filtrar (Cart):', filtered.length);

        // Si hay productos, tomar los primeros 5
        if (filtered.length > 0) {
          const finalProducts = filtered.slice(0, 6);
          console.log('🎯 Productos finales a mostrar (Cart):', finalProducts);
          setRelatedProducts(finalProducts);
        } else {
          console.log('⚠️ No hay productos después del filtrado (Cart)');
          // Si todos están en el carrito, mostrar algunos de todos modos
          const someProducts = data.slice(0, 6);
          setRelatedProducts(someProducts);
        }
      } else {
        console.warn('⚠️ No se encontraron productos o estructura incorrecta (Cart)');
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener productos relacionados (Cart):', error);
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    if (items.length > 0) {
      fetchRelatedProducts();
    }
  }, [items, fetchRelatedProducts]);

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="mx-auto px-4 sm:px-6 max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide">Carrito de Compras</h1>
          <p className="text-sm text-gray-600">{items.length} {items.length === 1 ? 'producto' : 'productos'} en tu carrito</p>
        </div>
        
        {/* Items del carrito */}
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {items.map((item) => (
            <CartItem key={item._key} item={item} />
          ))}
        </div>

        {/* También te puede gustar - SIEMPRE SE MUESTRA */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h3 className="text-center font-semibold text-base sm:text-lg mb-4">También te puede gustar</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-pulse">Cargando productos...</div>
            </div>
          ) : relatedProducts.length > 0 ? (
              <div className="relative">
                <div className="flex flex-col gap-4 bg-gray-50 rounded-xl p-4 sm:flex-row sm:items-center">
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 hidden sm:inline-flex"
                    aria-label="Anterior"
                    disabled={relatedProducts.length <= 1}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {relatedProducts[currentSlide] && (
                    <div className="flex flex-col gap-4 w-full sm:flex-row sm:items-center sm:px-12">
                      <img
                        src={relatedProducts[currentSlide].image || '/placeholder-product.jpg'}
                        alt={relatedProducts[currentSlide].name}
                        className="w-24 h-24 object-cover rounded-lg mx-auto sm:mx-0"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                      <div className="flex-1 text-center sm:text-left">
                        <p className="font-medium text-sm sm:text-base line-clamp-2">{relatedProducts[currentSlide].name}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                          {relatedProducts[currentSlide].originalPrice && (
                            <span className="text-gray-400 line-through text-sm">
                              ${formatPrice(relatedProducts[currentSlide].originalPrice)}
                            </span>
                          )}
                          <span className={relatedProducts[currentSlide].originalPrice ? "text-red-700 font-semibold text-lg" : "text-gray-800 font-semibold text-lg"}>
                            ${formatPrice(relatedProducts[currentSlide].price)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-center sm:justify-end">
                        <button 
                          onClick={() => handleAddRelatedProduct(relatedProducts[currentSlide])}
                          className="p-3 rounded-full bg-red-700 text-white hover:bg-red-700 transition-colors"
                          aria-label="Agregar al carrito"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v8M8 12h8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 hidden sm:inline-flex"
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

        {/* Resumen del pedido */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Resumen del Pedido</h2>
          
          {/* Subtotal con descuento */}
          <div className="space-y-2 mb-4 pb-4 border-b">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${formatPrice(getOriginalTotal())}</span>
            </div>
            {getTotalDiscount() > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuentos</span>
                <span>-${formatPrice(getTotalDiscount())}</span>
              </div>
            )}
          </div>

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold">${formatPrice(getTotalPrice())} COP</span>
          </div>

          {/* Botones de acción */}
            <div className="space-y-3">
            <button
              onClick={() => navigate('/products')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Continuar Comprando
            </button>
            <Link
              to="/wompi-checkout"
                className="block w-full px-4 py-3 rounded-lg bg-red-700 text-white text-center hover:bg-red-700 transition-colors font-semibold uppercase tracking-wide text-sm"
            >
              Finalizar Compra
            </Link>
          </div>

          {/* Métodos de pago */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-gray-600 mb-3 text-center">Métodos de pago aceptados:</p>
              <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
                <div className="px-3 py-1.5 border rounded-full font-semibold">Nequi</div>
                <div className="px-3 py-1.5 border rounded-full font-semibold">Daviplata</div>
                <div className="px-3 py-1.5 border rounded-full font-semibold">Addi</div>
                <div className="px-3 py-1.5 border rounded-full font-semibold text-blue-900">VISA</div>
              </div>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>imnnutrition.co</p>
          <p className="mt-2">Compra segura y protegida</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
