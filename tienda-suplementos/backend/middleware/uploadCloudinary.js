const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

console.log('📤 uploadCloudinary middleware: initializing...');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'suplementos/productos',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto' }],
});

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

// Wrapper para capturar errores de Cloudinary
const upload = {
  single: (fieldName) => {
    return (req, res, next) => {
      multerUpload.single(fieldName)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          console.error('❌ Multer error:', err.message);
          return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
          console.error('❌ Upload error:', err.message);
          return res.status(400).json({ success: false, message: err.message });
        }
        // Si todo bien, continuar
        next();
      });
    };
  }
};

module.exports = upload;
