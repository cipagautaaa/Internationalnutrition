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
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-3 sm:px-6 py-6 overflow-y-auto pointer-events-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Contenedor principal adaptado a imagen vertical/angosta */}
      <div className="relative w-full max-w-sm bg-gradient-to-b from-red-900 via-green-900 to-red-950 rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100vh-2rem)]">
        {/* Decoración navideña */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-red-500"></div>
        <div className="absolute top-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 opacity-50"></div>
        
        {/* Copos de nieve decorativos */}
        <div className="absolute top-4 left-4 text-white/20 animate-pulse">❄</div>
        <div className="absolute top-8 right-8 text-white/30 animate-pulse" style={{animationDelay: '0.5s'}}>❄</div>
        <div className="absolute top-16 left-12 text-white/15 animate-pulse" style={{animationDelay: '1s'}}>✦</div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Imagen de Regalatón */}
        <div className="relative w-full">
          <img
            src={historiaRegalaton}
            alt="Regalatón - Regalos sorpresa por tus compras"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6 text-white space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-red-600 to-green-600 rounded-full text-sm font-bold uppercase tracking-wide">
              <Gift className="w-4 h-4" />
              ¡Regalatón!
            </span>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black leading-tight text-center">
            🎁 ¡Estamos locos de remate! 🎁
          </h2>
          
          <p className="text-white/90 text-sm text-center">
            Desde hoy y hasta fin de año, recibe <strong className="text-yellow-300">REGALOS SORPRESA</strong> por todas tus compras. 
            <span className="block mt-1 text-green-300 font-semibold">¡Entre más grande tu compra, más grande tu regalo!</span>
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleClaimClick}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-5 py-3.5 shadow-lg shadow-yellow-500/30 hover:scale-[1.02] hover:-translate-y-0.5 transition text-sm sm:text-base"
            >
              <Gift className="w-5 h-5" />
              Quiero mi regalo, ¡A COMPRAR!
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full text-sm font-medium text-white/60 hover:text-white transition"
            >
              Ahora no
            </button>
          </div>

          {/* Letra pequeña */}
          <p className="text-[10px] text-white/40 text-center pt-2">
            *Promoción disponible hasta fecha pactada o hasta agotar existencias
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoWelcomeModal;