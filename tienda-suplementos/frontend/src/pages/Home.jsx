import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RotateCcw, CheckCircle, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import FeaturedProductCard from '../components/FeaturedProductCard';
import SelectProductModal from '../components/SelectProductModal';
import FeaturedTypeTabs from '../components/FeaturedTypeTabs';
import CategoryCarouselClean from '../components/CategoryCarouselClean';
import ProcessSection from '../components/ProcessSection';
import HomeComboSection from '../components/HomeComboSection';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

import heroVideo from '../assets/images/video portada.mp4';
import foto2 from '../assets/images/foto2.jpg';
import foto1 from '../assets/images/1.jpg';
import videoDuitama from '../assets/images/videoduitama.mp4';

const Home = () => {
  const { isAuthenticated, user, token } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [slotToReplace, setSlotToReplace] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const stores = [
    { name: 'Sede Tunja', image: foto1, type: 'image' },
    { name: 'Sede Duitama', video: videoDuitama, type: 'video' }
  ];

  const faqs = [
    {
      question: '¿Cómo puedo hacer un pedido?',
      answer: 'Puedes hacer tu pedido directamente desde nuestra página web agregando productos al carrito, o contactarnos por WhatsApp para asesoría personalizada.'
    },
    {
      question: '¿Cuál es el tiempo de entrega?',
      answer: 'Realizamos entregas en 24-48 horas en Tunja y Duitama. Para otras ciudades, el tiempo puede variar entre 3-5 días hábiles.'
    },
    {
      question: '¿Los productos son originales?',
      answer: 'Sí, todos nuestros productos son 100% originales y cuentan con certificación de calidad. Trabajamos directamente con distribuidores autorizados.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos transferencias bancarias, pagos con tarjeta de crédito/débito a través de MercadoPago, y pago contra entrega en nuestras sedes físicas.'
    },
    {
      question: '¿Puedo devolver un producto?',
      answer: 'Sí, aceptamos devoluciones dentro de los primeros 7 días si el producto está en su empaque original y sin abrir. Consulta nuestra política de devoluciones completa.'
    },
    {
      question: '¿Ofrecen asesoría nutricional?',
      answer: 'Sí, contamos con asesores capacitados que pueden ayudarte a elegir los productos adecuados según tus objetivos. Contáctanos por WhatsApp para asesoría personalizada.'
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/products/featured');
      const featured = data.data || data.featured || data || [];
      // Asegurar que siempre haya 4 slots
      const filledSlots = [...featured];
      while (filledSlots.length < 4) {
        filledSlots.push(null);
      }
      setFeaturedProducts(filledSlots.slice(0, 4));
    } catch (error) {
      console.error('Error al cargar productos destacados:', error);
      // En caso de error, dejar los slots vacíos para no mostrar datos antiguos
      setFeaturedProducts([null, null, null, null]);
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = () => {
    const defaultAuth = axios.defaults?.headers?.common?.Authorization;
    if (defaultAuth) return { Authorization: defaultAuth };
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  };

  const handleRemoveFeatured = async (productId) => {
    if (!isAdmin) return;
    if (!productId) {
      console.error('Intento de remover producto destacado sin ID válido');
      alert('No se pudo identificar el producto destacado. Recarga la página e inténtalo de nuevo.');
      return;
    }
    
    try {
      await axios.delete(`/products/featured/${productId}`, { headers: getAuthHeaders() });
      // Actualizar local
      const index = featuredProducts.findIndex(p => p && (p._id === productId || p.id === productId));
      if (index !== -1) {
        const newFeatured = [...featuredProducts];
        newFeatured[index] = null;
        setFeaturedProducts(newFeatured);
      }
    } catch (error) {
      console.error('Error al remover producto destacado:', error?.response?.status, error?.response?.data || error);
      const serverMessage = error?.response?.data?.message;
      alert(serverMessage || 'Error al remover el producto destacado');
    }
  };

  const handleAddFeatured = (slotIndex) => {
    if (!isAdmin) return;
    setSlotToReplace(slotIndex);
    setSelectModalOpen(true);
  };

  const handleProductSelected = async (product) => {
    if (!isAdmin || slotToReplace === null) return;
    const productId = product?._id || product?.id;
    if (!productId) {
      console.error('Producto seleccionado sin identificador válido para destacados');
      alert('No se pudo identificar el producto a destacar. Intenta con otro producto o recarga la página.');
      return;
    }

    try {
      await axios.post('/products/featured', {
        productId,
        position: slotToReplace
      }, { headers: getAuthHeaders() });
      // Actualizar local
      const newFeatured = [...featuredProducts];
      newFeatured[slotToReplace] = { ...product, _id: productId };
      setFeaturedProducts(newFeatured);
      setSlotToReplace(null);
    } catch (error) {
      console.error('Error al agregar producto destacado:', error);
      alert('Error al agregar el producto destacado');
    }
  };
  const scrollToCategories = () => {
    const section = document.getElementById('categories');
    const title = document.getElementById('categories-title');
    const target = title || section;
    if (!target) return;

    // Calcula altura real del navbar fijo y su top actual (20px/40px) para sacar el offset exacto
    const navbar = document.getElementById('main-navbar');
    let headerOffset = 0;
    if (navbar) {
      const rect = navbar.getBoundingClientRect();
      const styles = getComputedStyle(navbar);
      const topPx = parseFloat(styles.top) || 0; // por ejemplo 20 o 40
      headerOffset = rect.height + topPx; // altura total ocupada desde el top
    }

    const desiredGap = 32; // separación visual extra para replicar la captura
    const y = target.getBoundingClientRect().top + window.scrollY - headerOffset - desiredGap;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
  <div className="min-h-screen text-gray-900 bg-black">
      {/* Hero Section Limpio */}
      <section
        className="relative bg-black z-0 h-screen"
        style={{ 
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          left: 0
        }}
      >
        <video
          className="absolute inset-0 w-full h-full object-cover lg:opacity-90"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Overlay para mejorar contraste y empujar el foco visual */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90" />
        
        <div className="relative z-10 flex h-full flex-col items-center justify-end pb-16 sm:pb-24 lg:pb-32">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-2xl lg:max-w-3xl mx-auto space-y-3 sm:space-y-4">

              {/* Headline minimalista */}
              <h1 className="text-5xl sm:text-7xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                Suplementos que
                <span className="block text-red-700">sí funcionan</span>
              </h1>

              <h2 className='text-xl sm:text-2xl lg:text-xl font-semibold text-gray-200 leading-tight'>International Nutrition</h2>
              
              {/* Subheadline simple */}
              <p className="text-white/75 text-sm sm:text-base lg:text-base leading-relaxed font-light px-2">
                Calidad premium, envío gratis y garantía de resultados
              </p>

              {/* CTA limpio */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto justify-center pt-2">
                <button
                  onClick={scrollToCategories}
                  className="inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg px-8 py-3 sm:px-10 sm:py-3 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Ver Productos
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                <a
                  href="https://wa.me/573006851794"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 rounded-lg px-8 py-3 sm:px-10 sm:py-3 transition-all backdrop-blur-md text-sm sm:text-base"
                >
                  Requieres Asesoría?
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
    </section>

      

      {/* Featured Products - Diseño limpio */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
              Destacados
            </h2>
            <p className="text-base sm:text-xl text-gray-600 font-light">
              Los Productos favoritos de nuestros clientes
            </p>
            {isAdmin && (
              <p className="text-sm text-red-700 font-medium mt-2">
                Modo Edición: Pasa el mouse sobre un producto para editarlo
              </p>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-700"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 lg:gap-8">
              {featuredProducts.map((product, index) => (
                <FeaturedProductCard
                  key={product ? (product._id || product.id) : `empty-${index}`}
                  product={product}
                  isEmpty={!product}
                  onRemove={handleRemoveFeatured}
                  onAdd={() => handleAddFeatured(index)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal de selección de producto - Solo para admin */}
      {isAdmin && (
        <SelectProductModal
          isOpen={selectModalOpen}
          onClose={() => {
            setSelectModalOpen(false);
            setSlotToReplace(null);
          }}
          onSelect={handleProductSelected}
        />
      )}

      {/* Features Section - Diseño con profundidad y movimiento */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="text-center group cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-600/50 group-hover:-translate-y-1 animate-bounce-slow">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors group-hover:text-red-700">
                Envío Gratis
              </h3>
              <p className="text-gray-600 font-light">
                Desde $0 en 24-48h
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-600/50 group-hover:-translate-y-1">
                <RotateCcw className="w-7 h-7 text-white animate-spin-slow" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors group-hover:text-red-700">
                Garantía Total
              </h3>
              <p className="text-gray-600 font-light">
                30 días de devolución
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-600/50 group-hover:-translate-y-1 animate-float">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors group-hover:text-red-700">
                Calidad Premium
              </h3>
              <p className="text-gray-600 font-light">
                Productos certificados
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center group cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-600/50 group-hover:-translate-y-1 animate-bounce-slow">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-colors group-hover:text-red-700">
                Pago Seguro
              </h3>
              <p className="text-gray-600 font-light">
                Compra protegida
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Tabs de filtrado por objetivo */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedTypeTabs />
          
          <div className="text-center mt-16">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-700 text-white font-semibold rounded-lg px-10 py-4 transition-all shadow-lg hover:shadow-xl"
            >
              Ver Todos los Productos
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Imagen foto2 */}
      <section className="w-full">
        <img src={foto2} alt="Banner promocional" className="w-full h-auto object-cover" />
      </section>
      
      {/* Carrusel de Categorías */}
      <section id="categories" className="py-16 sm:py-20 bg-white scroll-mt-24 md:scroll-mt-28 lg:scroll-mt-32">
        <CategoryCarouselClean />
      </section>

      {/* Process Section */}
      <ProcessSection />

      {/* Sección Nuestras Tiendas */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 tracking-tight">Nuestras Tiendas</h2>
            <p className="text-base sm:text-xl text-gray-600 font-light">Visítanos en cualquiera de nuestras dos sedes</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
            {stores.map((store, index) => (
              <div
                key={store.name}
                className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              >
                {/* Imagen o Video de fondo */}
                <div className="relative h-72 sm:h-[420px] overflow-hidden">
                  {store.type === 'video' ? (
                    <video 
                      src={store.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <img 
                      src={store.image} 
                      alt={store.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                </div>

                {/* Contenido superpuesto */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {store.name}
                    </h3>
                    <p className="text-lg text-white/90 mb-4">
                      {index === 0 ? 'Tunja, Boyacá' : 'Duitama, Boyacá'}
                    </p>
                    
                    {/* Horario */}
                    <div className="mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      <p className="text-sm text-white/80 mb-1">
                        <span className="font-semibold">Horario de apertura:</span>
                      </p>
                      <p className="text-sm text-white/90">Abiertos todos los días – 10:00am to 8:00pm</p>
                      <p className="text-xs text-white/70">Festivos también</p>
                    </div>

                    {/* Botón CTA */}
                    <Link 
                      to={`/ubicaciones?sede=${index === 0 ? 'tunja' : 'duitama'}`}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-red-700 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Cómo llegar</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                {/* Badge decorativo */}
                <div className="absolute top-6 right-6 bg-red-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {index === 0 ? '📍 Sede Principal' : '📍 Sucursal'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Preguntas Frecuentes */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 tracking-tight">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-0 border-t border-gray-200">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-200"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full py-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-normal text-gray-900 pr-4">{faq.question}</span>
                  <span className="text-2xl text-gray-400 flex-shrink-0">
                    {openFaqIndex === index ? '−' : '+'}
                  </span>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                  }`}
                >
                  <div className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;