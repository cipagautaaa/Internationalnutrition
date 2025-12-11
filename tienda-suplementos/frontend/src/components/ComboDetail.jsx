import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Gift, ShieldCheck, Truck, Clock, Check, BadgePercent } from 'lucide-react';
import axios from '../utils/axios';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

const gradientPanel = 'bg-white border border-gray-200 rounded-3xl shadow-lg';

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
  const { addToCart, openCart } = useCart();

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
    openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">Cargando combo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold text-gray-900">{error}</p>
        <Link to="/combos/volumen" className="underline text-red-700 hover:text-red-800">
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

  const priceStack = (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-black text-gray-900">{formattedPrice}</span>
        {formattedOriginal && <span className="text-base text-gray-400 line-through">{formattedOriginal}</span>}
      </div>
      {savings && <p className="text-sm text-emerald-600 font-semibold">Ahorra ${formatPrice(savings)} pesos</p>}
      <p className="text-xs text-gray-600">Impuestos incluidos · Envío gratis desde $0</p>
    </div>
  );

  const quantitySelector = (
    <div className="flex items-center gap-4">
      <div className="flex items-center rounded-full bg-white border border-gray-300 overflow-hidden">
        <button onClick={() => adjustQuantity(-1)} className="w-11 h-11 text-xl font-bold text-gray-700 hover:bg-gray-100" aria-label="Reducir">
          −
        </button>
        <div className="w-14 text-center font-semibold text-gray-900">{quantity}</div>
        <button onClick={() => adjustQuantity(1)} className="w-11 h-11 text-xl font-bold text-gray-700 hover:bg-gray-100" aria-label="Aumentar">
          +
        </button>
      </div>
      <p className="text-xs text-gray-600">Cantidad</p>
    </div>
  );

  const actionButtons = (
    <div className="flex flex-col sm:flex-row gap-4 pt-2">
      <button
        onClick={handleAddToCart}
        disabled={!isAvailable}
        className={`flex-1 h-14 rounded-2xl text-sm font-black tracking-wide uppercase shadow-lg transition-all ${
          isAvailable ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Agregar al carrito — {formattedPrice}
      </button>
      <button
        onClick={handleBuyNow}
        disabled={!isAvailable}
        className={`flex-1 h-14 rounded-2xl text-sm font-semibold uppercase border-2 border-gray-900 shadow-inner transition-all ${
          isAvailable ? 'bg-white text-gray-900 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Comprar ahora
      </button>
    </div>
  );

  const bonusPanel = (
    <div className={`${gradientPanel} p-4 flex items-center gap-4`}>
      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 text-2xl">🎁</div>
      <div>
        <p className="text-sm font-semibold text-gray-900">Llévate un shaker y asesoría gratis</p>
        <p className="text-xs text-gray-600">Aplican compras antes de las 6:00 p.m.</p>
      </div>
    </div>
  );

  const descriptionPanel = (
    <div className={`${gradientPanel} p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <Gift className="w-8 h-8 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Incluye regalo exclusivo</p>
          <p className="text-xs text-gray-600">Por compras superiores a 1 unidad</p>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">
        {combo.description}
      </p>
    </div>
  );

  const includedProductsPanel = includedProducts.length > 0 && (
    <div className={`${gradientPanel} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Lo que incluye el combo</h3>
        <BadgePercent className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {includedProducts.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
            <div>
              <p className="font-semibold text-sm text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-600">{item.brand}{item.size ? ` · ${item.size}` : ''}</p>
            </div>
            <span className="text-xs text-gray-600">x{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInfoCards = (wrapperClass) => (
    <div className={wrapperClass}>
      <div className={`${gradientPanel} p-4 flex items-center justify-between`}>
        <div>
          <p className="text-xs text-gray-500">Entrega aproximada</p>
          <p className="text-sm font-semibold text-gray-900">Nov 29 - Dic 02</p>
        </div>
        <Truck className="w-5 h-5 text-gray-400" />
      </div>
      {infoRows.map((row) => (
        <div key={row.title} className={`${gradientPanel} p-4 flex items-center justify-between`}>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.title}</p>
            <p className="text-xs text-gray-600">{row.description}</p>
          </div>
          <row.icon className="w-5 h-5 text-gray-400" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden">
        <div className="max-w-xl mx-auto px-4 pt-28 pb-32 space-y-6">
          <div className="rounded-[32px] border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-10 flex items-center justify-center">
              <img src={combo.image} alt={combo.name} className="max-h-[360px] object-contain drop-shadow-2xl" />
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-gray-500">
                <span>Combos {combo.category}</span>
                <span>+1.500 envíos</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900">{combo.name}</h1>
              <p className="text-sm text-gray-600">Diseñado para potenciar tu periodo de {combo.category?.toLowerCase()}.</p>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                {priceStack}
              </div>
            </div>
          </div>

          {descriptionPanel}
          <div className="rounded-3xl bg-white border border-gray-200 p-5 space-y-5 shadow-lg">
            {quantitySelector}
            {bonusPanel}
          </div>
          {includedProductsPanel}
          {renderInfoCards('space-y-3')}
          <div className="text-center text-xs text-gray-500">
            <p>¿Necesitas ayuda eligiendo tu combo? Escríbenos al WhatsApp flotante.</p>
          </div>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3 space-y-3 shadow-[0_-10px_35px_rgba(0,0,0,0.08)]">
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`w-full h-12 rounded-2xl text-sm font-black uppercase tracking-wide ${
              isAvailable ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            Agregar al carrito — {formattedPrice}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!isAvailable}
            className={`w-full h-12 rounded-2xl text-sm font-semibold uppercase border-2 border-gray-900 ${
              isAvailable ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-400'
            }`}
          >
            Comprar ahora
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="mb-10 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.35em] text-gray-500">
            <span>Combos {combo.category}</span>
            <span>+1.500 envíos realizados en Colombia</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
            <div className="space-y-6">
              <div className={`${gradientPanel} p-6`}>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-[520px] flex items-center justify-center">
                  <img src={combo.image} alt={combo.name} className="max-h-full object-contain drop-shadow-2xl" />
                </div>
              </div>
              {descriptionPanel}
              {includedProductsPanel}
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] tracking-[0.3em] uppercase text-red-700">
                  <Clock className="w-4 h-4" />
                  <span>Entrenamientos extremos</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">{combo.name}</h1>
                <p className="text-sm text-gray-700">Diseñado para potenciar tu periodo de {combo.category?.toLowerCase()} con ingredientes reales y soporte 1:1.</p>
              </div>
              {priceStack}
              {bonusPanel}
              {quantitySelector}
              {actionButtons}
              {renderInfoCards('grid gap-3')}
              <div className="text-center text-xs text-gray-500 pt-4">
                <p>¿Necesitas ayuda eligiendo tu combo? Escríbenos al WhatsApp flotante.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
