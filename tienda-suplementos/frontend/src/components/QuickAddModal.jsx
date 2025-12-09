import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';

// Props: product (obj), open (bool), onClose(), initialVariantId (string|null)
export default function QuickAddModal({ product, open, onClose, initialVariantId = null }) {
  const { addToCart, openCart } = useCart();
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Recalcular opciones cuando cambia producto
  const sizeOptions = useMemo(() => {
    if (!product) return [];
    const opts = [];
    const variantsList = Array.isArray(product.variants) ? product.variants : [];
    const baseSizeLabel = product.size || (variantsList.length === 0 ? 'Único' : 'Principal');

    if (baseSizeLabel) {
      opts.push({
        _id: product._id,
        optionId: 'BASE',
        size: baseSizeLabel,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        inStock: product.inStock !== false,
        __isBase: true
      });
    }

    if (variantsList.length) {
      variantsList.forEach(v => {
        if (v && v.size) {
          opts.push({
            ...v,
            optionId: String(v._id || v.id),
            inStock: v.inStock !== false
          });
        }
      });
    }
    return opts;
  }, [product]);

  const flavors = useMemo(() => Array.isArray(product?.flavors) ? product.flavors : [], [product]);
  const normalizedInitialId = useMemo(
    () => (initialVariantId !== null && initialVariantId !== undefined ? String(initialVariantId) : null),
    [initialVariantId]
  );

  useEffect(() => {
    if (open && product) {
      const firstAvailable = sizeOptions.find(opt => opt.inStock !== false) || sizeOptions[0] || null;
      let nextId = firstAvailable ? firstAvailable.optionId || String(firstAvailable._id) : null;
      if (normalizedInitialId) {
        const match = sizeOptions.find(opt => {
          const currentId = opt.optionId || String(opt._id);
          return currentId === normalizedInitialId;
        });
        if (match) {
          nextId = match.optionId || String(match._id);
        }
      }
      setSelectedSizeId(nextId);
      setSelectedFlavor(flavors.length ? flavors[0] : null);
      setQuantity(1);
    }
  }, [open, product, sizeOptions, flavors, normalizedInitialId]);

  const selectedSize = useMemo(() => {
    if (!sizeOptions.length) return null;
    return sizeOptions.find(o => (o.optionId || String(o._id)) === selectedSizeId) || sizeOptions[0];
  }, [sizeOptions, selectedSizeId]);

  const displayPrice = selectedSize ? selectedSize.price : product?.price;
  const displayImage = selectedSize && selectedSize.image ? selectedSize.image : product?.image;
  const canAdd = product && product.isActive !== false && (selectedSize ? selectedSize.inStock !== false : product.inStock !== false);

  const adjustQty = (d) => {
    setQuantity(q => {
      let next = q + d;
      if (next < 1) next = 1;
      return next;
    });
  };

  const handleAdd = () => {
    if (!canAdd) return;
    const resolvedOriginalPrice = selectedSize?.originalPrice ?? product.originalPrice ?? null;
    addToCart({
      ...product,
      price: displayPrice,
      originalPrice: resolvedOriginalPrice,
      image: displayImage,
      variantId: selectedSize && !selectedSize.__isBase ? selectedSize._id : null,
      size: selectedSize ? selectedSize.size : (product.size || null),
      flavor: selectedFlavor,
      quantity
    });
    onClose?.();
    openCart();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white/98 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-700 via-red-600 to-amber-500" aria-hidden="true" />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-0 md:gap-6 p-6 md:p-8">
          <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl border border-gray-100 p-4">
            <div className="w-full aspect-[4/5] max-h-[360px] flex items-center justify-center">
              {displayImage && <img src={displayImage} alt={product?.name} className="object-contain w-full h-full drop-shadow-xl" />}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-700">
                  <span>Vista previa</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black leading-tight text-gray-900 line-clamp-2">{product?.name}</h2>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{product?.description}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-black text-gray-900">${displayPrice}</p>
              {product?.originalPrice && product.originalPrice > displayPrice && (
                <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
              )}
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${canAdd ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                {canAdd ? 'Stock listo' : 'Sin stock'}
              </span>
            </div>

            {sizeOptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-600 tracking-[0.08em]">TAMAÑO</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(o => {
                    const optionId = o.optionId || String(o._id);
                    const active = optionId === selectedSizeId;
                    const disabled = o.inStock === false;
                    return (
                      <button
                        key={optionId}
                        disabled={disabled}
                        onClick={() => setSelectedSizeId(optionId)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {o.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {flavors.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-600 tracking-[0.08em]">SABOR</p>
                <div className="flex flex-wrap gap-2">
                  {flavors.map(f => {
                    const active = f === selectedFlavor;
                    return (
                      <button
                        key={f}
                        onClick={() => setSelectedFlavor(f)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500'}`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                Agregar al carrito
              </button>
              <button
                onClick={onClose}
                className="h-12 px-6 rounded-2xl text-sm font-semibold tracking-wide border border-gray-300 hover:bg-gray-50 text-gray-800"
              >Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
