import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function AdminCombosSelection() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="pt-24 md:pt-28 p-6 max-w-6xl mx-auto">
        <div className="text-center text-sm text-red-700 bg-red-700 border border-red-700 rounded-lg px-4 py-3">
          Acceso restringido. Debes ser administrador para acceder a esta página.
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1 transition-colors"
        >
          ← Volver al Panel
        </button>
        
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-red-700 tracking-wide uppercase">Panel de Combos</p>
          <h1 className="text-3xl font-bold text-gray-900">Selecciona el tipo de combo</h1>
          <p className="text-gray-600">Gestiona combos de Volumen o Definición</p>
        </div>
      </div>

      {/* Cards de Volumen y Definición */}
      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
        {/* Volumen */}
        <button
          onClick={() => navigate('/admin/combos/volumen')}
          className="group relative flex flex-col rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 transition-colors group-hover:bg-blue-500">
                  <TrendingUp className="h-6 w-6 text-blue-600 transition-colors group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700">Volumen</h3>
              </div>
              <p className="text-sm text-gray-600">
                Combos diseñados para ganancia de masa muscular
              </p>
            </div>
          </div>

          <div className="mt-auto border-t border-blue-100 pt-4">
            <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
              Administrar Volumen
              <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>

        {/* Definición */}
        <button
          onClick={() => navigate('/admin/combos/definición')}
          className="group relative flex flex-col rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-500 hover:shadow-lg"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 transition-colors group-hover:bg-orange-500">
                  <TrendingDown className="h-6 w-6 text-orange-600 transition-colors group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-700">Definición</h3>
              </div>
              <p className="text-sm text-gray-600">
                Combos diseñados para pérdida de grasa y definición
              </p>
            </div>
          </div>

          <div className="mt-auto border-t border-orange-100 pt-4">
            <span className="flex items-center gap-1 text-sm font-semibold text-orange-600 transition-colors group-hover:text-orange-700">
              Administrar Definición
              <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
