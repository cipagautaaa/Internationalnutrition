import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { Truck, ShieldCheck, Sparkles } from 'lucide-react';

const gradientPanel = 'bg-white border border-gray-200 rounded-3xl shadow-lg';

export default function ImplementDetail() {
  const { id } = useParams();
  const { addToCart, openCart } = useCart();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchOne = async () => {
      try {
        setLoading(true); setError(null);
        const { data } = await api.get('/implements');
        const list = data?.data || data || [];
        const found = Array.isArray(list) ? list.find((impl) => String(impl._id || impl.id) === String(id)) : null;
        if (!active) return;
        setItem(found || null);
        const firstSize = found?.sizes?.[0] || null;
        setSelectedSize(firstSize);
      } catch (e) {
        if (!active) return;
        setError('No fue posible cargar este implemento.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOne();
    return () => { active = false; };
  }, [id]);

  const sizeOptions = useMemo(() => {
    if (!item) return [];
    // Si hasSizes es false, no mostrar opciones de talla
    if (item.hasSizes === false) return [];
    if (Array.isArray(item.sizes) && item.sizes.length) {
      return item.sizes.map((size) => ({ key: size, label: size }));
    }
    return [];
  }, [item]);

  const handleAdd = () => {
    if (!item) return;
    addToCart({
      _id: item._id || item.id,
      id: item._id || item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: selectedSize,
      isImplement: true,
    });
    openCart();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Cargando implemento...</div>;
  }
  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div className="space-y-3">
          <p className="text-red-700 font-medium">{error || 'Implemento no encontrado'}</p>
          <Link to="/implementos" className="text-red-700 underline text-sm">Volver a Wargo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-8 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-gray-500">
          <span>Wargo y accesorios para gym</span>
          <span>+1.500 envíos</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <div className="space-y-6">
            <div className={`${gradientPanel} p-6`}>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-[420px] flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="max-h-full object-contain drop-shadow-2xl" />
                ) : (
                  <div className="text-gray-300">Sin imagen</div>
                )}
              </div>
            </div>
            <div className={`${gradientPanel} p-5`}>
              <h3 className="text-sm font-semibold mb-2 text-gray-900">Descripción</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.description || 'Accesorio Wargo listo para acompañar tus entrenamientos.'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] tracking-[0.25em] uppercase text-red-700">
                <Sparkles className="w-4 h-4" />
                <span>Wargo essentials</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">{item.name}</h1>
              <p className="text-sm text-gray-600">Soporte y accesorios para fuerza, cross y home gym.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-gray-900">${formatPrice(item.price || 0)}</span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">Stock listo</span>
              </div>
              <p className="text-xs text-gray-600">Impuestos incluidos · Envío gratis desde $80.000</p>
            </div>

            {sizeOptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-gray-600">TALLA / VARIANTE</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((opt) => {
                    const active = opt.key === selectedSize || (!selectedSize && opt.key === 'unico');
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setSelectedSize(opt.key === 'unico' ? null : opt.key)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500'}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAdd}
                className="flex-1 h-14 rounded-2xl text-sm font-black uppercase tracking-wide bg-red-700 text-white hover:bg-red-800 shadow-lg"
              >
                Agregar al carrito — ${formatPrice(item.price || 0)}
              </button>
              <Link
                to="/implementos"
                className="h-14 px-6 rounded-2xl text-sm font-semibold tracking-wide border border-gray-300 hover:bg-gray-50 text-gray-800 flex items-center justify-center"
              >
                Seguir viendo
              </Link>
            </div>

            <div className="grid gap-3">
              <InfoCard title="Entrega aproximada" description="Envíos nacionales entre 24 y 72 horas hábiles." Icon={Truck} />
              <InfoCard title="Listos para usar" description="Incluimos tips de uso rápido para cada accesorio." Icon={Sparkles} />
              <InfoCard title="Garantía y autenticidad" description="Sellos intactos, soporte por WhatsApp y seguimiento." Icon={ShieldCheck} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, description, Icon }) {
  return (
    <div className={`${gradientPanel} p-4 flex items-center justify-between`}>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <Icon className="w-5 h-5 text-gray-400" />
    </div>
  );
}
