import { useState } from 'react';
import { Percent } from 'lucide-react';

/**
 * Botón flotante "Ahorra 20%" que aparece en la esquina inferior izquierda
 * Solo se muestra si el usuario no está autenticado y ha cerrado el modal de promo
 */
const PromoFloatButton = ({ onClick, show }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!show) return null;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed left-4 md:left-6 z-30
        flex items-center gap-2
        bg-gradient-to-r from-red-600 to-red-700
        text-white font-bold text-xs md:text-sm
        px-3 py-2.5 md:px-4 md:py-3 rounded-full
        shadow-lg shadow-red-600/30
        transition-all duration-300
        hover:scale-105 hover:shadow-xl hover:shadow-red-600/40
        animate-bounce-slow
      `}
      style={{
        animation: isHovered ? 'none' : 'bounce-gentle 2s ease-in-out infinite',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(18px, 4vw, 36px))',
      }}
      aria-label="Obtener descuento del 20%"
    >
      <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center">
        <Percent className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </div>
      <span className="uppercase tracking-wide">Ahorra 20%</span>
      
      {/* Estilo para animación suave */}
      <style>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </button>
  );
};

export default PromoFloatButton;
