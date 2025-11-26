require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const Combo = require('./models/Combo');

const combos = [
  {
    name: 'Combo Volumen Extremo',
    description: 'Pack completo para ganar masa muscular rápidamente. Incluye proteína hipercalórica, creatina y BCAA.',
    price: 129.99,
    originalPrice: 179.99,
    discount: 28,
    category: 'Volumen',
    image: '/images/combo-volumen.jpg',
    inStock: true,
    featured: true,
    rating: 4.8,
    products: []
  },
  {
    name: 'Combo Fuerza y Masa',
    description: 'Ideal para aumentar fuerza y volumen muscular. Contiene proteína premium, creatina monohidrato y pre-workout.',
    price: 149.99,
    originalPrice: 199.99,
    discount: 25,
    category: 'Volumen',
    image: '/images/combo-fuerza.jpg',
    inStock: true,
    featured: true,
    rating: 4.7,
    products: []
  },
  {
    name: 'Combo Definición Total',
    description: 'Todo lo necesario para definir y quemar grasa. Incluye proteína limpia, quemador de grasa y L-Carnitina.',
    price: 119.99,
    originalPrice: 159.99,
    discount: 25,
    category: 'Definición',
    image: '/images/combo-definicion.jpg',
    inStock: true,
    featured: true,
    rating: 4.9,
    products: []
  },
  {
    name: 'Combo Shredding Pro',
    description: 'Máxima definición muscular. Pack con proteína aislada, CLA, termogénico y aminoácidos.',
    price: 139.99,
    originalPrice: 189.99,
    discount: 26,
    category: 'Definición',
    image: '/images/combo-shredding.jpg',
    inStock: true,
    featured: true,
    rating: 4.6,
    products: []
  }
];

async function seedCombos() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    console.log('Limpiando colección de combos...');
    await Combo.deleteMany({});
    console.log('✓ Colección limpiada');

    console.log('Insertando combos de ejemplo...');
    const createdCombos = await Combo.insertMany(combos);
    console.log(`✓ ${createdCombos.length} combos insertados exitosamente`);

    console.log('\nCombos creados:');
    createdCombos.forEach(combo => {
      console.log(`  - ${combo.name} (${combo.category}) - $${combo.price}`);
    });

    console.log('\n✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedCombos();
