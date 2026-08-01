import { X } from 'lucide-react';
import promoPlatinumImg from '../assets/images/PROMO PLATINUM  (1).png';

/**
 * PromoWelcomeModal - Banner informativo de bienvenida
 *
 * Aparece a los 5 segundos de entrar al sitio. Es puramente informativo:
 * muestra la promoción Platinum y solo puede cerrarse (sin CTA ni redirección).
 */
const PromoWelcomeModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 sm:px-6 py-6 overflow-y-auto pointer-events-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Contenedor principal */}
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white bg-black/40 hover:bg-black/60 rounded-full transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <img
          src={promoPlatinumImg}
          alt="Promoción Platinum"
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
};

export default PromoWelcomeModal;
