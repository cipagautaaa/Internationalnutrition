const normalizeText = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const createSet = (names) => new Set(names.map(normalizeText));

const HEALTH_TYPE_SETS = {
  'Multivitamínicos': createSet(['THE ONE', 'OPTIMUS', 'MULTIMN']),
  'Precursores de testosterona': createSet([
    'TESTABOLIC XTREME',
    'MONSTER TEST',
    'TESTO ULTRA',
    'TESTO X',
    'NOVA BOOST'
  ]),
  'Suplementos para la salud': createSet([
    'OMEGA 3 PROSCIENCE',
    'COLLAGEN STACK',
    'NUTRA C',
    'VITAMINA C IMN',
    'KORAGEM',
    'SHIELD',
    'OMEGA 3 IMN'
  ])
};

export const resolveHealthTypeOverride = (name = '') => {
  const normalized = normalizeText(name);
  if (!normalized) return null;
  for (const [type, set] of Object.entries(HEALTH_TYPE_SETS)) {
    if (set.has(normalized)) return type;
  }
  return null;
};

export { normalizeText };
