import CategoryPageBase from './CategoryPageBase';
import aminoacidosImg from '../../assets/images/aminos.jpg';

const Aminoacidos = () => {
  return (
    <CategoryPageBase
      title="Aminoácidos y Recuperadores"
      apiCategory="Aminoácidos y Recuperadores"
      pageTitle="Aminoácidos y Recuperadores - Tienda Suplementos"
      hero={{
        type: 'image',
        src: aminoacidosImg,
        height: 'calc(100vh - 36px)',
        overlay: 'bg-black/30',
        content: (
          <div>
            <h2 className="text-5xl font-bold mb-4">Aminoácidos</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Acelera tu recuperación y construye músculo de calidad con aminoácidos esenciales.
            </p>
          </div>
        )
      }}
      description={
        <div className="text-left">
          <p className="mb-4">
            Los <strong>aminoácidos</strong> son los bloques fundamentales de las proteínas. 
            Nuestros suplementos te ayudan a recuperarte más rápido y construir músculo magro.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">BCAAs</h3>
              <p className="text-gray-600">Leucina, Isoleucina, Valina - Los 3 esenciales</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">EAAs</h3>
              <p className="text-gray-600">Todos los aminoácidos esenciales completos</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Glutamina</h3>
              <p className="text-gray-600">Recuperación y salud intestinal</p>
            </div>
          </div>
        </div>
      }
    >
      {/* Contenido específico para aminoácidos */}
      <div className="mb-12">
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-green-900 mb-4">Cuándo tomar aminoácidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏃‍♂️</span>
              </div>
              <h4 className="font-semibold text-green-800 mb-2">Durante el entreno</h4>
              <p className="text-sm text-green-700">BCAAs para evitar catabolismo muscular</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛌</span>
              </div>
              <h4 className="font-semibold text-green-800 mb-2">Antes de dormir</h4>
              <p className="text-sm text-green-700">Glutamina para recuperación nocturna</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">☀️</span>
              </div>
              <h4 className="font-semibold text-green-800 mb-2">En ayunas</h4>
              <p className="text-sm text-green-700">EAAs para mantener síntesis proteica</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Beneficios de los aminoácidos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Reducen el dolor muscular post-entreno</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Aceleran la recuperación entre sesiones</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Mantienen la masa muscular en déficit calórico</span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Mejoran la síntesis de proteínas</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Fortalecen el sistema inmunológico</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Optimizan la hidratación celular</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </CategoryPageBase>
  );
};

export default Aminoacidos;
