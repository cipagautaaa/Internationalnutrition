import { X, ArrowRight, Gift, Sparkles } from 'lucide-react';
import historiaRegalaton from '../assets/images/HISTORIA REGALATON.png';

const PromoWelcomeModal = ({ open, onClose, onClaim }) => {
  if (!open) return null;

  const handleClaimClick = () => {
    onClose();
    // Scroll a la sección de categorías
    const section = document.getElementById('categories');
    const title = document.getElementById('categories-title');
    const target = title || section;
    if (target) {
      const navbar = document.getElementById('main-navbar');
      let headerOffset = 0;
      if (navbar) {
        const rect = navbar.getBoundingClientRect();
        const styles = getComputedStyle(navbar);
        const topPx = parseFloat(styles.top) || 0;
        headerOffset = rect.height + topPx;
      }
      const desiredGap = 32;
      const y = target.getBoundingClientRect().top + window.scrollY - headerOffset - desiredGap;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center px-3 sm:px-6 py-6 overflow-y-auto pointer-events-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Contenedor principal - Dos columnas como antes */}
      <div className="relative max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 md:h-[520px] max-h-[calc(100vh-2rem)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Columna izquierda - Imagen */}
        <div className="relative h-48 md:h-full min-h-[260px]">
          <img
            src={historiaRegalaton}
            alt="Gran Regalatón de Fin de Año - International Nutrition"
            className="h-full w-full object-cover object-top"
          />
        </div>

        {/* Columna derecha - Información con tema navideño */}
        <div className="bg-gradient-to-br from-red-800 via-red-900 to-green-900 text-white p-6 sm:p-10 flex flex-col justify-between gap-6 relative overflow-hidden">
          {/* Decoración navideña */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400"></div>
          <div className="absolute top-4 right-4 text-white/10 text-4xl">❄</div>
          <div className="absolute bottom-4 left-4 text-white/10 text-3xl">✦</div>
          
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-400/30 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <Gift className="w-4 h-4" />
              ¡REGALATÓN!
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              🎁 ¡Estamos locos de remate!
            </h2>
            <p className="text-white/90 text-sm sm:text-base max-w-md">
              Desde hoy y hasta fin de año, recibe <strong className="text-yellow-300">REGALOS SORPRESA</strong> por todas tus compras.
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3 text-sm text-white/90">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center font-bold text-black">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-yellow-300">¡Entre más compres, más grande tu regalo!</p>
                <p className="text-white/70 text-xs">Mínimo de compra: $70.000</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleClaimClick}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-5 py-3 shadow-lg shadow-yellow-500/30 hover:scale-[1.01] hover:-translate-y-0.5 transition"
              >
                <Gift className="w-5 h-5" />
                ¡Quiero mi regalo, A COMPRAR!
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-full text-sm font-semibold text-white/70 hover:text-white transition"
              >
                Ahora no
              </button>
            </div>
            {/* Letra pequeña */}
            <p className="text-[10px] text-white/40 text-center">
              *Promoción disponible hasta fecha pactada o hasta agotar existencias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoWelcomeModal;