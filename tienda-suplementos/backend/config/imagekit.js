const ImageKit = require('imagekit');

let imagekit = null;

// Solo inicializar si las credenciales están presentes
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  console.log('🖼️ ImageKit Config: ✅ Configurado correctamente');
} else {
  console.warn('⚠️ ImageKit Config: Faltan credenciales');
  console.warn('   publicKey:', process.env.IMAGEKIT_PUBLIC_KEY ? '✅' : '❌');
  console.warn('   privateKey:', process.env.IMAGEKIT_PRIVATE_KEY ? '✅' : '❌');
  console.warn('   urlEndpoint:', process.env.IMAGEKIT_URL_ENDPOINT ? '✅' : '❌');
  console.warn('   La subida de imágenes no funcionará hasta configurar las variables.');
}

module.exports = imagekit;
