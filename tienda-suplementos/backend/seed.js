// backend/seed.js
// Script para poblar la base de datos con productos de ejemplo

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'Whey Protein Premium',
    price: 89.99,
    image: '/images/whey-protein.jpg',
    category: 'Proteínas',
    baseSize: '4 libras',
    description: 'Proteína de suero de leche de alta calidad para recuperación muscular',
    stock: 50,
    rating: 4.8,
    variants: [
      { size: '2 libras', price: 69.99, image: '/images/whey-protein-2lb.jpg', stock: 25 },
      { size: '4 libras', price: 129.99, image: '/images/whey-protein-4lb.jpg', stock: 25 }
    ],
    flavors: ['Vainilla', 'Chocolate', 'Fresa']
  },
  {
    name: 'Creatina Monohidrato',
    price: 24.99,
    image: '/images/creatine.jpg',
    category: 'Creatina',
    baseSize: '300g',
    description: 'Creatina pura para aumentar fuerza y masa muscular',
    stock: 40,
    rating: 4.6
  },
  {
    name: 'BCAA 2:1:1',
    price: 34.99,
    image: '/images/bcaa.jpg',
    category: 'Aminoácidos',
    baseSize: '250g',
    description: 'Aminoácidos de cadena ramificada para recuperación',
    stock: 30,
    rating: 4.7
  },
  {
    name: 'Pre-Workout Energy',
    price: 39.99,
    image: '/images/preworkout.jpg',
    category: 'Pre-Workout',
    baseSize: '30 serv',
    description: 'Energía y concentración para entrenamientos intensos',
    stock: 0,
    rating: 4.5
  },
  {
    name: 'Omega 3 Fish Oil',
    price: 19.99,
    image: '/images/omega3.jpg',
    category: 'Vitaminas',
    baseSize: '120 caps',
    description: 'Aceite de pescado rico en Omega 3 para salud cardiovascular',
    stock: 60,
    rating: 4.4
  },
  {
    name: 'Multivitamínico Completo',
    price: 29.99,
    image: '/images/multivitamin.jpg',
    category: 'Vitaminas',
    baseSize: '90 tabs',
    description: 'Complejo vitamínico para deportistas',
    stock: 70,
    rating: 4.3
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // NO borrar productos existentes - solo agregar si no existen
    for (const product of products) {
      const existing = await Product.findOne({ name: product.name });
      if (!existing) {
        const payload = {
          ...product,
          size: product.size || product.baseSize || '250g',
          description: product.description || 'Producto de ejemplo',
          inStock: product.stock === 0 ? false : true,
          isActive: true,
        };
        delete payload.baseSize;

        // Asegurar variantes con size/price válidos
        if (Array.isArray(product.variants)) {
          payload.variants = product.variants.map(v => ({
            ...v,
            size: v.size || payload.size,
            price: v.price || product.price,
          }));
        }

        console.log('Insertando', payload.name, 'size=', payload.size);
        await Product.create(payload);
        console.log(`✓ Agregado: ${product.name}`);
      } else {
        console.log(`- Ya existe: ${product.name}`);
      }
    }
    console.log('Productos insertados correctamente');
    process.exit();
  } catch (error) {
    console.error('Error al poblar productos:', error);
    process.exit(1);
  }
}

seedProducts();
