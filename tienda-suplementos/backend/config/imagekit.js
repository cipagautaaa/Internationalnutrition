const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

console.log('🖼️ ImageKit Config:');
console.log(`   publicKey: ${process.env.IMAGEKIT_PUBLIC_KEY ? '✅' : '❌'}`);
console.log(`   privateKey: ${process.env.IMAGEKIT_PRIVATE_KEY ? '✅' : '❌'}`);
console.log(`   urlEndpoint: ${process.env.IMAGEKIT_URL_ENDPOINT ? '✅' : '❌'}`);

module.exports = imagekit;
