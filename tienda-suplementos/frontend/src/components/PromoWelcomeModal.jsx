import { X, ArrowRight, Zap, Trophy, Target } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PromoWelcomeModal - Modal de bienvenida para la Ruleta Anabólica
 * 
 * Aparece a los 5 segundos de entrar al sitio.
 * - Si el usuario NO está logueado: redirige a registro/login
 * - Si el usuario está logueado: abre la ruleta directamente
 */
const PromoWelcomeModal = ({ open, onClose, onOpenWheel }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!open) return null;

  const handlePlayClick = () => {
    onClose();
    
    if (isAuthenticated) {
      // Usuario logueado: abrir la ruleta
      if (onOpenWheel) {
        onOpenWheel();
      }
    } else {
      // Usuario no logueado: redirigir a registro
      navigate('/sign-in', { 
        state: { 
          from: location.pathname,
          openWheel: true // Flag para abrir ruleta después de login
        } 
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-3 sm:px-6 py-6 overflow-y-auto pointer-events-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Contenedor principal */}
      <div className="relative max-w-lg w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl overflow-hidden border border-red-600/20">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decoración superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
        
        {/* Efectos de fondo */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>

        {/* Contenido */}
        <div className="relative p-6 sm:p-8 text-center">
          {/* Ícono principal */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-red-600 to-orange-600 rounded-full shadow-lg shadow-red-600/30">
            <Target className="w-10 h-10 text-white" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-full text-sm font-bold text-red-400 mb-4">
            <Zap className="w-4 h-4" />
            ¡NUEVA PROMOCIÓN!
          </div>

          {/* Título */}
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            ¡LLEGÓ LA<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              RULETA ANABÓLICA!
            </span>
          </h2>

          {/* Descripción */}
          <p className="text-gray-300 text-base sm:text-lg mb-6 max-w-md mx-auto">
            ¡Participa por la oportunidad de ganar{' '}
            <span className="text-red-400 font-semibold">impresionantes descuentos</span>,{' '}
            <span className="text-orange-400 font-semibold">regalos sorpresa</span> y{' '}
            <span className="text-yellow-400 font-semibold">suplementos gratis</span>!
          </p>

          {/* Premios disponibles */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
              5% - 20% OFF
            </span>
            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/30">
              Regalos Sorpresa
            </span>
            <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30">
              Suplementos Gratis
            </span>
          </div>

          {/* Beneficios */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>2 oportunidades para ganar</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Zap className="w-4 h-4 text-red-500" />
              <span>Premios reales en cada giro</span>
            </div>
          </div>

          {/* CTA Principal */}
          <button
            onClick={handlePlayClick}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-lg px-6 py-4 shadow-lg shadow-red-600/30 hover:from-red-700 hover:to-orange-700 hover:scale-[1.02] hover:-translate-y-0.5 transition-all uppercase tracking-wide"
          >
            <Target className="w-5 h-5" />
            Quiero probar suerte
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Nota de autenticación */}
          {!isAuthenticated && (
            <p className="text-xs text-gray-500 mt-3">
              * Necesitas una cuenta para participar y guardar tu premio
            </p>
          )}

          {/* Botón secundario */}
          <button
            onClick={onClose}
            className="w-full mt-3 text-sm font-semibold text-gray-500 hover:text-gray-300 transition py-2"
          >
            Ahora no
          </button>

          {/* Términos */}
          <p className="text-[10px] text-gray-600 mt-4">
            *Promoción válida hasta agotar existencias. Un premio por compra realizada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoWelcomeModal;