import CategoryPageBase from './CategoryPageBase';
import creatinasImg from '../../assets/images/creatinas.jpg';

const Creatinas = () => {
  return (
    <CategoryPageBase
      title="Creatinas"
      apiCategory="Creatinas"
      pageTitle="Creatinas - Tienda Suplementos"
      hero={{
        type: 'image',
        src: creatinasImg,
        height: 'calc(100vh - 36px)',
        overlay: 'bg-black/30',
        content: (
          <div>
            <h2 className="text-5xl font-bold mb-4">Creatinas</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Potencia tu fuerza y resistencia. La creatina más pura y efectiva del mercado.
            </p>
          </div>
        )
      }}
      description={
        <div className="text-left">
          <p className="mb-4">
            La <strong>creatina</strong> es uno de los suplementos más estudiados y efectivos para 
            aumentar la fuerza, potencia y volumen muscular. Nuestras creatinas son de máxima pureza.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-7000">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creatina Monohidrato</h3>
              <p className="text-gray-600">La forma más estudiada y efectiva. Ideal para principiantes.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-7000">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creatina HCL</h3>
              <p className="text-gray-600">Mayor solubilidad, sin retención de líquidos.</p>
            </div>
          </div>
        </div>
      }
    >
      {/* Contenido específico para creatinas */}
      <div className="mb-12">
        <div className="bg-red-700 p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-red-700 mb-3">Beneficios comprobados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-red-700">
            <div>
              <h4 className="font-semibold mb-2">🏋️‍♂️ Rendimiento</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>+15% de fuerza en ejercicios explosivos</li>
                <li>Mayor resistencia en entrenamientos intensos</li>
                <li>Recuperación más rápida entre series</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">💪 Desarrollo Muscular</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Aumento del volumen muscular</li>
                <li>Mejor síntesis de proteínas</li>
                <li>Hidratación celular mejorada</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de cómo tomar */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Cómo tomar creatina?</h3>
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">📅</div>
              <h4 className="font-semibold mb-2">Fase de carga (opcional)</h4>
              <p className="text-sm text-gray-600">20g por 5 días divididos en 4 tomas</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🥤</div>
              <h4 className="font-semibold mb-2">Mantenimiento</h4>
              <p className="text-sm text-gray-600">3-5g diarios, preferible post-entreno</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💧</div>
              <h4 className="font-semibold mb-2">Hidratación</h4>
              <p className="text-sm text-gray-600">Bebe abundante agua durante todo el día</p>
            </div>
          </div>
        </div>
      </div>
    </CategoryPageBase>
  );
};

export default Creatinas;