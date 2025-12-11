import { X, ArrowRight, Gift } from 'lucide-react';
import fotolocal from '../assets/images/fotolocal.png';

const PromoWelcomeModal = ({ open, onClose, onClaim }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center px-3 sm:px-6 py-6 overflow-y-auto pointer-events-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 md:h-[520px] max-h-[calc(100vh-2rem)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-48 md:h-full min-h-[260px]">
          <img
            src={fotolocal}
            alt="Compra con descuento en International Nutrition"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 sm:p-10 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-semibold">
              <Gift className="w-4 h-4" />
              Bienvenida exclusiva
            </div>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              Disfruta de un 20% de descuento en tu primera compra
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-md">
              Activa tu beneficio y te llevamos directo al registro. Solo para nuevas cuentas sin sesión iniciada.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-white/80">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-semibold">
                20%
              </div>
              <div>
                <p className="font-semibold text-white">Código exclusivo</p>
                <p className="text-white/70">Se revela solo después de crear tu cuenta.</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={onClaim}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold px-5 py-3 shadow-lg shadow-red-600/20 hover:scale-[1.01] hover:-translate-y-0.5 transition"
              >
                Dame mi descuento
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-full text-sm font-semibold text-white/70 hover:text-white transition"
              >
                No gracias
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoWelcomeModal;