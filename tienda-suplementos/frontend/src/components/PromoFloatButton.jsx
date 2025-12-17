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
        fixed left-3 md:left-6 z-30
        flex items-center gap-1.5 md:gap-2
        bg-gradient-to-r from-red-600 to-red-700
        text-white font-bold text-[11px] md:text-sm
        px-3 py-2 md:px-4 md:py-2.5 rounded-full
        shadow-md shadow-red-600/25
        transition-all duration-300
        hover:scale-105 hover:shadow-xl hover:shadow-red-600/40
        animate-bounce-slow
      `}
      style={{
        animation: isHovered ? 'none' : 'bounce-gentle 2s ease-in-out infinite',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(8px, 3vw, 18px))',
      }}
      aria-label="Obtener descuento del 20%"
    >
      <div className="w-6 h-6 md:w-7 md:h-7 bg-white/20 rounded-full flex items-center justify-center">
        <Percent className="w-3 h-3 md:w-3.5 md:h-3.5" />
      </div>
      <span className="uppercase tracking-wide">Ahorra 20%</span>
      
      {/* Estilo para animación suave */}
      <style>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
      `}</style>
    </button>
  );
};

export default PromoFloatButton;
