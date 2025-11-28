const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ override: true });
const User = require('./models/User');
const mongoose = require('mongoose');

async function testFullFlow() {
  try {
    console.log('\n🧪 TEST COMPLETO: Admin Login + Categorías\n');

    // 1. Conectar MongoDB
    console.log('1️⃣  Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ Conectado');

    // 2. Obtener admin
    console.log('\n2️⃣  Buscando admin en BD...');
    const admin = await User.findOne({ email: 'internationalnutritioncol@gmail.com' });
    if (!admin) {
      console.log('   ❌ Admin no encontrado');
      return;
    }
    console.log(`   ✅ Admin encontrado: ${admin.email}`);
    console.log(`   Rol: ${admin.role}`);
    console.log(`   PIN habilitado: ${admin.adminPinEnabled}`);

    // 3. Generar token como si fuera post-login
    console.log('\n3️⃣  Generando JWT token...');
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('   ✅ Token generado');

    // 4. Llamar endpoint /admin/category-summary CON token
    console.log('\n4️⃣  Llamando GET /api/products/admin/category-summary...');
    const headers = { Authorization: `Bearer ${token}` };
    const res = await axios.get('http://localhost:5000/api/products/admin/category-summary', { headers });
    
    console.log('   ✅ Respuesta 200 OK');
    console.log(`   Datos recibidos: ${JSON.stringify(res.data, null, 2)}`);

    // 5. Llamar SIN token (para ver si falla correctamente)
    console.log('\n5️⃣  Probando SIN token (debe fallar con 401)...');
    try {
      await axios.get('http://localhost:5000/api/products/admin/category-summary');
      console.log('   ❌ ERROR: Debería haber retornado 401!');
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('   ✅ Correctamente rechazado con 401');
      } else {
        console.log(`   ❌ Status inesperado: ${err.response?.status}`);
      }
    }

    console.log('\n✅ TEST COMPLETADO\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

testFullFlow();
