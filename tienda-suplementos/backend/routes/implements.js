const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const implementsController = require('../controllers/implementController');
const upload = require('../middleware/uploadR2');

// IMPORTANTE: Rutas específicas ANTES que rutas parametrizadas
// POST /api/implements/upload-image - subir imagen a Cloudflare R2
router.post('/upload-image', protect, isAdmin, upload.single('image', { folder: 'suplementos/implements' }), async (req, res) => {
  try {
    console.log('📸 [upload-image] Iniciando upload...');
    console.log('   user:', req.user?.id);
    console.log('   file:', req.file?.originalname);
    
    if (!req.file) {
      console.warn('⚠️ [upload-image] No file received');
      return res.status(400).json({ success: false, message: 'No se proporciono imagen' });
    }
    
    const imageUrl = req.file.path || req.file.url;
    console.log('✅ [upload-image] Imagen subida a Cloudflare R2:', imageUrl);
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Imagen subida exitosamente a Cloudflare R2'
    });
  } catch (error) {
    console.error('❌ [upload-image] Error:', error.message || error);
    res.status(500).json({ success: false, message: error.message || 'Error al subir la imagen' });
  }
});

// Rutas generales
router.get('/', implementsController.getImplements);
router.post('/', protect, isAdmin, upload.single('image', { folder: 'suplementos/implements' }), implementsController.createImplement);
router.put('/:id', protect, isAdmin, upload.single('image', { folder: 'suplementos/implements' }), implementsController.updateImplement);
router.delete('/:id', protect, isAdmin, implementsController.deleteImplement);

module.exports = router;
