import CategoryPageBase from './CategoryPageBase';
import proteinasImg from '../../assets/images/proteinas.jpg';

const Proteinas = () => {
  return (
    <CategoryPageBase
      title="Proteínas"
      apiCategory="Proteínas"
      pageTitle="Proteínas - Tienda Suplementos"
      showVariants={false}
      hero={{
        type: 'image',
        src: proteinasImg,
        height: 'calc(100vh - 36px)',
        overlay: 'bg-black/30',
        content: (
          <div>
            <h2 className="text-5xl font-bold mb-4">Proteínas</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Las mejores proteínas para tu entrenamiento. Whey, caseína, proteína vegetal y más.
            </p>
          </div>
        )
      }}
      description={
        <div className="text-left">
          <p className="mb-4">
            Descubre nuestra amplia selección de <strong>proteínas de alta calidad</strong> diseñadas 
            para maximizar tu rendimiento y acelerar tu recuperación muscular.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Whey Protein</h3>
              <p className="text-gray-600">Absorción rápida, ideal post-entreno</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Caseína</h3>
              <p className="text-gray-600">Liberación lenta, perfecta antes de dormir</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Proteína Vegetal</h3>
              <p className="text-gray-600">Opción plant-based sin comprometer calidad</p>
            </div>
          </div>
        </div>
      }
    >
      {/* Aquí puedes añadir contenido adicional específico para proteínas */}
      <div className="mb-12">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-blue-900 mb-3">¿Por qué elegir nuestras proteínas?</h3>
          <ul className="list-disc list-inside text-blue-800 space-y-2">
            <li>Certificadas por laboratorios independientes</li>
            <li>Sin aditivos artificiales dañinos</li>
            <li>Múltiples sabores deliciosos</li>
            <li>Envío gratis en compras superiores a $80.000</li>
          </ul>
        </div>
      </div>
    </CategoryPageBase>
  );
};

export default Proteinas;
