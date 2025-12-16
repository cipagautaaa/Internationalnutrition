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
        fixed bottom-6 left-6 z-[100]
        flex items-center gap-2
        bg-gradient-to-r from-red-600 to-red-700
        text-white font-bold text-sm
        px-4 py-3 rounded-full
        shadow-lg shadow-red-600/40
        transition-all duration-300
        hover:scale-105 hover:shadow-xl hover:shadow-red-600/50
        animate-bounce-slow
      `}
      style={{
        animation: isHovered ? 'none' : 'bounce-gentle 2s ease-in-out infinite',
      }}
      aria-label="Obtener descuento del 20%"
    >
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
        <Percent className="w-4 h-4" />
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
