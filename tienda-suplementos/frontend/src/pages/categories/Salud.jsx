import CategoryPageBase from './CategoryPageBase';
import vitaminasImg from '../../assets/images/vitaminas.jpg';

const Salud = () => {
  return (
    <CategoryPageBase
      title="Salud y Bienestar"
      apiCategory="Salud y Bienestar"
      pageTitle="Salud y Bienestar - Tienda Suplementos"
      hero={{
        type: 'image',
        src: vitaminasImg,
        height: 'calc(100vh - 36px)',
        overlay: 'bg-black/35',
        content: (
          <div>
            <h2 className="text-5xl font-bold mb-4">Salud y Bienestar</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Cuida tu cuerpo desde adentro. Vitaminas, minerales y suplementos para una vida plena.
            </p>
          </div>
        )
      }}
      description={
        <div className="text-left">
          <p className="mb-4">
            Tu <strong>salud es tu mayor tesoro</strong>. Encuentra vitaminas, minerales, probióticos 
            y suplementos naturales para fortalecer tu sistema inmune y mejorar tu bienestar general.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vitaminas</h3>
              <p className="text-gray-600 text-sm">A, B, C, D, E y complejos esenciales</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Minerales</h3>
              <p className="text-gray-600 text-sm">Magnesio, zinc, calcio y más</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Probióticos</h3>
              <p className="text-gray-600 text-sm">Salud digestiva y inmunológica</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Omega 3</h3>
              <p className="text-gray-600 text-sm">Salud cardiovascular y cerebral</p>
            </div>
          </div>
        </div>
      }
    >
      {/* Contenido específico para salud */}
      <div className="mb-12">
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-purple-900 mb-4">¿Por qué suplementar tu dieta?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <span className="mr-2">🥗</span> Deficiencias nutricionales
              </h4>
              <p className="text-purple-700 text-sm mb-4">
                Incluso con una dieta balanceada, es difícil obtener todos los nutrientes 
                que nuestro cuerpo necesita para funcionar óptimamente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <span className="mr-2">🏃‍♀️</span> Estilo de vida activo
              </h4>
              <p className="text-purple-700 text-sm mb-4">
                El ejercicio intenso y el estrés diario aumentan nuestras necesidades 
                de vitaminas y minerales específicos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Suplementos esenciales por edad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl mb-3">👦</div>
            <h4 className="font-semibold text-gray-900 mb-3">18-30 años</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complejo B para energía</li>
              <li>• Vitamina D3</li>
              <li>• Omega 3</li>
              <li>• Probióticos</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl mb-3">👨</div>
            <h4 className="font-semibold text-gray-900 mb-3">30-50 años</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Magnesio para estrés</li>
              <li>• Antioxidantes (C, E)</li>
              <li>• Coenzima Q10</li>
              <li>• Multivitamínico</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl mb-3">👴</div>
            <h4 className="font-semibold text-gray-900 mb-3">50+ años</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Calcio + Vitamina K2</li>
              <li>• B12 para memoria</li>
              <li>• Colágeno</li>
              <li>• Curcumina</li>
            </ul>
          </div>
        </div>
      </div>
    </CategoryPageBase>
  );
};

export default Salud;
