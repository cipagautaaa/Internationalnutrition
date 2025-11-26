const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/suplementos')
  .then(async () => {
    console.log('Conectado a MongoDB');
    
    // Obtener todas las categorías únicas con conteo
    const cats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n=== CATEGORÍAS EN LA BASE DE DATOS ===');
    cats.forEach(cat => {
      console.log(`${cat._id}: ${cat.count} productos`);
    });
    
    // Verificar proteínas específicamente
    const proteinas = await Product.find({ 
      $or: [
        { category: 'Proteínas' },
        { category: 'proteínas' }
      ]
    }).select('name category tipo');
    
    console.log(`\n=== PROTEÍNAS (${proteinas.length} encontradas) ===`);
    proteinas.slice(0, 5).forEach(p => {
      console.log(`- ${p.name} | Categoría: "${p.category}" | Tipo: "${p.tipo || 'sin tipo'}"`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
