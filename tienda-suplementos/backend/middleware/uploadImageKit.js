const multer = require('multer');
const imagekit = require('../config/imagekit');

console.log('📤 uploadImageKit middleware: initializing...');

// Usar memoria para almacenar el archivo temporalmente
const storage = multer.memoryStorage();

const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    console.log('🔍 fileFilter:', file.originalname);
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      const err = new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)');
      console.error('❌ fileFilter error:', err.message);
      cb(err);
    }
  },
});

// Función para subir a ImageKit
const uploadToImageKit = async (fileBuffer, fileName, folder = 'suplementos/productos') => {
  try {
    const result = await imagekit.upload({
      file: fileBuffer.toString('base64'),
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      transformation: {
        pre: 'w-800,h-800,c-at_max,q-80'
      }
    });
    
    console.log('✅ Imagen subida a ImageKit:', result.url);
    return result.url;
  } catch (error) {
    console.error('❌ Error subiendo a ImageKit:', error);
    throw error;
  }
};

// Middleware wrapper que sube automáticamente a ImageKit
const upload = {
  single: (fieldName) => {
    return (req, res, next) => {
      multerUpload.single(fieldName)(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          console.error('❌ Multer error:', err.message);
          return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
          console.error('❌ Upload error:', err.message);
          return res.status(400).json({ success: false, message: err.message });
        }

        // Si hay archivo, subirlo a ImageKit
        if (req.file) {
          try {
            const imageUrl = await uploadToImageKit(
              req.file.buffer,
              req.file.originalname,
              'suplementos/productos'
            );
            // Agregar la URL al request para que esté disponible en la ruta
            req.file.path = imageUrl;
            req.file.url = imageUrl;
          } catch (uploadError) {
            console.error('❌ ImageKit upload error:', uploadError.message);
            return res.status(500).json({ 
              success: false, 
              message: 'Error al subir imagen a ImageKit: ' + uploadError.message 
            });
          }
        }

        next();
      });
    };
  },
};

// Exportar tanto el middleware como la función de upload
module.exports = upload;
module.exports.uploadToImageKit = uploadToImageKit;
module.exports.multerUpload = multerUpload;
