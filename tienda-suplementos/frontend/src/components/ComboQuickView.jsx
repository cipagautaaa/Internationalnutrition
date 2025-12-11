import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

// Modal ligero para combos (sin variantes)
export default function ComboQuickView({ combo, open, onClose }) {
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) setQuantity(1);
  }, [open]);

  const canAdd = combo && combo.inStock !== false;
  const displayImage = combo?.image || combo?.imageUrl || combo?.cover || combo?.images?.[0] || '';
  const formattedPrice = useMemo(() => formatPrice(combo?.price || 0), [combo?.price]);
  const formattedOriginal = useMemo(
    () => (combo?.originalPrice && combo.originalPrice > combo.price ? formatPrice(combo.originalPrice) : null),
    [combo?.originalPrice, combo?.price]
  );

  const handleAdd = () => {
    if (!canAdd) return;
    addToCart({
      _id: combo._id,
      id: combo._id,
      name: combo.name,
      price: combo.price,
      image: combo.image,
      quantity,
      isCombo: true,
      category: combo.category
    });
    onClose?.();
    openCart();
  };

  const adjustQty = (delta) => {
    setQuantity((q) => {
      const next = q + delta;
      return next < 1 ? 1 : next;
    });
  };

  if (!open || !combo) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-3 sm:px-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-700 via-red-600 to-amber-500" aria-hidden="true" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-0 md:gap-6 p-6 md:p-8">
          <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl border border-gray-100 p-4">
            <div className="w-full aspect-[4/5] max-h-[360px] flex items-center justify-center">
              {displayImage && (
                <img src={displayImage} alt={combo.name} className="object-contain w-full h-full drop-shadow-xl" />
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-700">
                <span>Vista previa</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black leading-tight text-gray-900 line-clamp-2">{combo.name}</h2>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{combo.description}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-black text-gray-900">${formattedPrice}</p>
              {formattedOriginal && (
                <span className="text-sm text-gray-400 line-through">${formattedOriginal}</span>
              )}
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${canAdd ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                {canAdd ? 'Stock listo' : 'Sin stock'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                <button onClick={() => adjustQty(-1)} className="w-10 h-10 flex items-center justify-center text-lg font-semibold hover:bg-gray-100" aria-label="Disminuir">−</button>
                <div className="w-12 text-center font-semibold text-base text-gray-900">{quantity}</div>
                <button onClick={() => adjustQty(1)} className="w-10 h-10 flex items-center justify-center text-lg font-semibold hover:bg-gray-100" aria-label="Aumentar">+</button>
              </div>
              <p className="text-xs text-gray-500">Puedes ajustar luego en el carrito.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className={`flex-1 h-12 rounded-2xl text-sm font-bold tracking-wide uppercase transition ${canAdd ? 'bg-red-700 text-white hover:bg-red-800 shadow-lg hover:-translate-y-0.5' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <ShoppingCart className="w-4 h-4" />
                  Agregar al carrito
                </span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 bg-white"
              >
                Seguir viendo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
