// extraerTipos.js
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'productos_raw.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Extraer tipos únicos agrupados por categoría
const tiposPorCategoria = {};

for (const prod of data) {
  const cat = prod.category;
  const tipo = prod.tipo;
  
  if (!tiposPorCategoria[cat]) {
    tiposPorCategoria[cat] = new Set();
  }
  tiposPorCategoria[cat].add(tipo);
}

// Mostrar resultado
console.log('TIPOS POR CATEGORÍA:\n');
for (const [categoria, tipos] of Object.entries(tiposPorCategoria)) {
  console.log(`📦 ${categoria}:`);
  Array.from(tipos).forEach(tipo => {
    console.log(`   - ${tipo}`);
  });
  console.log();
}
