import CategoryPageBase from './CategoryPageBase';
import vitaminasImg from '../../assets/images/vitaminas.jpg';

const Salud = () => {
  const pillars = [
    { title: 'Vitaminas', description: 'Complejos A, B, C, D y E para cubrir deficiencias comunes.' },
    { title: 'Minerales', description: 'Magnesio, zinc y calcio para sistema nervioso y óseo.' },
    { title: 'Probióticos', description: 'Soporte digestivo e inmunológico diario.' },
    { title: 'Omega 3', description: 'Protección cardiovascular y cognitiva.' }
  ];

  const reasons = [
    {
      title: 'Deficiencias nutricionales',
      description: 'Incluso con una dieta equilibrada es complejo cubrir todo el espectro de micronutrientes.'
    },
    {
      title: 'Estilo de vida activo',
      description: 'Entrenamientos intensos y estrés elevan la demanda de vitaminas antioxidantes y minerales.'
    }
  ];

  const wellnessTypes = [
    {
      title: 'Multivitamínicos',
      badge: 'Balance diario',
      description: 'Complejos completos para cubrir brechas de micronutrientes y sostener la energía metabólica.',
      focus: ['Soporte inmune', 'Energía estable', 'Micronutrientes esenciales']
    },
    {
      title: 'Precursores de testosterona',
      badge: 'Rendimiento hormonal',
      description: 'Formulados con ZMA, tribulus o fenogreco para apoyar la producción natural de testosterona y la recuperación.',
      focus: ['Mejor descanso', 'Recuperación muscular', 'Vitalidad masculina']
    },
    {
      title: 'Suplementos para la salud',
      badge: 'Órganos y bienestar',
      description: 'Omega 3, magnesio, colágeno y adaptógenos para corazón, articulaciones y manejo del estrés.',
      focus: ['Salud cardiovascular', 'Cuidado articular', 'Estrés y enfoque']
    }
  ];

  const ageGroups = [
    {
      title: '18-30 años',
      items: ['Complejo B para energía estable', 'Vitamina D3 para densidad ósea', 'Omega 3 antipresión', 'Probióticos diarios']
    },
    {
      title: '30-50 años',
      items: ['Magnesio para gestionar el estrés', 'Antioxidantes C y E', 'Coenzima Q10', 'Multivitamínico completo']
    },
    {
      title: '50+ años',
      items: ['Calcio + Vitamina K2', 'Vitamina B12 para memoria', 'Colágeno hidrolizado', 'Curcumina antiinflamatoria']
    }
  ];

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
        <div className="space-y-6 text-left">
          <p className="text-gray-700 leading-relaxed">
            Tu <strong>salud es tu mayor tesoro</strong>. Combina vitaminas, minerales y compuestos naturales para mantener un sistema inmune
            sólido, gestionar el estrés y apoyar las funciones metabólicas diarias.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-3">Pilar</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-gray-600">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400">Subcategorías oficiales</p>
              <h3 className="text-2xl font-semibold text-gray-900">Agrupa tus suplementos con intención</h3>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              Igual que en Proteínas o Creatinas, ahora puedes filtrar Salud y Bienestar por tres focos clave para comprar o administrar inventario.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wellnessTypes.map(type => (
              <div key={type.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
                  <span className="uppercase tracking-[0.3em] text-gray-400">{type.badge}</span>
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-700">{type.title}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{type.description}</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {type.focus.map(point => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-700" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">¿Por qué suplementar tu dieta?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reasons.map((reason) => (
              <div key={reason.title} className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-2">Motivo</p>
                <h4 className="font-semibold text-gray-900 mb-2">{reason.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Suplementos esenciales por edad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ageGroups.map((group) => (
              <div key={group.title} className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-2">Etapa</p>
                <h4 className="font-semibold text-gray-900 mb-3">{group.title}</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-900" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CategoryPageBase>
  );
};

export default Salud;
