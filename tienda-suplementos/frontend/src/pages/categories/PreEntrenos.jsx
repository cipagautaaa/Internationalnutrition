import CategoryPageBase from './CategoryPageBase';
import preentrenosImg from '../../assets/images/preentrenos.jpg';

const PreEntrenos = () => {
  const stacks = [
    { title: 'Pre-entrenos', description: 'Fórmulas con cafeína, citrulina y nootrópicos para foco real y bombeo sostenido.' },
    { title: 'Quemadores', description: 'Termogénicos con ingredientes clínicos para acelerar el metabolismo y controlar el apetito.' }
  ];

  const protocol = [
    { step: '01', title: '15-30 min antes', description: 'Bébelo previo al entrenamiento para aprovechar el pico de energía.' },
    { step: '02', title: 'Con 250 ml de agua fría', description: 'La dilución adecuada mejora la absorción y reduce molestias gástricas.' },
    { step: '03', title: 'Estómago ligero', description: 'Ideal después de una comida pequeña rica en carbohidratos.' }
  ];

  const ingredients = [
    { title: 'Cafeína anhidra', detail: '150-300 mg para energía sostenida y mayor alerta.' },
    { title: 'Beta-Alanina', detail: 'Amortigua la fatiga muscular en series largas.' },
    { title: 'L-Citrulina', detail: 'Optimiza el flujo sanguíneo y el "pump".' },
    { title: 'Taurina', detail: 'Favorece la hidratación celular y la estabilidad mental.' }
  ];

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
        <div className="space-y-6 text-left">
          <p className="text-gray-700 leading-relaxed">
            Lleva tus entrenamientos al siguiente nivel con nuestros <strong>pre-entrenos premium</strong> o acelera tu pérdida de grasa con
            <strong> quemadores efectivos</strong>. Fórmulas respaldadas para energía explosiva, enfoque mental y metabolismo acelerado.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stacks.map((stack) => (
              <div key={stack.title} className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-3">Alternativa</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{stack.title}</h3>
                <p className="text-sm text-gray-600">{stack.description}</p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">¿Cómo tomar tu pre-entreno?</h3>
            <span className="text-xs uppercase tracking-[0.35em] text-gray-500">Protocolo</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {protocol.map((item) => (
              <div key={item.step} className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-2">{item.step}</p>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Ingredientes clave</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ingredients.map((ingredient) => (
              <div key={ingredient.title} className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-2">Activo</p>
                <h4 className="font-semibold text-gray-900 mb-2">{ingredient.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{ingredient.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CategoryPageBase>
  );
};

export default PreEntrenos;