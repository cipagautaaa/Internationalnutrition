import { useState, useEffect } from 'react';
import { Target, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

/**
 * Botón flotante "Ruleta Anabólica" que aparece en la esquina inferior izquierda
 * Muestra estado diferente según si el usuario tiene premio pendiente o no
 */
const PromoFloatButton = ({ onClick, show }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();
  const [hasPrize, setHasPrize] = useState(false);

  // Verificar si el usuario tiene un premio pendiente
  useEffect(() => {
    if (isAuthenticated && show) {
      checkWheelStatus();
    }
  }, [isAuthenticated, show]);

  const checkWheelStatus = async () => {
    try {
      const { data } = await axios.get('/wheel/status');
      if (data.data?.prizePending && data.data.prizePending !== 'NONE') {
        setHasPrize(true);
      } else {
        setHasPrize(false);
      }
    } catch {
      // Silenciosamente fallar - el usuario simplemente verá el botón normal
      console.log('No se pudo verificar estado de ruleta');
    }
  };

  if (!show) return null;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed left-3 md:left-6 z-30
        flex items-center gap-1.5 md:gap-2
        ${hasPrize 
          ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
          : 'bg-gradient-to-r from-red-600 to-orange-600'
        }
        text-white font-bold text-[11px] md:text-sm
        px-3 py-2 md:px-4 md:py-2.5 rounded-full
        shadow-md ${hasPrize ? 'shadow-yellow-500/25' : 'shadow-red-600/25'}
        transition-all duration-300
        hover:scale-105 hover:shadow-xl ${hasPrize ? 'hover:shadow-yellow-500/40' : 'hover:shadow-red-600/40'}
        animate-bounce-slow
      `}
      style={{
        animation: isHovered ? 'none' : 'bounce-gentle 2s ease-in-out infinite',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(8px, 3vw, 18px))',
      }}
      aria-label={hasPrize ? 'Ver tu premio' : 'Jugar Ruleta Anabólica'}
    >
      <div className="w-6 h-6 md:w-7 md:h-7 bg-white/20 rounded-full flex items-center justify-center">
        {hasPrize ? (
          <Trophy className="w-3 h-3 md:w-3.5 md:h-3.5" />
        ) : (
          <Target className="w-3 h-3 md:w-3.5 md:h-3.5" />
        )}
      </div>
      <span className="uppercase tracking-wide">
        {hasPrize ? '¡Tienes un premio!' : 'Ruleta Anabólica'}
      </span>
      
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
