import ComboList from '../components/ComboList';
import FAQSection from '../components/FAQSection';

export default function CombosVolumen() {
  const introBlocks = [
    {
      title: 'Para quién',
      items: [
        'Ganar masa muscular y fuerza en etapas de volumen.',
        'Personas con alto gasto calórico o dificultad para subir de peso.',
        'Atletas que necesitan más calorías y proteína de forma práctica.'
      ]
    },
    {
      title: 'Qué incluyen',
      items: [
        'Proteínas concentradas/hipercalóricas para llegar a calorías meta.',
        'Creatina y pre-entreno para rendimiento y fuerza.',
        'Carbohidratos o snacks altos en energía para no saltar comidas.'
      ]
    },
    {
      title: 'Tips rápidos',
      items: [
        'Divide las tomas en el día para evitar pesadez estomacal.',
        'Combina con 1.6-2.2 g/kg de proteína y superávit calórico moderado.',
        'Hidrátate bien si usas creatina y mantén 7-9 h de sueño.'
      ]
    }
  ];

  const faqItems = [
    {
      question: '¿Qué objetivo tienen los combos de volumen?',
      answer: 'Apoyar un superávit calórico controlado para ganar masa muscular y fuerza, combinando proteínas/calorías extra con suplementos de rendimiento.'
    },
    {
      question: '¿Cómo distribuir las tomas en el día?',
      answer: 'Reparte 3-5 ingestas de proteína al día. Los gainers pueden dividirse en 2 mitades para evitar pesadez. Creatina (3-5 g) va diario, con o sin entreno.'
    },
    {
      question: '¿Necesito pre-entreno si ya tomo café?',
      answer: 'No es obligatorio. Si lo usas, ajusta la dosis para no exceder cafeína. Tómalo 20-30 minutos antes de entrenar.'
    },
    {
      question: '¿En cuánto tiempo veo resultados?',
      answer: 'Con entrenamiento y superávit moderado, se suelen ver progresos de fuerza y peso en 3-6 semanas. Ajusta calorías según evolución.'
    },
    {
      question: '¿Quiénes deben consultar primero a un profesional?',
      answer: 'Personas con hipertensión, condiciones cardíacas, ansiedad sensible a estimulantes, embarazo o lactancia deben validar el uso de pre-entrenos/estimulantes con su médico.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-28 sm:pt-36 md:pt-40 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Combos de Volumen</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Paquetes especiales diseñados para ganar masa muscular</p>
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

        <ComboList category="Volumen" />

        <div className="mt-14">
          <FAQSection title="Preguntas frecuentes sobre Combos de Volumen" items={faqItems} />
        </div>
      </div>
    </div>
  );
}
