import CategoryPageBase from './CategoryPageBase';
import creatinasImg from '../../assets/images/creatinas.jpg';

const Creatinas = () => {
  const formats = [
    { title: 'Creatina monohidrato', description: 'La forma más estudiada, perfecta para iniciar cualquier protocolo de fuerza.' },
    { title: 'Creatina HCL', description: 'Mayor solubilidad y digestión ligera para quienes buscan cero retención.' }
  ];

  const benefits = [
    ['Hasta 15% más de fuerza en movimientos explosivos', 'Mayor número de repeticiones efectivas', 'Recuperación rápida entre series'],
    ['Aumento real del volumen muscular', 'Mejor síntesis de proteínas', 'Hidratación celular optimizada']
  ];

  const protocol = [
    { step: '01', title: 'Fase de carga (opcional)', description: '20 g diarios durante 5 días divididos en 4 tomas iguales.' },
    { step: '02', title: 'Mantenimiento', description: '3-5 g al día idealmente post-entreno junto a una fuente de carbohidratos.' },
    { step: '03', title: 'Hidratación', description: 'Asegura al menos 2.5 L de agua diarios para aprovechar la creatina intracelular.' }
  ];

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
        <div className="space-y-6 text-left">
          <p className="text-gray-700 leading-relaxed">
            La <strong>creatina</strong> es el estándar para incrementar fuerza, potencia y volumen muscular. Trabajamos con materias primas
            certificadas que garantizan pureza y trazabilidad lote a lote.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formats.map((format) => (
              <div key={format.title} className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-3">Formato</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{format.title}</h3>
                <p className="text-sm text-gray-600">{format.description}</p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Beneficios comprobados</h3>
            <span className="text-xs uppercase tracking-[0.35em] text-gray-500">Datos reales</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((group, idx) => (
              <ul key={idx} className="space-y-3 text-sm text-gray-700">
                {group.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-900" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">¿Cómo tomar creatina?</h3>
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
    </CategoryPageBase>
  );
};

export default Creatinas;