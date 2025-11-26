// extraerCombosInfo.js
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'combos_raw.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Extraer tipos únicos
const tiposUnicos = new Set();

for (const combo of data) {
  tiposUnicos.add(combo.Tipo);
}

console.log('TIPOS ÚNICOS EN COMBOS:\n');
Array.from(tiposUnicos).forEach(tipo => {
  console.log(`- ${tipo}`);
});

console.log(`\nTotal de combos: ${data.length}`);
