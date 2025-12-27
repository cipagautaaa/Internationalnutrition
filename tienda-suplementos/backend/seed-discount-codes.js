/**
 * Script para migrar códigos de descuento a la base de datos.
 * Este script crea códigos si no existen.
 * 
 * Ejecutar con: node seed-discount-codes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DiscountCode = require('./models/DiscountCode');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Lista de códigos de descuento a crear
const discountCodes = [
  {
    code: 'INTSUPPS20',
    productDiscount: 20,
    comboDiscount: 5,
    isActive: true,
    description: 'Código de descuento principal - 20% productos, 5% combos'
  },
  {
    code: 'EYALEJO',
    productDiscount: 10,
    comboDiscount: 10,
    isActive: true,
    description: 'Código influencer Eyalejo - 10% productos y combos'
  },
  {
    code: 'ALEJAS',
    productDiscount: 10,
    comboDiscount: 10,
    isActive: true,
    description: 'Código influencer Alejas - 10% productos y combos'
  },
  {
    code: 'LUFIT',
    productDiscount: 10,
    comboDiscount: 10,
    isActive: true,
    description: 'Código influencer Luisa Patiño - 10% productos y combos'
  },
  {
    code: 'ANTIPOWERLIFT',
    productDiscount: 10,
    comboDiscount: 10,
    isActive: true,
    description: 'Código influencer Camilo - 10% productos y combos'
  },
  {
    code: 'CONTRERAS',
    productDiscount: 10,
    comboDiscount: 10,
    isActive: true,
    description: 'Código influencer Alexis Contreras - 10% productos y combos'
  },
  {
    code: 'OXROCHA',
    productDiscount: 10,
    comboDiscount: 10,
    isActive: true,
    description: 'Código influencer Oxrocha - 10% productos y combos'
  }
];

const seedDiscountCodes = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    let created = 0;
    let existing = 0;

    for (const codeData of discountCodes) {
      const existingCode = await DiscountCode.findOne({ code: codeData.code });
      
      if (existingCode) {
        console.log(`ℹ️ El código ${codeData.code} ya existe`);
        existing++;
      } else {
        await DiscountCode.create(codeData);
        console.log(`✅ Código ${codeData.code} creado exitosamente`);
        created++;
      }
    }

    console.log(`\n📊 Resumen: ${created} códigos creados, ${existing} ya existían`);

    // Mostrar todos los códigos existentes
    const allCodes = await DiscountCode.find();
    console.log(`\n📋 Total de códigos de descuento: ${allCodes.length}`);
    
    if (allCodes.length > 0) {
      console.log('\nCódigos existentes:');
      allCodes.forEach(code => {
        console.log(`   - ${code.code}: Productos ${code.productDiscount}%, Combos ${code.comboDiscount}% (${code.isActive ? 'Activo' : 'Inactivo'})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

seedDiscountCodes();
