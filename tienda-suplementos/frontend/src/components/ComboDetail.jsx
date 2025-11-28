import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Gift, ShieldCheck, Truck, Clock, Check, BadgePercent } from 'lucide-react';
import axios from '../utils/axios';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

const gradientPanel = 'bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-[0_20px_70px_rgba(3,4,16,0.65)]';

const infoRows = [
  {
    title: '¿Cuánto tarda el envío?',
    description: 'Colombia: 24 a 72 horas hábiles con guía rastreable.',
    icon: Truck,
  },
  {
    title: '¿Listos para consumir?',
    description: 'Incluimos guía rápida y recomendación de uso por objetivo.',
    icon: Check,
  },
  {
    title: 'Garantía y autenticidad',
    description: 'Sellos intactos, trazabilidad y soporte de nutrición.',
    icon: ShieldCheck,
  },
  {
    title: 'Asesoramiento personalizado',
    description: 'Whatsapp directo con especialistas que usan los combos.',
    icon: Gift,
  },
];

export default function ComboDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let alive = true;
    const fetchCombo = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`/combos/${id}`);
        if (!alive) return;
        setCombo(data);
        setQuantity(1);
      } catch (err) {
        if (!alive) return;
        setError(err.response?.data?.message || 'No pudimos cargar este combo');
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchCombo();
    return () => {
      alive = false;
    };
  }, [id]);

  const includedProducts = useMemo(() => {
    if (!Array.isArray(combo?.products)) return [];
    return combo.products.map((item, index) => {
      const ref = item?.productId;
      return {
        id: ref?._id || `${combo?._id}-product-${index}`,
        name: ref?.name || 'Producto del combo',
        brand: ref?.brand || ref?.category || combo?.category,
        size: ref?.size || ref?.baseSize,
        quantity: item?.quantity || 1,
      };
    });
  }, [combo]);

  const adjustQuantity = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      return next < 1 ? 1 : next;
    });
  };

  const isAvailable = combo?.inStock !== false;

  const handleAddToCart = () => {
    if (!combo || !isAvailable) return;
    addToCart({
      id: `combo-${combo._id}`,
      comboId: combo._id,
      _id: combo._id,
      name: combo.name,
      price: combo.price,
      image: combo.image,
      quantity,
      isCombo: true,
      category: combo.category,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
        <p className="text-sm text-white/60">Cargando combo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold">{error}</p>
        <Link to="/combos/volumen" className="underline text-white/70">
          Volver al catálogo de combos
        </Link>
      </div>
    );
  }

  if (!combo) {
    return null;
  }

  const formattedPrice = `$${formatPrice(combo.price || 0)}`;
  const formattedOriginal = combo.originalPrice ? `$${formatPrice(combo.originalPrice)}` : null;
  const savings = combo.originalPrice && combo.originalPrice > combo.price
    ? combo.originalPrice - combo.price
    : null;

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-10 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.35em] text-white/60">
          <span>Combos {combo.category}</span>
          <span>+1.500 envíos realizados en Colombia</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
          {/* Imagen y extras */}
          <div className="space-y-6">
            <div className={`${gradientPanel} p-6`}> 
              <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl h-[520px] flex items-center justify-center">
                <img
                  src={combo.image}
                  alt={combo.name}
                  className="max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>

            <div className={`${gradientPanel} p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <Gift className="w-8 h-8 text-amber-300" />
                <div>
                  <p className="text-sm font-semibold">Incluye regalo exclusivo</p>
                  <p className="text-xs text-white/60">Por compras superiores a 1 unidad</p>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                {combo.description}
              </p>
            </div>

            {includedProducts.length > 0 && (
              <div className={`${gradientPanel} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">Lo que incluye el combo</h3>
                  <BadgePercent className="w-5 h-5 text-white/60" />
                </div>
                <div className="space-y-4">
                  {includedProducts.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-white/60">{item.brand}{item.size ? ` · ${item.size}` : ''}</p>
                      </div>
                      <span className="text-xs text-white/60">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Información */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] tracking-[0.3em] uppercase text-white/70">
                <Clock className="w-4 h-4" />
                <span>Entrenamientos extremos</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight">{combo.name}</h1>
              <p className="text-sm text-white/70">Diseñado para potenciar tu periodo de {combo.category?.toLowerCase()} con ingredientes reales y soporte 1:1.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white">{formattedPrice}</span>
                {formattedOriginal && (
                  <span className="text-base text-white/40 line-through">{formattedOriginal}</span>
                )}
              </div>
              {savings && (
                <p className="text-sm text-emerald-300 font-semibold">
                  Ahorra ${formatPrice(savings)} pesos
                </p>
              )}
              <p className="text-xs text-white/60">Impuestos incluidos · Envío gratis desde $0</p>
            </div>

            <div className={`${gradientPanel} p-4 flex items-center gap-4`}>
              <div className="w-14 h-14 rounded-2xl bg-amber-300/15 flex items-center justify-center text-amber-200 text-2xl">🎁</div>
              <div>
                <p className="text-sm font-semibold">Llévate un shaker y asesoría gratis</p>
                <p className="text-xs text-white/60">Aplican compras antes de las 6:00 p.m.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <button onClick={() => adjustQuantity(-1)} className="w-11 h-11 text-xl font-bold hover:bg-white/5" aria-label="Reducir">
                  −
                </button>
                <div className="w-14 text-center font-semibold">{quantity}</div>
                <button onClick={() => adjustQuantity(1)} className="w-11 h-11 text-xl font-bold hover:bg-white/5" aria-label="Aumentar">
                  +
                </button>
              </div>
              <p className="text-xs text-white/60">Cantidad</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`flex-1 h-14 rounded-2xl text-sm font-black tracking-wide uppercase shadow-lg transition-all ${
                  isAvailable
                    ? 'bg-[#FF8B1A] text-black hover:translate-y-[1px]'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                Agregar al carrito — {formattedPrice}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!isAvailable}
                className={`flex-1 h-14 rounded-2xl text-sm font-semibold uppercase border border-white/40 shadow-inner transition-all ${
                  isAvailable ? 'bg-white text-black hover:bg-white/90' : 'bg-white/5 text-white/40 cursor-not-allowed'
                }`}
              >
                Comprar ahora
              </button>
            </div>

            <div className="grid gap-3">
              <div className={`${gradientPanel} p-4 flex items-center justify-between`}>
                <div>
                  <p className="text-xs text-white/50">Entrega aproximada</p>
                  <p className="text-sm font-semibold">Nov 29 - Dic 02</p>
                </div>
                <Truck className="w-5 h-5 text-white/60" />
              </div>
              {infoRows.map((row) => (
                <div key={row.title} className={`${gradientPanel} p-4 flex items-center justify-between`}>
                  <div>
                    <p className="text-sm font-semibold">{row.title}</p>
                    <p className="text-xs text-white/60">{row.description}</p>
                  </div>
                  <row.icon className="w-5 h-5 text-white/60" />
                </div>
              ))}
            </div>

            <div className="text-center text-xs text-white/40 pt-4">
              <p>¿Necesitas ayuda eligiendo tu combo? Escríbenos al WhatsApp flotante.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
