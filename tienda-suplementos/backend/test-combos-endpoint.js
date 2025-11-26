const axios = require('axios');

const testCombosEndpoint = async () => {
  try {
    console.log('🧪 Testeando endpoint de combos...\n');

    // Test 1: Obtener todos los combos
    console.log('1️⃣  Obteniendo todos los combos...');
    const allCombos = await axios.get('http://localhost:5000/api/combos');
    console.log(`✅ Total de combos: ${allCombos.data.length}`);
    
    if (allCombos.data.length > 0) {
      console.log(`   Ejemplo de combo:`, JSON.stringify(allCombos.data[0], null, 2).slice(0, 300) + '...\n');
    }

    // Test 2: Filtrar por categoría Volumen
    console.log('2️⃣  Obteniendo combos de Volumen...');
    const volumenCombos = await axios.get('http://localhost:5000/api/combos?category=Volumen');
    console.log(`✅ Combos de Volumen: ${volumenCombos.data.length}\n`);

    // Test 3: Filtrar por categoría Definición
    console.log('3️⃣  Obteniendo combos de Definición...');
    const definicionCombos = await axios.get('http://localhost:5000/api/combos?category=Definición');
    console.log(`✅ Combos de Definición: ${definicionCombos.data.length}\n`);

    // Resumen
    console.log('📊 RESUMEN:');
    console.log(`   Total de combos: ${allCombos.data.length}`);
    console.log(`   - Volumen: ${volumenCombos.data.length}`);
    console.log(`   - Definición: ${definicionCombos.data.length}`);
    console.log('\n✨ ¡Endpoint funcionando correctamente!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.status === 404) {
      console.error('   El endpoint no existe. Verifica que el servidor esté corriendo.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   No se pudo conectar al servidor. Asegúrate de que esté ejecutándose en puerto 5000.');
    }
  }
};

testCombosEndpoint();
