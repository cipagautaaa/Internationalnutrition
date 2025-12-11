import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import Header from './components/Header';
import TextCarrousel from './components/TextCarrousel';
import Home from './pages/Home';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail';
import ComboDetail from './pages/ComboDetail';
import Cart from './pages/Cart';
import CheckoutNew from './components/CheckoutNew';
import WompiCheckout from './components/WompiCheckout';
import WompiPaymentSimple from './components/WompiPaymentSimple';
import WompiGatewayPayment from './components/WompiGatewayPayment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import CartDrawer from './components/CartDrawer';
import SearchDrawer from './components/SearchDrawer';
import LoginModal from './components/LoginModal';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import CookieConsent from './components/CookieConsent';
import CookiePolicy from './pages/CookiePolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import ReturnsPolicy from './pages/ReturnsPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import CommerceData from './pages/CommerceData';
import Profile from './pages/Profile';
import WhatsappFloatButton from './components/WhatsappFloatButton';
import ScrollToTop from './components/ScrollToTop';
import AdminProducts from './pages/AdminProducts';
import AdminCombos from './pages/AdminCombos';
import AdminCatalogView from './pages/AdminCatalogView';
import AdminProfile from './pages/AdminProfile';
import AdminLayout from './components/AdminLayout';
import AdminPageManagement from './components/AdminPageManagement';
import RequireAdmin from './components/RequireAdmin';
import RestrictAdmin from './components/RestrictAdmin';
import Footer from './components/fotterPrueba';
import Locations from './components/Locations';
import Implements from './pages/Implements';
import ImplementDetail from './pages/ImplementDetail';
// Páginas por categoría
import Proteinas from './pages/categories/Proteinas';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Creatina from './pages/categories/Creatina';
import Aminoacidos from './pages/categories/Aminoacidos';
import PreEntrenos from './pages/categories/PreEntrenos';
import Vitaminas from './pages/categories/Vitaminas';
import Salud from './pages/categories/Salud';
import Comida from './pages/categories/Comida';
import CombosVolumen from './pages/CombosVolumen';
import CombosDefinicion from './pages/CombosDefinicion';


function App() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAdminAuthed = isAuthenticated && isAdmin;
  
  // Clases para el contenedor principal - sin padding porque header es fixed
  const mainClasses = 'min-h-screen bg-gray-50';
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Ocultar elementos de tienda en rutas específicas (como checkout) para un look limpio estilo pasarela
  const isCheckoutRoute = location.pathname === '/wompi-checkout' || location.pathname === '/checkout' || location.pathname === '/wompi-payment' || location.pathname === '/wompi-gateway-payment';
  const hideFooter = isAdminRoute || isCheckoutRoute || location.pathname === '/profile' || location.pathname === '/ubicaciones';
  const hideCarrousel = isAdminRoute || isCheckoutRoute || location.pathname === '/ubicaciones';
  const hideHeader = isAdminRoute || isCheckoutRoute;

  // Si es admin autenticado Y está en rutas /admin, usar AdminLayout
  if (isAdminAuthed && isAdminRoute) {
    return (
      <AdminLayout>
  <ScrollToTop smooth />
        <Routes>
          <Route path="/admin" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
          <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
          <Route path="/admin/profile" element={<RequireAdmin><AdminProfile /></RequireAdmin>} />
          <Route path="/admin/combos" element={<RequireAdmin><AdminCombos /></RequireAdmin>} />
          <Route path="/admin/combos/:category" element={<RequireAdmin><AdminCombos /></RequireAdmin>} />
          <Route path="/admin/catalog" element={<RequireAdmin><AdminCatalogView /></RequireAdmin>} />
          <Route path="/admin/accessories" element={<RequireAdmin><AdminCatalogView /></RequireAdmin>} />
          <Route path="/admin/page-management" element={<RequireAdmin><AdminPageManagement /></RequireAdmin>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="*" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
        </Routes>
      </AdminLayout>
    );
  }
  
  return (
    <div>
      {/* Los admins pueden navegar a la home pública sin redirección */}
      <ScrollToTop smooth />
  {!hideCarrousel && <TextCarrousel offset={0} />}
  {!hideHeader && <Header />}
      <CartDrawer />
      <SearchDrawer />
      <LoginModal />
      <main className={mainClasses}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          {/* Rutas específicas por categoría */}
          <Route path="/products/proteinas" element={<Proteinas />} />
          <Route path="/products/creatina" element={<Creatina />} />
          <Route path="/products/aminoacidos" element={<Aminoacidos />} />
          <Route path="/products/preworkout" element={<PreEntrenos />} />
          <Route path="/products/vitaminas" element={<Vitaminas />} />
          <Route path="/products/salud" element={<Salud />} />
          <Route path="/products/comida" element={<Comida />} />
          <Route path="/combos/volumen" element={<CombosVolumen />} />
          <Route path="/combos/definicion" element={<CombosDefinicion />} />
          <Route path="/implementos" element={<Implements />} />
          <Route path="/implementos/:id" element={<ImplementDetail />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/combo/:id" element={<ComboDetail />} />
          <Route path="/cart" element={<RestrictAdmin><Cart /></RestrictAdmin>} />
          <Route path="/checkout" element={<RestrictAdmin><CheckoutNew /></RestrictAdmin>} />
          <Route path="/wompi-checkout" element={<RestrictAdmin><WompiCheckout /></RestrictAdmin>} />
          <Route path="/wompi-payment" element={<RestrictAdmin><WompiPaymentSimple /></RestrictAdmin>} />
          <Route path="/wompi-gateway-payment" element={<RestrictAdmin><WompiGatewayPayment /></RestrictAdmin>} />
          <Route path="/payment-success" element={<RestrictAdmin><PaymentSuccess /></RestrictAdmin>} />
          <Route path="/payment-failure" element={<RestrictAdmin><PaymentFailure /></RestrictAdmin>} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/ubicaciones" element={<Locations />} />
          <Route path="/sign-in" element={<Home />} />
          <Route path="/login" element={<Home />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/preguntas-frecuentes" element={<FAQ />} />
          <Route path="/politica-cookies" element={<CookiePolicy />} />
          <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos-condiciones" element={<TermsConditions />} />
          <Route path="/cambios-devoluciones-garantias" element={<ReturnsPolicy />} />
          <Route path="/politica-envios" element={<ShippingPolicy />} />
          <Route path="/envios" element={<ShippingPolicy />} />
          <Route path="/datos-comercio" element={<CommerceData />} />
          <Route path="/admin" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
          <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
          <Route path="/admin/profile" element={<RequireAdmin><AdminProfile /></RequireAdmin>} />
          <Route path="/admin/combos" element={<RequireAdmin><AdminCombos /></RequireAdmin>} />
          <Route path="/admin/combos/:category" element={<RequireAdmin><AdminCombos /></RequireAdmin>} />
          <Route path="/admin/catalog" element={<RequireAdmin><AdminCatalogView /></RequireAdmin>} />
          <Route path="/admin/accessories" element={<RequireAdmin><AdminCatalogView /></RequireAdmin>} />
          <Route path="/admin/page-management" element={<RequireAdmin><AdminPageManagement /></RequireAdmin>} />
        </Routes>
      </main>
      <WhatsappFloatButton />
      {!hideFooter && <Footer />}
      <CookieConsent />
    </div>
  );
}

export default App;
