// Datos de Preguntas Frecuentes por grupo.
// Para editar/agregar preguntas: modifica el arreglo "items" del grupo correspondiente.

export const FAQ_DATA = {
  proteinasLimpias: {
    title: 'Preguntas Frecuentes sobre Proteína Limpia',
    items: [
      { question: '¿Qué es una proteína limpia?', answer: 'Es un polvo proteico con etiqueta corta: fuente principal de proteína (suero, aislado, vegetal), edulcorantes seguros y escasos aditivos. Reduce azúcares, maltodextrinas o gomas en exceso para facilitar digestión y control calórico en definición o recomposición.' },
      { question: '¿Cómo y cuándo tomarla?', answer: 'La ingesta clásica es 1 scoop post-entrenamiento para iniciar recuperación muscular. También puedes usarla entre comidas o en el desayuno para elevar tu aporte diario de aminoácidos; mezclada con agua se absorbe más rápido y con leche agrega calorías y saciedad.' },
      { question: '¿Se puede combinar con creatina?', answer: 'Sí, ambas funcionan de forma complementaria: la proteína aporta aminoácidos para síntesis muscular y la creatina mejora fuerza y volumen celular. Tomarlas juntas no reduce efectividad; puedes mezclar creatina en el batido post-entreno o tomarla en cualquier otro momento del día.' },
      { question: '¿Si soy intolerante a la lactosa?', answer: 'Elige aislados (WPI) o hidrolizados, que tienen menos lactosa residual. Si aún presentan molestia inicia con media dosis y evalúa tolerancia; también puedes optar por proteínas vegetales (arroz, arveja) que ofrecen perfil completo si están mezcladas.' },
      { question: '¿Aislado vs concentrado?', answer: 'El concentrado (WPC) conserva fracciones bioactivas y suele tener algo más de carbohidratos y grasa; el aislado filtra esas fracciones para ofrecer mayor pureza proteica y menor lactosa. Para digestiones sensibles o control de calorías el aislado es preferible; en volumen sin intolerancias el concentrado es una opción económica.' },
      { question: '¿Cuánta proteína diaria necesito?', answer: 'En objetivos de ganancia o mantenimiento muscular la evidencia respalda 1.6–2.2 g de proteína por kilogramo de peso corporal. Ajusta hacia el rango alto en definición o edades avanzadas; usa el suplemento para completar lo que falte tras contabilizar tus fuentes alimentarias.' },
      { question: '¿Puede afectar riñones o hígado?', answer: 'En individuos sanos no se ha demostrado daño renal por ingestas moderadas/altas dentro de rangos recomendados. Quienes ya tienen enfermedad renal deben consultar a su médico antes de elevar proteína. Mantener hidratación y distribución de dosis durante el día favorece un procesamiento óptimo.' },
      { question: '¿Puedo cocinar con ella?', answer: 'Sí, puedes usarla en pancakes, avena o repostería fitness. El calor puede desnaturalizar estructuras pero no destruye valor nutricional esencial; evita temperaturas muy altas prolongadas para conservar sabor y textura adecuada.' },
      { question: '¿Mejor con agua o leche?', answer: 'Con agua el batido es más ligero y se absorbe rápido, ideal post-entreno o antes de una comida próxima. Con leche (o bebida vegetal) añades calorías y micronutrientes extra, útil si buscas mayor saciedad o aumentar tu aporte energético diario.' }
    ]
  },
  proteinasHipercaloricas: {
    title: 'Preguntas Frecuentes sobre Proteína Hipercalórica',
    items: [
      { question: '¿Qué diferencia a una hipercalórica?', answer: 'Incluye mezcla de carbohidratos (avena, maltodextrina, dextrina) y grasas saludables para aumentar calorías totales por scoop. Facilita crear superávit energético sin necesidad de grandes volúmenes de comida sólida, útil en metabolismo acelerado o dificultad para ganar peso.' },
      { question: '¿Cuándo conviene usarla?', answer: 'Cuando tu ingesta calórica objetivo supera lo que logras con comidas normales y la densidad energética adicional evita sensación de llenura extrema. También en periodos de volumen donde buscas progresión de fuerza y masa con recuperación adecuada.' },
      { question: '¿Puede reemplazar comidas?', answer: 'Actúa como apoyo, no debería sustituir sistemáticamente platos con fibra y micronutrientes. Úsala para complementar desayunos, entre comidas o post-entreno; mantén al menos 3 comidas completas diarias para salud digestiva y hormonal.' },
      { question: '¿Antes o después de entrenar?', answer: 'Después del entreno favorece reposición de glucógeno y aporte proteico. Antes del entreno puede generar pesadez si la porción es grande; si necesitas energía previa usa media porción 60–90 minutos antes.' },
      { question: '¿Riesgo de ganar grasa excesiva?', answer: 'El riesgo aparece si el superávit se excede de forma crónica. Monitoriza tu peso semanal (0.25–0.5% del peso corporal por semana en volumen) y ajusta porciones según progreso para minimizar ganancia grasa no deseada.' },
      { question: '¿Dividir la dosis es útil?', answer: 'Sí, repartir en dos medias porciones reduce molestias digestivas y mantiene flujo constante de calorías. Especialmente práctico en días con menor apetito o cuando el scoop completo resulta demasiado espeso.' },
      { question: '¿Se toma en días de descanso?', answer: 'Mantener ingesta calórica uniforme facilita la recuperación y síntesis muscular; conserva dosis si tu objetivo sigue siendo aumentar masa. Puedes reducir ligeramente carbohidratos si actividad baja ese día.' },
      { question: '¿Combinar con creatina y proteína limpia?', answer: 'Es viable y frecuente: creatina potencia fuerza, proteína limpia asegura alta pureza proteica y la hipercalórica añade densidad energética. Ajusta total de proteína diaria para no excederte innecesariamente.' }
    ]
  },
  proteinasGeneral: {
    title: 'Preguntas Frecuentes sobre Proteínas (Limpias e Hipercalóricas)',
    items: [] // Se rellena dinámicamente si deseas concatenar ambos grupos desde el componente
  },
  creatina: {
    title: 'Preguntas Frecuentes sobre Creatina (todas las variantes)',
    items: [
      { question: '¿Monohidratada vs micronizada?', answer: 'La monohidratada es la forma más estudiada y eficiente en relación costo-beneficio. La micronizada es la misma molécula pero con partículas más pequeñas para mejorar solubilidad y tolerancia gástrica; en resultados ergogénicos son equivalentes.' },
      { question: '¿Necesito fase de carga?', answer: 'No es indispensable. Una fase de carga (20 g/día divididos) acelera saturación en ~5–7 días; dosis estándar de 3–5 g/día logra saturación en 3–4 semanas. Escoge según tu preferencia y tolerancia digestiva.' },
      { question: '¿Retiene líquidos?', answer: 'Incrementa agua intracelular en la fibra muscular (volumen celular beneficioso) sin generar edema subcutáneo relevante. Esa hidratación interna puede mejorar síntesis proteica y rendimiento anaeróbico.' },
      { question: '¿Tomarla en días de descanso?', answer: 'Sí, la saturación depende de consumo constante más que del timing puntual. Mantén la misma dosis diaria independientemente de entrenar para sostener niveles de fosfocreatina.' },
      { question: '¿Seguridad para riñones?', answer: 'En personas sanas las dosis recomendadas no muestran daño renal ni hepático en estudios prolongados. Si tienes patología preexistente consulta con tu médico antes de suplementar.' },
      { question: '¿Creatina en definición?', answer: 'Su uso ayuda a preservar fuerza y masa muscular durante déficit calórico. Un ligero aumento de peso inicial por hidratación celular no representa ganancia grasa.' },
      { question: '¿Mejor momento del día?', answer: 'El timing tiene efecto mínimo; muchas personas la toman post-entreno mezclada con proteína por conveniencia. Lo clave es la adherencia diaria a la dosis.' },
      { question: '¿Combinar con cafeína reduce efecto?', answer: 'La evidencia actual no confirma una interferencia significativa en poblaciones generales. Puedes usar pre-entreno con cafeína y creatina simultáneamente sin pérdida notable de beneficios.' }
    ]
  },
  preEntrenosQuemadores: {
    title: 'Preguntas Frecuentes sobre Pre-entrenos y Quemadores',
    items: [
      { question: '¿Qué hace un pre-entreno?', answer: 'Eleva energía, enfoque y resistencia percibida usando cafeína, beta-alanina, citrulina, nootrópicos y adaptógenos. Optimiza el rendimiento de sesiones intensas o días con fatiga acumulada.' },
      { question: '¿Qué es un quemador?', answer: 'Es un suplemento que apoya el gasto energético y puede mejorar termogénesis o movilización de ácidos grasos mediante estimulantes suaves, extractos herbales y cofactores metabólicos. No sustituye dieta ni entrenamiento estructurado.' },
      { question: '¿Se pueden combinar?', answer: 'Sí, siempre revisa las etiquetas para evitar duplicar dosis altas de cafeína u otros estimulantes. Inicia con media porción de cada uno y evalúa presión arterial y sensación subjetiva.' },
      { question: '¿Conviene usarlos en ayunas?', answer: 'En ayunas la absorción de cafeína y otros compuestos puede ser más rápida, incrementando el efecto. Si hay malestar gástrico toma una comida ligera (carbohidrato fácil) 45–60 minutos antes.' },
      { question: '¿Qué hacer si siento hormigueo?', answer: 'El hormigueo (parestesia) proviene de la beta-alanina y es temporal e inofensivo. Puedes dividir la dosis o elegir fórmulas con beta-alanina dosificada en varias tomas para reducir sensación.' },
      { question: '¿Puedo ciclar estimulantes?', answer: 'Un descanso de 1–2 semanas cada 6–8 semanas ayuda a restablecer sensibilidad a la cafeína y reducir tolerancia acumulada. Durante el descanso prioriza hidratación y sueño.' },
      { question: '¿Afectan el sueño?', answer: 'Si los tomas tarde (menos de 6 horas antes de dormir) puede disminuir calidad de sueño y recuperación hormonal. Ajusta horario para finalizar la sesión temprano cuando uses dosis altas.' },
      { question: '¿Stack con creatina y aminoácidos?', answer: 'Compatibles: creatina potencia fuerza y aminoácidos pueden reducir degradación muscular. Asegúrate de hidratarte y no exceder sodio si tu pre trae electrolitos añadidos.' }
    ]
  },
  aminoacidos: {
    title: 'Preguntas Frecuentes sobre Aminoácidos y Recuperación',
    items: [
      { question: '¿BCAA vs EAA?', answer: 'Los EAA aportan el espectro completo de aminoácidos esenciales necesarios para síntesis proteica; los BCAA solo incluyen leucina, isoleucina y valina, activando señal anabólica pero con menor soporte si faltan otros esenciales. Para optimizar recuperación EAA suele ser más completo.' },
      { question: '¿Sirven si ya consumo suficiente proteína?', answer: 'Si tu ingesta diaria está en rangos óptimos (1.6–2.2 g/kg) el beneficio adicional es pequeño. Son útiles estratégicamente en entrenos en ayunas, periodos de restricción calórica o cuando la comida sólida se retrasa.' },
      { question: '¿Glutamina para recuperación?', answer: 'La glutamina apoya salud intestinal, función inmunológica y puede mejorar integridad de mucosa en estrés físico. Su efecto directo sobre hipertrofia es limitado, pero puede favorecer recuperación global en etapas de alto volumen de entrenamiento.' },
      { question: '¿Dosis típica de BCAA/EAA?', answer: 'Para BCAA 5–10 g alrededor del entrenamiento; para EAA 10–15 g según tamaño corporal y estado nutricional. Divide dosis si entrenas muy prolongado o en doble sesión.' },
      { question: '¿Leucina es clave?', answer: 'La leucina actúa como detonante de la síntesis proteica al activar la vía mTOR. Un umbral aproximado de 2–3 g de leucina por comida/batido favorece respuesta anabólica máxima.' },
      { question: '¿Tomarlos durante vs después del entreno?', answer: 'Intra-entreno ayuda a reducir fatiga y degradación muscular especialmente en sesiones largas o en ayuno. Post-entreno se pueden omitir si consumes inmediatamente proteína completa.' },
      { question: '¿Compatibles con creatina y cafeína?', answer: 'Sí, no hay interacción negativa conocida. Mantén hidratación adecuada para facilitar transporte celular y metabolismo energético.' }
    ]
  },
  comidasProteina: {
    title: 'Preguntas Frecuentes sobre Alimentacion saludable y alta en proteina',
    items: [
      { question: '¿Qué son estas comidas?', answer: 'Son productos listos (barras, puddings, mezclas para pancakes) diseñados para elevar tu ingesta proteica sin preparación extensa. Apoyan adherencia en días con poco tiempo y evitan saltarte objetivos de macronutrientes.' },
      { question: '¿Reemplazan comidas?', answer: 'Funcionan mejor como complemento estratégico entre comidas o post-entreno rápido. No sustituyen por completo platos con vegetales, fibra y micronutrientes; mantén equilibrio con alimentos frescos.' },
      { question: '¿Sirven para perder peso?', answer: 'Sí, su densidad proteica mejora saciedad y preservación muscular en déficit. Escoge opciones con contenido moderado de grasas y azúcares añadidos para maximizar el impacto en control de hambre.' },
      { question: '¿Cómo almacenarlas?', answer: 'Barras y sobres sellados se guardan en lugar fresco y seco; productos con rellenos cremosos pueden requerir refrigeración tras abrir. Revisa la etiqueta para fechas de caducidad y condiciones específicas.' },
      { question: '¿Contienen muchos edulcorantes?', answer: 'Las formulaciones modernas usan mezclas (sucralosa, stevia, eritritol). En cantidades dentro de límites habituales no representan riesgo significativo en personas sanas; si hay sensibilidad gastrointestinal prueba con porciones pequeñas primero.' },
      { question: '¿Útiles en dietas cetogénicas?', answer: 'Algunas versiones bajas en carbohidratos son compatibles; verifica etiqueta de carbohidratos netos y calidad de las grasas. Ajusta porciones para mantener tu objetivo de macros diarios.' }
    ]
  },
  saludBienestar: {
    title: 'Preguntas Frecuentes: Salud y Bienestar',
    items: [
      { question: '¿Qué son precursores de testosterona?', answer: 'Incluyen extractos herbales y micronutrientes (ashwagandha, zinc, vitamina D3) que apoyan niveles dentro de rangos fisiológicos normales cuando hay insuficiencias leves. No reemplazan intervenciones médicas ni corrigen patologías endocrinas severas.' },
      { question: '¿Colágeno ayuda a articulaciones?', answer: 'El colágeno hidrolizado aporta péptidos que pueden estimular síntesis de cartílago y mejorar confort articular con uso sostenido (8–12 semanas). También apoya salud de piel, uñas y cabello cuando se combina con vitamina C para la formación de fibras.' },
      { question: '¿Omega 3 para qué sirve?', answer: 'EPA y DHA contribuyen a modulación de inflamación, salud cardiovascular, función cognitiva y visión. Dosis habituales 1000–2000 mg combinados al día, preferentemente con comidas para mejorar absorción.' },
      { question: '¿Multivitamínico es imprescindible?', answer: 'No siempre; es útil como “red de seguridad” en dietas con poca variedad, alto estrés o restricción calórica prolongada. No compensa una dieta pobre: sigue priorizando alimentos integrales y usa el multivitamínico para cubrir brechas específicas.' },
      { question: '¿Vitamina C diaria?', answer: 'Apoya síntesis de colágeno, función inmune y protección antioxidante. Ingestas de 200–500 mg cubren la mayoría de necesidades; dosis muy altas no ofrecen beneficios proporcionales y pueden causar molestias digestivas.' },
      { question: '¿Zinc y testosterona?', answer: 'El zinc participa en cientos de reacciones enzimáticas y apoyo hormonal; deficiencias leves pueden afectar niveles de testosterona. Suplementar 15–30 mg/día en periodos de alta sudoración o dietas restrictivas ayuda a mantener niveles adecuados.' },
      { question: '¿Probióticos vs prebióticos?', answer: 'Probióticos son bacterias vivas beneficiosas; prebióticos son fibras que alimentan esa microbiota (inulina, FOS). Combinarlos puede mejorar diversidad intestinal y resiliencia inmunológica.' },
      { question: '¿Cómo elegir calidad en suplementos?', answer: 'Busca certificaciones de terceros (GMP, NSF), transparencia en dosis y ausencia de rellenos innecesarios. Etiquetas claras de origen de materias primas y lotes trazables ofrecen mayor confianza.' }
    ]
  }
};

export function mapCategoryToFAQGroup(normalizedCategory) {
  switch (normalizedCategory) {
    case 'Proteínas Limpias':
      return 'proteinasLimpias';
    case 'Proteínas Hipercalóricas':
      return 'proteinasHipercaloricas';
    case 'Creatina':
    case 'Creatinas':
      return 'creatina';
    case 'Pre-Workout':
    case 'Pre-entrenos y Quemadores':
      return 'preEntrenosQuemadores';
    case 'Aminoácidos':
    case 'Aminoácidos y Recuperadores':
      return 'aminoacidos';
    case 'Alimentacion saludable y alta en proteina':
    case 'Comidas con proteína':
    case 'Comida':
      return 'comidasProteina';
    case 'Salud y Bienestar':
    case 'Vitaminas':
    case 'Rendimiento hormonal':
    case 'Complementos':
      return 'saludBienestar';
    default:
      return null;
  }
}
