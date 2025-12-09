import { useEffect, useState } from 'react';
import api from '../services/api';
import ImplementCard from '../components/ImplementCard';

const Implements = () => {
  const [implementsList, setImplementsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImplements = async () => {
      try {
        const response = await api.get('/implements');
        // El endpoint devuelve { success: true, data: [...] }
        const implementsData = response.data.data || response.data || [];
        setImplementsList(Array.isArray(implementsData) ? implementsData : []);
      } catch (err) {
        console.error('Error al cargar Wargo y accesorios para gym', err);
        setError('No fue posible cargar la categoría Wargo y accesorios para gym en este momento.');
      } finally {
        setLoading(false);
      }
    };

    fetchImplements();
  }, []);

  return (
    <div className="pt-32 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Wargo y accesorios para gym
        </h1>
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          Descubre nuestra colección Wargo y accesorios esenciales para potenciar tu entrenamiento
        </p>
      </header>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" aria-label="Cargando" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-700 border border-red-700 text-red-700 rounded-xl px-6 py-4 text-center max-w-2xl mx-auto">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && implementsList.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl px-8 py-16 text-center shadow-sm max-w-2xl mx-auto">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg font-medium">No hay Wargo y accesorios para gym disponibles</p>
          <p className="text-gray-500 text-sm mt-2">Vuelve pronto para ver nuestros productos</p>
        </div>
      )}

      {!loading && !error && implementsList.length > 0 && (
        <>
          <div className="mb-6 text-center">
            <p className="text-gray-600 text-sm">
              {implementsList.length} {implementsList.length === 1 ? 'accesorio disponible' : 'accesorios disponibles'}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {implementsList.map((item) => (
              <ImplementCard key={item.id} implement={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Implements;
