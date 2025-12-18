const multer = require('multer');
const {
  uploadBufferToR2,
  hasR2Config,
  R2_DEFAULT_PREFIX,
} = require('../config/r2');

const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const isMimeOk = allowed.test(file.mimetype);
    const isExtOk = allowed.test((file.originalname || '').toLowerCase());
    if (isMimeOk && isExtOk) return cb(null, true);
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  },
});

const upload = {
  single: (fieldName, options = {}) => {
    const folder = options.folder || R2_DEFAULT_PREFIX;

    return (req, res, next) => {
      multerUpload.single(fieldName)(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ success: false, message: err.message });
        }
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
          return next();
        }

        if (!hasR2Config) {
          return res.status(500).json({
            success: false,
            message: 'Cloudflare R2 no está configurado. Define R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET y R2_ENDPOINT.',
          });
        }

        try {
          const publicUrl = await uploadBufferToR2({
            buffer: req.file.buffer,
            contentType: req.file.mimetype,
            folder,
            originalName: req.file.originalname,
          });

          req.file.path = publicUrl;
          req.file.url = publicUrl;
          next();
        } catch (uploadError) {
          console.error('❌ Error subiendo a Cloudflare R2:', uploadError.message);
          res.status(500).json({
            success: false,
            message: 'Error al subir imagen a Cloudflare R2',
          });
        }
      });
    };
  },
};

module.exports = upload;
module.exports.multerUpload = multerUpload;
