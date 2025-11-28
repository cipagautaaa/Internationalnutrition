import CategoryPageBase from './CategoryPageBase';
import aminoacidosImg from '../../assets/images/aminos.jpg';

const Aminoacidos = () => {
  const highlightCards = [
    { title: 'BCAAs', description: 'Leucina, Isoleucina y Valina para proteger la masa muscular.' },
    { title: 'EAAs', description: 'Perfil completo de aminoácidos esenciales para mantener la síntesis proteica.' },
    { title: 'Glutamina', description: 'Respaldo para la recuperación y el sistema digestivo.' }
  ];

  const timing = [
    { title: 'Durante el entreno', description: 'BCAAs para limitar el catabolismo y mantener energía estable.' },
    { title: 'Antes de dormir', description: 'Glutamina para recuperación nocturna y soporte inmunológico.' },
    { title: 'En ayunas', description: 'EAAs para arrancar el día con síntesis proteica activa.' }
  ];

  const benefits = [
    ['Reducen el dolor muscular post-entreno', 'Aceleran la recuperación entre sesiones', 'Ayudan a conservar masa muscular en déficit calórico'],
    ['Mejoran la síntesis de proteínas', 'Fortalecen el sistema inmunológico', 'Optimizan la hidratación celular']
  ];

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
        <div className="space-y-6 text-left">
          <p className="text-gray-700 leading-relaxed">
            Los <strong>aminoácidos</strong> son los bloques fundamentales de las proteínas. Con nuestras fórmulas mantienes
            entrenamientos intensos sin sacrificar la recuperación muscular ni el rendimiento cognitivo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlightCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-3">Perfil clave</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Momentos clave para suplementar</h3>
            <span className="text-xs uppercase tracking-[0.35em] text-gray-500">Uso recomendado</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timing.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-2">{`0${index + 1}`}</p>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-6 sm:p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Beneficios de los aminoácidos</h3>
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
    </CategoryPageBase>
  );
};

export default Aminoacidos;
