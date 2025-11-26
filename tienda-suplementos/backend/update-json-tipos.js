const fs = require('fs');
const path = require('path');

// Leer el JSON
const jsonPath = path.join(__dirname, 'productos_raw.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Mapeo de tipos
const tipoMap = {
  'PROTEINA LIMPIA': 'Proteínas limpias',
  'PROTEINA HIPERCALORICA': 'Proteínas hipercalóricas',
  'PROTEINA VEGANA': 'Proteínas veganas',
  'CREATINA MONOHIDRATO': 'Monohidratadas',
  'CREATINA HCL': 'HCL',
  'PRE-ENTRENO': 'Pre-entrenos',
  'QUEMADOR': 'Quemadores de grasa',
  'BCAA': 'BCAA y EAA',
  'GLUTAMINA': 'Glutamina'
};

// Mapeo de categorías
const categoryMap = {
  'PROTEINAS': 'Proteínas',
  'CREATINAS': 'Creatinas',
  'CREATINA': 'Creatinas',
  'PRE-ENTRENOS': 'Pre-entrenos y Quemadores',
  'QUEMADORES': 'Pre-entrenos y Quemadores',
  'AMINOACIDOS': 'Aminoácidos y Recuperadores',
  'VITAMINAS': 'Salud y Bienestar',
  'SALUD': 'Salud y Bienestar',
  'COMIDAS': 'Comidas con proteína'
};

let updated = 0;
let categoryUpdated = 0;

// Actualizar cada producto
data.forEach((product, index) => {
  // Actualizar categoría
  if (product.category && categoryMap[product.category.toUpperCase()]) {
    const oldCat = product.category;
    product.category = categoryMap[product.category.toUpperCase()];
    if (oldCat !== product.category) {
      categoryUpdated++;
    }
  }
  
  // Actualizar tipo
  if (product.tipo) {
    const upperTipo = product.tipo.toUpperCase();
    for (const [oldTipo, newTipo] of Object.entries(tipoMap)) {
      if (upperTipo.includes(oldTipo)) {
        product.tipo = newTipo;
        updated++;
        break;
      }
    }
  }
});

// Guardar el JSON actualizado
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ JSON actualizado`);
console.log(`   - ${categoryUpdated} categorías normalizadas`);
console.log(`   - ${updated} tipos actualizados`);
console.log(`   - Total de productos: ${data.length}`);
