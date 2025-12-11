import ComboList from '../components/ComboList';
import FAQSection from '../components/FAQSection';

export default function CombosDefinicion() {
  const introBlocks = [
    {
      title: 'Para quién',
      items: [
        'Personas que buscan definir y marcar sin perder músculo.',
        'Atletas en fases de corte o recomposición.',
        'Quienes prefieren apoyo moderado en cafeína/termogénicos.'
      ]
    },
    {
      title: 'Qué incluyen',
      items: [
        'Proteínas magras o aisladas para preservar masa muscular.',
        'Termogénicos/pre-entrenos ligeros para energía y enfoque.',
        'Omega/multivitamínicos para soporte general y recuperación.'
      ]
    },
    {
      title: 'Tips rápidos',
      items: [
        'Mantén 1.6-2.2 g/kg de proteína y buen descanso.',
        'Hidrátate y controla la cafeína si tomas café u otros estimulantes.',
        'Úsalos junto a déficit calórico moderado y entrenamiento de fuerza.'
      ]
    }
  ];

  const faqItems = [
    {
      question: '¿Qué objetivo tienen los combos de definición?',
      answer: 'Ayudan a reducir grasa corporal manteniendo masa muscular, combinando proteínas magras, termogénicos o quemadores suaves y apoyo para energía/control de apetito.'
    },
    {
      question: '¿Cómo se toman normalmente?',
      answer: 'Proteína post-entrenamiento o como snack alto en proteína; termogénico o pre-entreno 20-30 minutos antes de entrenar; multivitamínico/omega en las comidas principales. Sigue siempre las indicaciones del producto.'
    },
    {
      question: '¿Se pueden usar con ayuno o dietas bajas en carbohidratos?',
      answer: 'Sí, suelen ajustarse bien. Prioriza proteína en cada comida, hidrátate y evita exceder cafeína si ya consumes café o energizantes.'
    },
    {
      question: '¿En cuánto tiempo veo resultados?',
      answer: 'Con plan de alimentación y entrenamiento constantes, muchos usuarios notan cambios entre 3 y 6 semanas. El descanso y la hidratación son claves.'
    },
    {
      question: '¿Quiénes deben consultar primero a un profesional?',
      answer: 'Personas con hipertensión, problemas cardíacos, embarazo, lactancia, sensibilidad a la cafeína o medicación regular deben recibir aval médico antes de usar termogénicos o pre-entrenos.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-28 sm:pt-36 md:pt-40 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Combos de Definición</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Paquetes especiales diseñados para pérdida de grasa y tonificación</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-10 sm:mb-12">
          {introBlocks.map(block => (
            <div key={block.title} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{block.title}</h3>
              <ul className="space-y-2 text-sm text-gray-700 list-disc pl-4">
                {block.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <ComboList category="Definición" />

        <div className="mt-14">
          <FAQSection title="Preguntas frecuentes sobre Combos de Definición" items={faqItems} />
        </div>
      </div>
    </div>
  );
}
