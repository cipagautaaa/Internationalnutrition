import { X, ArrowRight, Zap, Target } from 'lucide-react';
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 sm:px-6 py-6 overflow-y-auto pointer-events-auto">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* Contenedor principal */}
      <div className="relative max-w-lg w-full bg-slate-900/95 rounded-2xl shadow-2xl overflow-hidden border border-slate-700/60">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Línea superior */}
        <div className="absolute top-0 left-0 w-full h-px bg-slate-700/60"></div>

        {/* Contenido */}
        <div className="relative p-6 sm:p-8 text-center">
          {/* Ícono principal */}
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full border border-slate-700/70 bg-slate-800/60">
            <Target className="w-8 h-8 text-slate-200" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-semibold text-slate-300 mb-4 uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            Nueva promoción
          </div>

          {/* Título */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
            Llegó la
            <span className="block text-red-500">Ruleta Anabólica</span>
          </h2>

          {/* Descripción */}
          <p className="text-slate-300 text-base sm:text-lg mb-6 max-w-md mx-auto">
            Participa por la oportunidad de ganar
            <span className="text-white font-semibold"> descuentos</span>,
            <span className="text-white font-semibold"> regalos sorpresa</span> y
            <span className="text-white font-semibold"> suplementos gratis</span>.
          </p>

          {/* Premios disponibles */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-slate-800/70 text-slate-300 text-xs font-semibold rounded-full border border-slate-700/60">
              5% - 20%
            </span>
            <span className="px-3 py-1 bg-slate-800/70 text-slate-300 text-xs font-semibold rounded-full border border-slate-700/60">
              Regalos sorpresa
            </span>
            <span className="px-3 py-1 bg-slate-800/70 text-slate-300 text-xs font-semibold rounded-full border border-slate-700/60">
              Suplementos gratis
            </span>
          </div>

          {/* Beneficios */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Zap className="w-4 h-4 text-red-500" />
              <span>Premios reales en cada giro</span>
            </div>
          </div>

          {/* CTA Principal */}
          <button
            onClick={handlePlayClick}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white font-semibold text-base sm:text-lg px-6 py-3.5 shadow-lg shadow-black/30 hover:bg-red-700 transition"
          >
            <Target className="w-5 h-5" />
            Quiero probar suerte
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Nota de autenticación */}
          {!isAuthenticated && (
            <p className="text-xs text-slate-500 mt-3">
              * Necesitas una cuenta para participar y guardar tu premio
            </p>
          )}

          {/* Botón secundario */}
          <button
            onClick={onClose}
            className="w-full mt-3 text-sm font-semibold text-slate-400 hover:text-slate-200 transition py-2"
          >
            Ahora no
          </button>

          {/* Términos */}
          <p className="text-[10px] text-slate-600 mt-4">
            *Aplican términos y condiciones. Promoción válida hasta agotar existencias. Un premio por compra realizada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoWelcomeModal;