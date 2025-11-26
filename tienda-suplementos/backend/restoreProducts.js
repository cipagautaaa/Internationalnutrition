// restoreProducts.js - Restaurar productos perdidos y agregar nuevos
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Tus productos reales que se perdieron
const productosReales = [
  {
    name: 'creatina imn',
    description: 'Creatina monohidrato de alta pureza para aumento de fuerza y potencia muscular',
    price: 130000,
    category: 'Creatinas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_692730-MCO88994756824_082025-F.webp',
    baseSize: '300g',
    inStock: true,
    stock: 25,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Sin sabor'],
    variants: [],
    tipo: 'Monohidrato'
  },
  {
    name: 'best proteina',
    description: 'Proteína de suero premium con excelente perfil de aminoácidos',
    price: 85000,
    category: 'Proteínas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_845678-MCO88456789012_072025-F.webp',
    baseSize: '2 lb',
    inStock: true,
    stock: 20,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Chocolate', 'Vainilla'],
    variants: [
      { size: '1 lb', price: 45000 },
      { size: '2 lb', price: 85000 }
    ],
    tipo: 'Whey Concentrate'
  },
  {
    name: 'proteina imn',
    description: 'Proteína isolada de alta calidad para máximo crecimiento muscular',
    price: 120000,
    category: 'Proteínas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_756789-MCO89567890123_082025-F.webp',
    baseSize: '2 lb',
    inStock: true,
    stock: 15,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Chocolate', 'Vainilla', 'Fresa'],
    variants: [
      { size: '2 lb', price: 120000 },
      { size: '4 lb', price: 220000 }
    ],
    tipo: 'Whey Isolate'
  },
  {
    name: 'bipro',
    description: 'Proteína bipro con tecnología avanzada de filtración',
    price: 210000,
    category: 'Proteínas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_867890-MCO90678901234_092025-F.webp',
    baseSize: '5 lb',
    inStock: true,
    stock: 8,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Chocolate', 'Vainilla'],
    variants: [
      { size: '5 lb', price: 210000 }
    ],
    tipo: 'Whey Isolate'
  },
  {
    name: 'creatina platinum',
    description: 'Creatina platinum de máxima pureza y efectividad',
    price: 180000,
    category: 'Creatinas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_978901-MCO91789012345_102025-F.webp',
    baseSize: '500g',
    inStock: true,
    stock: 12,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Sin sabor'],
    variants: [
      { size: '300g', price: 120000 },
      { size: '500g', price: 180000 }
    ],
    tipo: 'Monohidrato Premium'
  },
  {
    name: 'nutrex',
    description: 'Suplemento Nutrex para rendimiento y recuperación muscular',
    price: 190000,
    category: 'Aminoácidos y Recuperadores',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_089012-MCO92890123456_112025-F.webp',
    baseSize: '60 caps',
    inStock: true,
    stock: 18,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Sin sabor'],
    variants: [
      { size: '60 caps', price: 190000 }
    ],
    tipo: 'Complejo Recuperador'
  }
];

// Nuevos productos por categoría
const nuevosProductos = [
  // Más Proteínas
  {
    name: 'Whey Gold Standard ON',
    description: 'La proteína más vendida del mundo. 24g de proteína por servicio, BCAA y glutamina natural',
    price: 95000,
    category: 'Proteínas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_692730-MCO88994756824_082025-F.webp',
    baseSize: '2 lb',
    inStock: true,
    stock: 35,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Double Rich Chocolate', 'Vainilla', 'Fresa', 'Cookies & Cream'],
    variants: [
      { size: '1 lb', price: 55000 },
      { size: '2 lb', price: 95000 },
      { size: '5 lb', price: 210000 }
    ],
    tipo: 'Whey Concentrate'
  },
  {
    name: 'Caseína Micelar Gold Standard',
    description: 'Proteína de digestión lenta para recuperación nocturna. 24g de caseína por servicio',
    price: 85000,
    category: 'Proteínas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_812349-MCO71234567890_092023-F.webp',
    baseSize: '2 lb',
    inStock: true,
    stock: 20,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Chocolate', 'Vainilla', 'Cookies & Cream'],
    variants: [
      { size: '2 lb', price: 85000 },
      { size: '4 lb', price: 155000 }
    ],
    tipo: 'Caseína Micelar'
  },
  
  // Más Creatinas
  {
    name: 'Creatina Monohidrato Creapure',
    description: 'Creatina alemana Creapure, la más pura del mercado. Aumenta fuerza y potencia muscular',
    price: 45000,
    category: 'Creatinas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_687523-MCO88123456789_072025-F.webp',
    baseSize: '300g',
    inStock: true,
    stock: 40,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Sin sabor'],
    variants: [
      { size: '300g', price: 45000 },
      { size: '500g', price: 70000 },
      { size: '1000g', price: 125000 }
    ],
    tipo: 'Monohidrato Creapure'
  },
  
  // Pre-entrenos
  {
    name: 'C4 Original Pre Workout',
    description: 'Pre-entreno con 150mg cafeína, beta-alanina y arginina. Energía explosiva y pump muscular',
    price: 65000,
    category: 'Pre-entrenos y Energía',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_734567-MCO87345678901_062025-F.webp',
    baseSize: '30 serv',
    inStock: true,
    stock: 25,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Blue Razz', 'Fruit Punch', 'Watermelon', 'Orange'],
    variants: [
      { size: '30 serv', price: 65000 },
      { size: '60 serv', price: 115000 }
    ],
    tipo: 'Estimulante Moderado'
  },
  
  // Aminoácidos
  {
    name: 'BCAA 2:1:1 Scivation Xtend',
    description: 'Aminoácidos ramificados en proporción 2:1:1. Reduce fatiga y acelera recuperación',
    price: 55000,
    category: 'Aminoácidos y Recuperadores',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_756789-MCO89567890123_082025-F.webp',
    baseSize: '30 serv',
    inStock: true,
    stock: 30,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Blue Raspberry', 'Mango', 'Watermelon', 'Grape'],
    variants: [
      { size: '30 serv', price: 55000 },
      { size: '90 serv', price: 145000 }
    ],
    tipo: 'BCAA 2:1:1'
  },
  
  // Salud y Bienestar
  {
    name: 'Omega 3 Premium',
    description: 'Aceite de pescado ultra purificado. Alta concentración EPA y DHA para salud cardiovascular',
    price: 35000,
    category: 'Salud y Bienestar',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_089012-MCO92890123456_112025-F.webp',
    baseSize: '60 caps',
    inStock: true,
    stock: 45,
    isActive: true,
    rating: 0,
    reviews: [],
    flavors: ['Natural', 'Limón'],
    variants: [
      { size: '60 caps', price: 35000 },
      { size: '120 caps', price: 65000 }
    ],
    tipo: 'Omega 3'
  }
];

async function restoreAndAddProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    let restored = 0;
    let added = 0;
    let existing = 0;

    console.log('\n🔄 RESTAURANDO PRODUCTOS REALES PERDIDOS...');
    
    // Restaurar productos reales
    for (const product of productosReales) {
      const exists = await Product.findOne({ name: product.name });
      if (!exists) {
        await Product.create(product);
        console.log(`✅ Restaurado: ${product.name} - $${product.price.toLocaleString()}`);
        restored++;
      } else {
        console.log(`⚠️  Ya existe: ${product.name}`);
        existing++;
      }
    }

    console.log('\n➕ AGREGANDO PRODUCTOS NUEVOS...');
    
    // Agregar productos nuevos
    for (const product of nuevosProductos) {
      const exists = await Product.findOne({ name: product.name });
      if (!exists) {
        await Product.create(product);
        console.log(`✅ Agregado: ${product.name} - $${product.price.toLocaleString()}`);
        added++;
      } else {
        console.log(`⚠️  Ya existe: ${product.name}`);
        existing++;
      }
    }

    // Estadísticas finales
    console.log('\n📊 RESUMEN:');
    console.log(`   🔄 Productos restaurados: ${restored}`);
    console.log(`   ➕ Productos nuevos: ${added}`);
    console.log(`   ⚠️  Ya existían: ${existing}`);

    // Contar por categoría
    const stats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, stock: { $sum: '$stock' } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📋 PRODUCTOS POR CATEGORÍA:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} productos (${stat.stock} en stock)`);
    });

    const total = await Product.countDocuments();
    console.log(`\n🎯 TOTAL: ${total} productos en base de datos`);
    
    console.log('\n🎉 ¡Productos restaurados y agregados exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

restoreAndAddProducts();