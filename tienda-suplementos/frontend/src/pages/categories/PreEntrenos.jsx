import CategoryPageBase from './CategoryPageBase';
import preentrenosImg from '../../assets/images/preentrenos.jpg';

const PreEntrenos = () => {
  return (
    <CategoryPageBase
      title="Pre-entrenos y Quemadores"
      apiCategory="Pre-entrenos y Energía"
      pageTitle="Pre-entrenos y Quemadores - Tienda Suplementos"
      showVariants={true}
      hero={{
        type: 'image',
        src: preentrenosImg,
        height: 'calc(100vh - 36px)',
        overlay: 'bg-black/50',
        content: (
          <div>
            <h2 className="text-5xl font-bold mb-4">Pre-entrenos y Quemadores</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Maximiza tu energía y quema grasa de manera efectiva
            </p>
          </div>
        )
      }}
      description={
        <div className="text-left">
          <p className="mb-4">
            Lleva tus entrenamientos al siguiente nivel con nuestros <strong>pre-entrenos premium</strong> o acelera tu pérdida de grasa con nuestros <strong>quemadores de grasa efectivos</strong>. 
            Formulaciones científicamente respaldadas para energía explosiva, enfoque mental y metabolismo acelerado.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">⚡ Pre-Entrenos</h3>
              <p className="text-gray-600">Energía, enfoque y pump muscular para entrenamientos intensos</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-600">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🔥 Quemadores</h3>
              <p className="text-gray-600">Acelera tu metabolismo y potencia la pérdida de grasa</p>
            </div>
          </div>
        </div>
      }
    >
      {/* Contenido específico para pre-entrenos */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-orange-50 to-red-700 p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-orange-900 mb-3">¿Cuándo tomar tu pre-entreno?</h3>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="text-center">
              <div className="text-4xl mb-2">⏰</div>
              <h4 className="font-semibold text-orange-800">15-30 min antes</h4>
              <p className="text-sm text-orange-700">Del entrenamiento</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🥤</div>
              <h4 className="font-semibold text-orange-800">Con agua fría</h4>
              <p className="text-sm text-orange-700">200-300ml</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <h4 className="font-semibold text-orange-800">Estómago vacío</h4>
              <p className="text-sm text-orange-700">O comida ligera</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ingredientes clave</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Cafeína</h4>
            <p className="text-xs text-gray-600">150-300mg para energía sostenida</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Beta-Alanina</h4>
            <p className="text-xs text-gray-600">Reduce fatiga muscular</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Citrulina</h4>
            <p className="text-xs text-gray-600">Mejor flujo sanguíneo</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Taurina</h4>
            <p className="text-xs text-gray-600">Hidratación celular</p>
          </div>
        </div>
      </div>
    </CategoryPageBase>
  );
};

export default PreEntrenos;