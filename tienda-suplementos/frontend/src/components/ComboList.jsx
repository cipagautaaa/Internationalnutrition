import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { PRODUCT_IMAGE_BASE, PRODUCT_IMAGE_HEIGHT } from '../styles/imageClasses';

// Tarjeta individual de combo en el listado.
function ComboCard({ combo }) {
  const imageSrc = combo?.image || combo?.imageUrl || combo?.cover || combo?.images?.[0] || '';

  return (
    <div className="group relative flex flex-col h-full bg-white border-2 border-gray-300 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-red-700 transition-all duration-300 hover:-translate-y-1">
      <Link to={`/combo/${combo._id || combo.id}`} className="flex-1 flex flex-col">
        <div className={`relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100/50 ${PRODUCT_IMAGE_HEIGHT} max-sm:min-h-0 max-sm:h-auto flex items-center justify-center`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.05),transparent_55%)] pointer-events-none" />
          <img
            className={`${PRODUCT_IMAGE_BASE} max-sm:h-auto p-3 sm:p-5 group-hover:scale-105 transition-transform duration-500 relative z-10 drop-shadow-md`}
            src={imageSrc || '/placeholder-product.png'}
            alt={combo.name}
            loading="lazy"
          />
        </div>

        <div className="flex flex-col flex-1 p-3 sm:p-5 gap-3 bg-gradient-to-b from-white to-gray-50/40">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            <span className="inline-flex h-1 w-6 rounded-full bg-gradient-to-r from-red-700 to-red-700" />
            <span>Combo {combo.category}</span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors">
            {combo.name}
          </h3>

          <p className="hidden sm:block text-xs sm:text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
            {combo.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-black text-gray-900">${formatPrice(combo.price)}</span>
              {combo.originalPrice && combo.originalPrice > combo.price && (
                <span className="text-xs text-gray-400 line-through font-medium">${formatPrice(combo.originalPrice)}</span>
              )}
            </div>
            <button
              type="button"
              disabled={!combo.inStock}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border text-sm font-semibold transition-all ${
                combo.inStock
                  ? 'border-gray-300 text-red-700 hover:bg-red-50'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>

          {!combo.inStock && (
            <p className="text-[11px] font-semibold text-red-600">Sin stock disponible</p>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function ComboList({ category }) {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchCombos = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (category) params.category = category;
        const res = await api.get('/combos', { params });
        if (!cancelled) {
          const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setCombos(data || []);
        }
      } catch {
        if (!cancelled) setError('Error cargando combos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCombos();
    return () => { cancelled = true; };
  }, [category]);

  if (loading) return <p className="text-gray-400 text-center py-8">Cargando combos...</p>;
  if (error) return <p className="text-red-700 text-center py-8">{error}</p>;
  if (!combos.length) return <p className="text-gray-400 text-center py-8">No hay combos disponibles en esta categoría.</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {combos.map((c) => (
        <ComboCard key={c._id || c.id} combo={c} />
      ))}
    </div>
  );
}
