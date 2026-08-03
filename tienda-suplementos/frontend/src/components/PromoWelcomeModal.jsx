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
      <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col sm:flex-row">
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
          className="w-full h-auto block sm:w-2/5 sm:h-auto sm:object-cover"
        />

        <div className="p-6 sm:p-7 sm:w-3/5 flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            La Creatina Platinum queda en $120.000 comprando cualquiera de los 5 combos del mes
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Logramos algo impensable: la creatina Platinum a un precio irrepetible comprando alguno de nuestros nuevos combos de creatina y proteína, así que queda en $120.000 sin importar qué proteína elijas, algo que no vas a conseguir comprándola por separado.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-4">
            Disponible solo en los combos del mes y mientras haya unidades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoWelcomeModal;
