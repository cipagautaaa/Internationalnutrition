import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import logoImg from '../assets/images/Captura_de_pantalla_2025-08-09_192459-removebg-preview.png';
import protenavbarImg from '../assets/images/protenavbar.png';
import prenavbarImg from '../assets/images/prenavbar.png';
import creanavbarImg from '../assets/images/creanavbar.webp';
import aminonavbarImg from '../assets/images/aminonavbar.png';
import multinavbarImg from '../assets/images/multinavbar.png';
import comidanavbar from '../assets/images/comidanavbar.webp';
import panelNosotrosImg from '../assets/images/panelnosotros.jpg';
import sobrenosotrosImg from '../assets/images/fotonosotros.jpg';
import sedesImg from '../assets/images/sedes.png';
import { useCart } from '../context/CartContext'; 
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import MobileNav from './MobileNav';
import { ShoppingCart, Search, User } from 'lucide-react';

// Navbar convertido desde HTML + Tailwind a React, preservando IDs y comportamiento de scroll.
const Header = () => {
  const navbarRef = useRef(null);
  const [solidBg, setSolidBg] = useState(false);
  const { openCart } = useCart();
  const { openSearch, isMobileMenuOpen, openMobileMenu: showMobileMenu, closeMobileMenu } = useUI();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Estado para abrir/cerrar Catálogo con portal a body (evita límite del navbar con transform)
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [nosotrosOpen, setNosotrosOpen] = useState(false);
  const closeTimerRef = useRef(null);
  const nosotrosCloseTimerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const openMobileMenu = (event) => {
    if (event?.type === 'touchstart') {
      event.preventDefault();
    }
    showMobileMenu();
  };

  const handleUserClick = () => {
    if (isAuthenticated) {   
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('main-navbar');
      // const catalogDropdown = document.getElementById('catalog-dropdown');

      const y = window.scrollY || 0;

      if (navbar) {
        if (y > 40) {
          navbar.style.top = '20px';
          // Dropdown del catálogo sigue al navbar: 20px (navbar) + 56px (altura aprox navbar) + 14px margen = 90px
          document.documentElement.style.setProperty('--catalog-top', '90px');
        } else {
          navbar.style.top = '40px';
          // Dropdown del catálogo sigue al navbar: 40px (navbar) + 56px (altura aprox navbar) + 14px margen = 110px
          document.documentElement.style.setProperty('--catalog-top', '110px');
        }
      }

      const scrolled = y > 40;
      setIsScrolled(scrolled);
      document.body.dataset.scrolled = scrolled ? 'true' : 'false';

      // Fondo sólido > 780
      setSolidBg(y > 780);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      delete document.body.dataset.scrolled;
    };
  }, []);

  return (
    <nav
      id="main-navbar"
      ref={navbarRef}
      className="fixed left-1/2 -translate-x-1/2 transform z-50 transition-all duration-300"
      style={{ top: '40px' }}
    >
      <div
        id="navbar-shell"
        className={`backdrop-blur-lg rounded-full flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 transition-all duration-300 transform ${
          solidBg ? 'bg-black/95' : 'bg-black/70'
        } ${isScrolled ? 'px-4 lg:px-12 py-2 scale-95 shadow-xl' : 'px-5 lg:px-16 py-3 scale-100 shadow-2xl'}`}
      >
        {/* Layout móvil */}
        <div className="w-full flex items-center lg:hidden gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openMobileMenu}
              onTouchStart={openMobileMenu}
              className="text-white p-2 rounded-full bg-white/10"
              style={{ touchAction: 'manipulation' }}
              aria-label="Abrir menú"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <button
              type="button"
              onClick={handleUserClick}
              className="text-white p-2 rounded-full bg-white/10"
              aria-label="Perfil"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex items-center justify-center" aria-label="Inicio">
              <img
                src={logoImg}
                alt="INT Suplementos"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openSearch}
              className="text-white p-2 rounded-full bg-white/10"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={openCart}
              className="text-white p-2 rounded-full bg-white/10"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logo desktop */}
        <div className="hidden lg:flex flex-shrink-0">
          <Link to="/" className="flex items-center">
            {/* Si la imagen no existe en el proyecto, el texto seguirá visible */}
            <img
              src={logoImg}
              alt="Logo"
              className="h-10 w-10 object-contain"
              onError={(e) => {
                // Oculta la imagen si no carga para evitar ícono roto
                e.currentTarget.style.display = 'none';
              }}
            />
          </Link>
        </div>

        {/* Enlaces principales */}
        <div className="hidden lg:flex items-center gap-6 font-display">
          <Link to="/" className="text-white font-medium hover:text-red-700 transition-all duration-300 hover:-translate-y-1">
            Inicio
          </Link>

          {/* Dropdown Catálogo (portal al body para ocupar todo el ancho) */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
              setCatalogOpen(true);
            }}
            onMouseLeave={() => {
              // pequeño delay para permitir mover el mouse al panel sin parpadeo
              closeTimerRef.current = setTimeout(() => setCatalogOpen(false), 120);
            }}
          >
            <button className="text-white font-medium flex items-center gap-2 hover:text-red-700 transition-all duration-300 hover:-translate-y-1 font-display">
              Catálogo
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Contenedor dropdown Catálogo en full-width (portal fuera del navbar) */}
            {createPortal(
              <div
                id="catalog-dropdown"
                className={`fixed inset-x-0 z-40 transition-all duration-300 ease-out ${catalogOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                style={{ top: 'var(--catalog-top, 110px)' }}
                onMouseEnter={() => {
                  if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                  setCatalogOpen(true);
                }}
                onMouseLeave={() => setCatalogOpen(false)}
              >
                <div className="bg-black/85 backdrop-blur-xl shadow-2xl catalog-content w-[98vw] mx-auto px-8 py-5 rounded-3xl">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center place-items-center">
                  {/* Proteínas */}
                  <div className="flex flex-col items-center text-center group/item">
                    <Link to="/products/proteinas" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-3">
                      <img src={protenavbarImg} alt="Proteínas" className="w-32 h-32 object-cover" />
                    </Link>
                    <Link to="/products/proteinas" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Proteínas</Link>
                  </div>
                  {/* Pre-entrenos y Quemadores */}
                  <div className="flex flex-col items-center text-center group/item">
                    <Link to="/products/preworkout" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-3">
                      <img src={prenavbarImg} alt="Pre-entrenos y Quemadores" className="w-32 h-32 object-cover" />
                    </Link>
                    <Link to="/products/preworkout" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Pre-entrenos y Quemadores</Link>
                  </div>
                  {/* Creatinas */}
                  <div className="flex flex-col items-center text-center group/item">
                    <Link to="/products/creatina" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-3">
                      <img src={creanavbarImg} alt="Creatinas" className="w-32 h-32 object-cover" />
                    </Link>
                    <Link to="/products/creatina" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Creatinas</Link>
                  </div>
                  {/* Aminoácidos y Recuperadores */}
                  <div className="flex flex-col items-center text-center group/item">
                    <Link to="/products/aminoacidos" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-3">
                      <img src={aminonavbarImg} alt="Aminoácidos y Recuperadores" className="w-32 h-32 object-cover" />
                    </Link>
                    <Link to="/products/aminoacidos" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Aminoácidos y Recuperadores</Link>
                  </div>
                  {/* Salud y Bienestar */}
                  <div className="flex flex-col items-center text-center group/item">
                    <Link to="/products/salud" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-3">
                      <img src={multinavbarImg} alt="Salud y Bienestar" className="w-32 h-32 object-cover" />
                    </Link>
                    <Link to="/products/salud" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Salud y Bienestar</Link>
                  </div>
                  {/* Comidas con proteína */}
                  <div className="flex flex-col items-center text-center group/item">
                    <Link to="/products/comida" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-3">
                      <img src={comidanavbar} alt="Comidas con proteína" className="w-32 h-32 object-cover" />
                    </Link>
                    <Link to="/products/comida" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Comidas con proteína</Link>
                  </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>

          <Link to="/implementos" className="text-white font-medium hover:text-red-700 transition-all duration-300 hover:-translate-y-1">
            Implementos
          </Link>

          <Link to="/combos/volumen" className="text-white font-medium hover:text-red-700 transition-all duration-300 hover:-translate-y-1">
            Volumen
          </Link>

          <Link to="/combos/definicion" className="text-white font-medium hover:text-red-700 transition-all duration-300 hover:-translate-y-1">
            Definición
          </Link>

          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin/products" className="text-white font-medium hover:text-red-700 transition-all duration-300 hover:-translate-y-1">
              Admin
            </Link>
          )}

          {/* Dropdown Nosotros */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (nosotrosCloseTimerRef.current) { clearTimeout(nosotrosCloseTimerRef.current); nosotrosCloseTimerRef.current = null; }
              setNosotrosOpen(true);
            }}
            onMouseLeave={() => {
              nosotrosCloseTimerRef.current = setTimeout(() => setNosotrosOpen(false), 120);
            }}
          >
            <button className="text-white font-medium flex items-center gap-2 hover:text-red-700 transition-all duration-300 hover:-translate-y-1 font-display">
              Nosotros
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Contenedor dropdown Nosotros en full-width (portal fuera del navbar) */}
            {createPortal(
              <div
                id="nosotros-dropdown"
                className={`fixed inset-x-0 z-40 transition-all duration-300 ease-out ${nosotrosOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                style={{ top: 'calc(var(--catalog-top, 110px) - 2px)' }}
                onMouseEnter={() => {
                  if (nosotrosCloseTimerRef.current) { clearTimeout(nosotrosCloseTimerRef.current); nosotrosCloseTimerRef.current = null; }
                  setNosotrosOpen(true);
                }}
                onMouseLeave={() => setNosotrosOpen(false)}
              >
                <div className="bg-black/85 backdrop-blur-xl shadow-2xl catalog-content w-full max-w-7xl mx-auto px-16 py-6 rounded-3xl">
                  <div className="h-4"></div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 justify-items-center place-items-center justify-center">
                    {/* Sobre Nosotros */}
                    <div className="flex flex-col items-center text-center group/item">
                      <Link to="/about" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-2">
                        <img 
                          src={sobrenosotrosImg}
                          alt="Sobre Nosotros" 
                          className="w-32 h-32 object-cover" 
                        />
                      </Link>
                      <Link to="/about" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Sobre Nosotros</Link>
                    </div>
                    
                    {/* Sedes */}
                    <div className="flex flex-col items-center text-center group/item">
                      <Link to="/ubicaciones" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-2">
                        <img 
                          src={sedesImg} 
                          alt="Sedes" 
                          className="w-32 h-32 object-cover" 
                        />
                      </Link>
                      <Link to="/ubicaciones" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Sedes</Link>
                    </div>
                    
                    {/* Contacto */}
                    <div className="flex flex-col items-center text-center group/item">
                      <Link to="/contacto" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-2">
                        <img 
                          src={panelNosotrosImg} 
                          alt="Contacto" 
                          className="w-32 h-32 object-cover" 
                        />
                      </Link>
                      <Link to="/contacto" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Contacto</Link>
                    </div>

                    {/* Preguntas Frecuentes */}
                    <div className="flex flex-col items-center text-center group/item">
                      <Link to="/preguntas-frecuentes" className="block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-2">
                        <img 
                          src={panelNosotrosImg} 
                          alt="Preguntas Frecuentes" 
                          className="w-32 h-32 object-cover" 
                        />
                      </Link>
                      <Link to="/preguntas-frecuentes" className="text-white font-medium hover:text-red-700 transition-colors text-sm">Preguntas Frecuentes</Link>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>

        {/* Iconos de acción */}
        <div className="hidden lg:flex items-center gap-3">
          <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-red-7000/20 hover:scale-110 transition-all duration-300" aria-label="Favoritos">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M178,42c-21,0-39.26,9.47-50,25.34C117.26,51.47,99,42,78,42a60.07,60.07,0,0,0-60,60c0,29.2,18.2,59.59,54.1,90.31a334.68,334.68,0,0,0,53.06,37,6,6,0,0,0,5.68,0,334.68,334.68,0,0,0,53.06-37C219.8,161.59,238,131.2,238,102A60.07,60.07,0,0,0,178,42ZM128,217.11C111.59,207.64,30,157.72,30,102A48.05,48.05,0,0,1,78,54c20.28,0,37.31,10.83,44.45,28.27a6,6,0,0,0,11.1,0C140.69,64.83,157.72,54,178,54a48.05,48.05,0,0,1,48,48C226,157.72,144.41,207.64,128,217.11Z"></path>
            </svg>
          </a>

          <button onClick={handleUserClick} className="rounded-full bg-white/10 p-2 hover:bg-red-7000/20 hover:scale-110 transition-all duration-300" aria-label="Usuario">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M128,128a48,48,0,1,0-48-48A48,48,0,0,0,128,128Zm0,16c-39.7,0-72,32.3-72,72a8,8,0,0,0,8,8H192a8,8,0,0,0,8-8C200,176.3,167.7,144,128,144Z"></path>
            </svg>
          </button>
          <button onClick={openSearch} className="rounded-full bg-white/10 p-2 hover:bg-red-7000/20 hover:scale-110 transition-all duration-300" aria-label="Buscar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M228.24,219.76l-51.38-51.38a86.15,86.15,0,1,0-8.48,8.48l51.38,51.38a6,6,0,0,0,8.48-8.48ZM38,112a74,74,0,1,1,74,74A74.09,74.09,0,0,1,38,112Z"></path>
            </svg>
          </button>

          <button onClick={openCart} id="open-cart" className="rounded-full bg-white/10 p-2 hover:bg-red-7000/20 hover:scale-110 transition-all duration-300" aria-label="Carrito">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42Zm2,158a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2V56a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2ZM174,88a46,46,0,0,1-92,0,6,6,0,0,1,12,0,34,34,0,0,0,68,0,6,6,0,0,1,12,0Z"></path>
            </svg>
          </button>
          {isAuthenticated && (
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-full bg-red-700/80 hover:bg-red-700 text-white shadow transition-colors active:scale-95"
            >
              <span className="leading-none">Salir</span>
            </button>
          )}
        </div>

      </div>
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={() => { logout(); navigate('/'); }}
        onCartClick={openCart}
        onSearchClick={openSearch}
      />
    </nav>
  );
};

export default Header;