require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const Implement = require('./models/Implement');

async function startServer() {
  try {
    // Conectar a MongoDB
    console.log('Conectando a MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    console.log('Base de datos:', mongoose.connection.name);

    // Obtener Wargo y accesorios para gym
    const implements = await Implement.find({ isActive: true });
    console.log(`✅ Encontrados ${implements.length} Wargo y accesorios para gym activos`);

    // Crear servidor HTTP simple
    const server = http.createServer(async (req, res) => {
      if (req.url === '/api/implements' && req.method === 'GET') {
        try {
          const list = await Implement.find({ isActive: true }).sort({ createdAt: -1 });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: list.map(impl => ({
              id: impl._id,
              name: impl.name,
              size: impl.size,
              isActive: impl.isActive
            }))
          }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Error' }));
        }
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(5000, () => {
      console.log('🚀 Servidor corriendo en http://localhost:5000');
      console.log('Prueba: http://localhost:5000/api/implements');
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

startServer();
