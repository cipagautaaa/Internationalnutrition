/**
 * Script para migrar el código de descuento INTSUPPS20 a la base de datos.
 * Este script debe ejecutarse una vez para crear el código existente en la nueva tabla.
 * 
 * Ejecutar con: node seed-discount-codes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DiscountCode = require('./models/DiscountCode');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const seedDiscountCodes = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe el código
    const existing = await DiscountCode.findOne({ code: 'INTSUPPS20' });
    
    if (existing) {
      console.log('ℹ️ El código INTSUPPS20 ya existe en la base de datos:');
      console.log(`   - Descuento productos: ${existing.productDiscount}%`);
      console.log(`   - Descuento combos: ${existing.comboDiscount}%`);
      console.log(`   - Estado: ${existing.isActive ? 'Activo' : 'Inactivo'}`);
      console.log(`   - Usos: ${existing.usageCount}`);
    } else {
      // Crear el código INTSUPPS20 con los valores originales
      const newCode = await DiscountCode.create({
        code: 'INTSUPPS20',
        productDiscount: 20,
        comboDiscount: 5,
        isActive: true,
        description: 'Código de descuento principal - 20% productos, 5% combos'
      });

      console.log('✅ Código INTSUPPS20 creado exitosamente:');
      console.log(`   - ID: ${newCode._id}`);
      console.log(`   - Descuento productos: ${newCode.productDiscount}%`);
      console.log(`   - Descuento combos: ${newCode.comboDiscount}%`);
      console.log(`   - Estado: Activo`);
    }

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
