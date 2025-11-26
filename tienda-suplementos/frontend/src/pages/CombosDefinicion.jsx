import ComboList from '../components/ComboList';

export default function CombosDefinicion() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-28 sm:pt-36 md:pt-40 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Combos de Definición</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Paquetes especiales diseñados para pérdida de grasa y tonificación</p>
        </div>
        <ComboList category="Definición" />
      </div>
    </div>
  );
}
