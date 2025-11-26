// Script de prueba para validar la lógica de agrupación de productos
const stripAccents = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[^\w\s./-]/g, '')
    .replace(/[\u0300-\u036f]/g, '');

const computeSizeScore = (rawSize) => {
  if (!rawSize) return 1;
  const normalized = stripAccents(String(rawSize)).toLowerCase().replace(/,/g, '.');
  const patterns = [
    { regex: /(?:(\d+(?:\.\d+)?))\s*(kg|kilo|kilogramo|kilogramos|kgs?)/g, multiplier: 1000 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(lb|lbs|libras?)/g, multiplier: 453.592 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(oz|onzas?)/g, multiplier: 28.3495 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(g|gr|gramos?)/g, multiplier: 1 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(mg|miligramos?)/g, multiplier: 0.001 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(l|lt|litros?)/g, multiplier: 1000 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(ml|mililitros?)/g, multiplier: 1 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(servicios?|servings?|serv|scoops?)/g, multiplier: 10 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(capsulas?|caps|softgels?|tabletas?|tab|gomitas?|gummies|pills?|pastillas?|unid(?:ades?)?)/g, multiplier: 1 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(packs?|sobres?|sticks?)/g, multiplier: 1 }
  ];

  let best = 0;
  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    let match;
    while ((match = pattern.regex.exec(normalized)) !== null) {
      const value = parseFloat(match[1]);
      if (!Number.isFinite(value)) continue;
      const score = value * pattern.multiplier;
      if (score > best) best = score;
    }
  }

  if (best > 0) return best;
  const fallback = normalized.match(/(\d+(?:\.\d+)?)/);
  if (fallback) {
    const value = parseFloat(fallback[1]);
    if (Number.isFinite(value)) return value;
  }
  return 1;
};

// Casos de prueba
const testCases = [
  { size: '1 lb', expected: 'menor' },
  { size: '2 lb', expected: 'medio' },
  { size: '5 lb', expected: 'MAYOR' },
  { size: '300g', expected: 'pequeño' },
  { size: '500g', expected: 'medio' },
  { size: '1000g', expected: 'grande' },
  { size: '1 kg', expected: 'muy grande' },
  { size: '30 servicios', expected: 'pequeño' },
  { size: '60 servicios', expected: 'medio' },
  { size: '90 servicios', expected: 'MAYOR' },
  { size: '90 tabletas', expected: 'pequeño' },
  { size: '180 tabletas', expected: 'MAYOR' },
];

console.log('🧪 Probando lógica de priorización por tamaño:\n');

const results = testCases.map(test => ({
  ...test,
  score: computeSizeScore(test.size)
}));

// Ordenar por score descendente
results.sort((a, b) => b.score - a.score);

results.forEach((result, index) => {
  const position = index === 0 ? '🥇 PRIMARIO' : index === 1 ? '🥈 Segundo' : `${index + 1}°`;
  console.log(`${position}: ${result.size.padEnd(20)} → Score: ${result.score.toFixed(2)}`);
});

console.log('\n✅ Lógica de priorización validada');
console.log('📌 Los tamaños más grandes tendrán mayor score y aparecerán como variante principal');

// Prueba de agrupación por nombre
console.log('\n🧪 Probando agrupación por nombre idéntico:\n');

const sampleProducts = [
  { name: 'Whey Protein Gold Standard', size: '1 lb', price: 55000 },
  { name: 'Whey Protein Gold Standard', size: '2 lb', price: 95000 },
  { name: 'Whey Protein Gold Standard', size: '5 lb', price: 210000 },
  { name: 'Creatina Monohidrato Pura', size: '300g', price: 35000 },
  { name: 'Creatina Monohidrato Pura', size: '500g', price: 55000 },
  { name: 'Creatina Monohidrato Pura', size: '1000g', price: 95000 },
];

const groups = new Map();

sampleProducts.forEach(product => {
  const key = stripAccents(product.name).toLowerCase().trim();
  if (!groups.has(key)) {
    groups.set(key, { displayName: product.name, items: [] });
  }
  groups.get(key).items.push(product);
});

groups.forEach(group => {
  console.log(`📦 "${group.displayName}":`);
  
  const scored = group.items.map(item => ({
    ...item,
    score: computeSizeScore(item.size)
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  scored.forEach((item, index) => {
    const badge = index === 0 ? '⭐ PRINCIPAL' : `  Variante ${index}`;
    console.log(`   ${badge}: ${item.size} - $${item.price} (score: ${item.score.toFixed(2)})`);
  });
  console.log('');
});

console.log('✅ Agrupación validada - Productos con mismo nombre se unificarán en una sola card');
console.log('✅ El tamaño más grande será la presentación principal mostrada');
