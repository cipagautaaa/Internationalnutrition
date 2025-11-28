import CategoryPageBase from './CategoryPageBase';
import proteinasImg from '../../assets/images/proteinas.jpg';

const Proteinas = () => {
  const productTypes = [
    { title: 'Whey Protein', description: 'Absorción rápida para acompañar la ventana anabólica post-entreno.' },
    { title: 'Caseína', description: 'Liberación sostenida que alimenta el músculo durante la noche.' },
    { title: 'Proteína vegetal', description: 'Combinaciones plant-based completas sin comprometer aminoácidos esenciales.' }
  ];

  const reasons = [
    'Certificadas por laboratorios independientes',
    'Sin edulcorantes agresivos ni rellenos innecesarios',
    'Sabores consistentes incluso con agua fría',
    'Envío gratis en compras superiores a $80.000'
  ];

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
        <div className="space-y-6 text-left">
          <p className="text-gray-700 leading-relaxed">
            Descubre nuestra selección de <strong>proteínas de alta calidad</strong> para acelerar la recuperación, cuidar tu
            masa muscular y mantener un perfil nutricional limpio en cada toma.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productTypes.map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-3">Formato</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h3 className="text-2xl font-semibold text-gray-900">¿Por qué elegir nuestras proteínas?</h3>
            <span className="text-xs uppercase tracking-[0.35em] text-gray-500">Calidad garantizada</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-6 rounded-full bg-gray-900/80" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CategoryPageBase>
  );
};

export default Proteinas;
