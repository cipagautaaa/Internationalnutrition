const mongoose = require('mongoose');
require('dotenv').config({ override: true });
const Product = require('./models/Product');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Product.countDocuments();
    const byCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\n📊 Total productos:', count);
    console.log('\n📦 Por categoría:');
    byCategory.forEach(cat => console.log(`   ${cat._id}: ${cat.count}`));
    
    // Verificar isActive
    const active = await Product.countDocuments({ isActive: true });
    const inactive = await Product.countDocuments({ isActive: false });
    const noActive = await Product.countDocuments({ isActive: { $exists: false } });
    console.log('\n✅ Estado activo:');
    console.log(`   Activos (true): ${active}`);
    console.log(`   Inactivos (false): ${inactive}`);
    console.log(`   Sin definir: ${noActive}`);
    
    process.exit(0);
  } catch(e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
