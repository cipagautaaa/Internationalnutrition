import { X, ArrowRight, Gift } from 'lucide-react';

const PromoWelcomeModal = ({ open, onClose, onClaim }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 sm:px-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-semibold">
              <Gift className="w-4 h-4" />
              Bienvenida exclusiva
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Disfruta de un 20% de descuento en tu primera compra
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-md">
              Activa tu beneficio y te llevamos directo al registro. Solo para nuevas cuentas sin sesión iniciada.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-white/80">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-semibold">
              20%
            </div>
            <div>
              <p className="font-semibold text-white">Código: INTSUPPS20</p>
              <p className="text-white/70">Lo verás al terminar tu registro.</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-6 bg-white">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-red-600 uppercase tracking-[0.18em]">Oferta limitada</p>
            <p className="text-lg text-gray-700">Solo para quienes aún no han creado su cuenta.</p>
          </div>

          <ul className="space-y-3 text-gray-700 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-block w-2 h-2 rounded-full bg-red-600" aria-hidden="true" />
              <span>Entrega rápida y pagos seguros con Mercado Pago.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-block w-2 h-2 rounded-full bg-red-600" aria-hidden="true" />
              <span>Productos originales con garantía de satisfacción.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-block w-2 h-2 rounded-full bg-red-600" aria-hidden="true" />
              <span>Acceso inmediato al código INTSUPPS20 tras registrarte.</span>
            </li>
          </ul>

          <div className="space-y-3">
            <button
              onClick={onClaim}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-black text-white font-semibold px-5 py-3.5 shadow-lg shadow-red-600/20 hover:scale-[1.01] hover:-translate-y-0.5 transition"
            >
              Dame mi descuento
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full text-sm font-semibold text-gray-500 hover:text-gray-700 transition"
            >
              No gracias
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoWelcomeModal;