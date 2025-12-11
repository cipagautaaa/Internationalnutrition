import { useEffect, useState } from 'react';
import api from '../services/api';
import ImplementCard from '../components/ImplementCard';
import FAQSection from '../components/FAQSection';

const Implements = () => {
  const [implementsList, setImplementsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const faqItems = [
    {
      question: '¿Qué productos incluye Wargo y accesorios para gym?',
      answer: 'Cinturones, straps, muñequeras, guantes, ganchos, bandas y rodillos; todo pensado para soporte, grip y movilidad en fuerza, cross y home gym.'
    },
    {
      question: '¿Cómo elijo la talla correcta del cinturón o guantes?',
      answer: 'Mide tu cintura de entrenamiento (no la de pantalón) y revisa la guía de tallas. En guantes y straps, elige la talla que ajuste sin pellizcar.'
    },
    {
      question: '¿Sirven para levantamientos pesados?',
      answer: 'Sí. Los cinturones y muñequeras brindan soporte en sentadilla, press y peso muerto; los straps/ ganchos ayudan a mantener el agarre en series largas.'
    },
    {
      question: '¿Cómo cuidar los accesorios?',
      answer: 'Limpia con paño húmedo y seca al aire; evita lavadora o secadora para no dañar costuras o velcros. Guarda lejos de humedad prolongada.'
    },
    {
      question: '¿Cuándo usar bandas o rodillos?',
      answer: 'Bandas para activación y calentamiento; rodillos para liberar tensión y recuperación post-entreno. Úsalos 5-10 minutos antes o después de la sesión.'
    }
  ];

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

      <section className="mb-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.32em] text-gray-500 mb-3">Para quién</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fuerza, cross y home gym</h3>
            <p className="text-sm text-gray-700">Ligas, straps, cinturones y agarres para sostener volumen y evitar lesiones en tirones pesados.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.32em] text-gray-500 mb-3">Antes de comprar</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-900" />Elige talla de cinturón midiendo tu cintura de entrenamiento.</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-900" />Para straps y agarres: prioriza materiales antideslizantes si haces peso muerto/remos.</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-900" />Shakers y botellas: busca tapa a prueba de fugas y marcación de ml.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.32em] text-gray-500 mb-3">Usos rápidos</p>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Soporte:</strong> Cinturones y muñequeras para sentadilla, press y peso muerto.</p>
              <p><strong>Grip:</strong> Straps, guantes y ganchos para series largas sin soltar la barra.</p>
              <p><strong>Movilidad:</strong> Bandas y rodillos para calentamiento y descarga.</p>
            </div>
          </div>
        </div>
      </section>

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

      <div className="mt-14">
        <FAQSection title="Preguntas frecuentes sobre Wargo y accesorios" items={faqItems} />
      </div>
    </div>
  );
};

export default Implements;
