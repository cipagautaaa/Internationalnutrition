require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = require('./models/Product');
  
  // Mapeo de tipos simples a completos
  const tipoMap = {
    'Limpia': 'Proteínas limpias',
    'Hipercalórica': 'Proteínas hipercalóricas',
    'Vegana': 'Proteínas veganas',
    'Monohidrato': 'Monohidratadas',
    'Pre-entreno': 'Pre-entrenos',
    'Quemador': 'Quemadores de grasa'
  };
  
  console.log('🔄 Actualizando tipos de productos...\n');
  
  for (const [oldTipo, newTipo] of Object.entries(tipoMap)) {
    const result = await Product.updateMany(
      { tipo: oldTipo },
      { $set: { tipo: newTipo } }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ ${oldTipo} → ${newTipo}: ${result.modifiedCount} productos actualizados`);
    }
  }
  
  console.log('\n✨ Actualización completada');
  process.exit(0);
}).catch(e => { 
  console.error('Error:', e.message);
  process.exit(1); 
});
