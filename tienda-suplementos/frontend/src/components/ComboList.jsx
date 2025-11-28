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
    <div className="group relative flex flex-col h-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgba(220,38,38,0.3)] hover:border-red-700 transition-all duration-500 hover:-translate-y-2">
      <Link to={`/combo/${combo._id || combo.id}`} className="flex-1 flex flex-col">
        {/* Imagen */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100/50 ${PRODUCT_IMAGE_HEIGHT} flex items-center justify-center`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.05),transparent_50%)] pointer-events-none"></div>
          <img
            className={`${PRODUCT_IMAGE_BASE} p-4 sm:p-6 group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-md`}
            src={imageSrc || '/placeholder-product.png'}
            alt={combo.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex items-center justify-center">
            <span className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl shadow-xl">
              Ver Detalle
            </span>
          </div>
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>

        <div className="flex flex-col flex-1 p-4 sm:p-5 bg-gradient-to-b from-white to-gray-50/30 gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-0.5 w-6 bg-gradient-to-r from-red-700 to-red-700 rounded-full"></div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Combo {combo.category}</p>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors min-h-[2.4rem] sm:min-h-[2.8rem] leading-tight">
            {combo.name}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{combo.description}</p>

          <div className="flex items-baseline gap-2 flex-wrap mt-auto">
            {combo.originalPrice && combo.originalPrice > combo.price ? (
              <>
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-red-700 to-red-700 bg-clip-text text-transparent">
                  ${formatPrice(combo.price)}
                </span>
                <span className="text-xs text-gray-400 line-through font-medium">${formatPrice(combo.originalPrice)}</span>
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                  -{Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-xl sm:text-2xl font-black text-gray-900">${formatPrice(combo.price)}</span>
            )}
          </div>

          {!combo.inStock && (
            <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-semibold text-red-700">Sin stock disponible</p>
            </div>
          )}
        </div>
      </Link>

      <button
        disabled={!combo.inStock}
        className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-2.5 px-4 rounded-none border-t transition-all duration-300 ${
          combo.inStock
            ? 'bg-gradient-to-r from-red-700 to-red-700 hover:from-red-700 hover:to-red-700 text-white shadow-inner'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {combo.inStock ? (
          <>
            <ShoppingCart className="w-5 h-5" />
            Agregar al Carrito
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Agotado
          </>
        )}
      </button>
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
