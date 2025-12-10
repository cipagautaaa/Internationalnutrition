import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShoppingCart,
  User,
  Search,
  ChevronRight,
  LayoutGrid,
  Wrench,
  Activity,
  Dumbbell,
  Home,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import protenavbarImg from '../assets/images/protenavbar.png';
import prenavbarImg from '../assets/images/prenavbar.png';
import creanavbarImg from '../assets/images/creanavbar.webp';
import aminonavbarImg from '../assets/images/aminonavbar.png';
import multinavbarImg from '../assets/images/multinavbar.png';
import comidanavbar from '../assets/images/comidanavbar.webp';
import sobrenosotrosImg from '../assets/images/fotonosotros.jpg';
import sedesImg from '../assets/images/sedes.png';
import panelNosotrosImg from '../assets/images/panelnosotros.jpg';

const mainMenuItems = [
  {
    key: 'home',
    label: 'Inicio',
    description: 'Ir al inicio',
    to: '/',
    Icon: Home,
  },
  {
    key: 'categories',
    label: 'Categorías',
    description: 'Explora todas las líneas',
    panel: 'categories',
    Icon: LayoutGrid,
  },
  {
    key: 'implements',
    label: 'Wargo y accesorios para gym',
    description: 'Accesorios y equipamiento Wargo',
    to: '/implementos',
    Icon: Wrench,
  },
  {
    key: 'combos-volumen',
    label: 'Combos Volumen',
    description: 'Aumenta masa magra',
    to: '/combos/volumen',
    Icon: Activity,
  },
  {
    key: 'combos-definicion',
    label: 'Combos Definición',
    description: 'Resalta tu musculatura',
    to: '/combos/definicion',
    Icon: Dumbbell,
  },
  {
    key: 'nosotros',
    label: 'Nosotros',
    description: 'Conoce nuestra historia',
    panel: 'nosotros',
    Icon: Users,
  },
];

const categoryItems = [
  {
    label: 'Proteínas',
    description: 'Whey, veganas y más',
    to: '/products/proteinas',
    image: protenavbarImg,
  },
  {
    label: 'Pre-entrenos y Quemadores',
    description: 'Energía y termogénicos',
    to: '/products/preworkout',
    image: prenavbarImg,
  },
  {
    label: 'Creatinas',
    description: 'Fuerza y potencia',
    to: '/products/creatina',
    image: creanavbarImg,
  },
  {
    label: 'Aminoácidos y Recuperadores',
    description: 'Recupera más rápido',
    to: '/products/aminoacidos',
    image: aminonavbarImg,
  },
  {
    label: 'Salud y Bienestar',
    description: 'Multivitamínicos y más',
    to: '/products/salud',
    image: multinavbarImg,
  },
  {
    label: 'Alimentacion saludable y alta en proteina',
    description: 'Snacks funcionales',
    to: '/products/comida',
    image: comidanavbar,
  },
];

const nosotrosItems = [
  {
    label: 'Sobre Nosotros',
    description: 'Nuestra historia y propósito',
    to: '/about',
    image: sobrenosotrosImg,
  },
  {
    label: 'Sedes',
    description: 'Encuentra tu tienda más cercana',
    to: '/ubicaciones',
    image: sedesImg,
  },
  {
    label: 'Contacto',
    description: 'Hablemos por cualquier canal',
    to: '/contacto',
    image: panelNosotrosImg,
  },
  {
    label: 'Preguntas frecuentes',
    description: 'Resolvemos tus dudas',
    to: '/preguntas-frecuentes',
    image: panelNosotrosImg,
  },
];

const MobileNav = ({ isOpen, onClose, isAuthenticated, user, onLogout, onCartClick, onSearchClick }) => {
  const { items: cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePanel, setActivePanel] = useState(null);

  const handleClose = () => {
    setActivePanel(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'manipulation';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActivePanel(null);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) {
      setActivePanel(null);
    }
  }, [isOpen]);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const renderMenuCardContent = (item) => (
    <>
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-[#1b1b1b] flex items-center justify-center text-white">
          <item.Icon className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="text-white font-medium leading-none">{item.label}</p>
          <p className="text-sm text-white/60 mt-1">{item.description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-white/60" />
    </>
  );

    const renderMainMenu = () => (
      <div className="px-5 pb-5 space-y-3 overflow-y-auto flex-1 min-h-0">
      {mainMenuItems.map((item) => {
        const cardClasses =
          'w-full flex items-center justify-between rounded-3xl bg-[#111111] px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-white/5 transition-colors';

        if (item.panel) {
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActivePanel(item.panel)}
              className={`${cardClasses} text-left`}
            >
              {renderMenuCardContent(item)}
            </button>
          );
        }

        return (
          <Link key={item.key} to={item.to} onClick={handleClose} className={cardClasses}>
            {renderMenuCardContent(item)}
          </Link>
        );
      })}
    </div>
  );

  const renderPanel = (items, title, subtitle) => (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 py-4 border-y border-white/10 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActivePanel(null)}
          className="p-2 rounded-full bg-white/10 text-white"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">{subtitle}</p>
          <p className="text-lg font-semibold text-white">{title}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 px-5 py-6 space-y-4">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={handleClose}
            className="flex items-center gap-4 rounded-3xl bg-[#0f0f0f] border border-white/10 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
          >
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
              <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white font-semibold uppercase tracking-wide text-sm">{item.label}</p>
              <p className="text-xs text-white/60 mt-1">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50" />
          </Link>
        ))}
      </div>
    </div>
  );

  const handleTouchStart = (event) => {
    const startX = event.touches[0].clientX;

    const handleTouchMove = (moveEvent) => {
      const diffX = moveEvent.touches[0].clientX - startX;
      if (diffX < -50) {
        handleClose();
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black" />

      <aside
        id="mobile-nav"
        className={`fixed inset-0 left-0 w-full min-h-screen max-h-screen bg-black text-white transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
      >
        <header
          className="px-5 flex items-center justify-between"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 16px) + 12px)', paddingBottom: '18px' }}
        >
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/10 text-white"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onSearchClick();
                handleClose();
              }}
              className="p-2 rounded-full bg-white/10"
              aria-label="Buscar"
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={() => {
                onCartClick();
                handleClose();
              }}
              className="p-2 rounded-full bg-white/10 relative"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-600 text-[11px] text-white flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {activePanel === 'categories' && renderPanel(categoryItems, 'Categorías', 'Explora todo')}
        {activePanel === 'nosotros' && renderPanel(nosotrosItems, 'Nosotros', 'Conecta')}
        {!activePanel && renderMainMenu()}

        <div className="border-t border-white/10 px-10 pb-10 pt-4 text-sm">
          <div className="flex items-center justify-between text-white/90">
            <button
              onClick={() => {
                onSearchClick();
                handleClose();
              }}
              className="flex flex-col items-center gap-1"
            >
              <Search className="w-5 h-5" />
              <span className="text-xs">Buscar</span>
            </button>
            <button
              onClick={() => {
                onCartClick();
                handleClose();
              }}
              className="flex flex-col items-center gap-1"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">Carrito</span>
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  onLogout();
                  navigate('/');
                  handleClose();
                }}
                className="flex flex-col items-center gap-1"
              >
                <User className="w-5 h-5" />
                <span className="text-xs">Salir</span>
              </button>
            ) : (
              <Link to="/login" onClick={handleClose} className="flex flex-col items-center gap-1">
                <User className="w-5 h-5" />
                <span className="text-xs">Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default MobileNav;
