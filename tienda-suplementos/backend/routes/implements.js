const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const implementsController = require('../controllers/implementController');
const upload = require('../middleware/uploadCloudinary');

// IMPORTANTE: Rutas específicas ANTES que rutas parametrizadas
// POST /api/implements/upload-image - subir imagen a Cloudinary
router.post('/upload-image', protect, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporciono imagen' });
    }
    
    const imageUrl = req.file.path;
    console.log('✅ Imagen subida a Cloudinary:', imageUrl);
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Imagen subida exitosamente a Cloudinary'
    });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al subir la imagen' });
  }
});

// Rutas generales
router.get('/', implementsController.getImplements);
router.post('/', protect, isAdmin, upload.single('image'), implementsController.createImplement);
router.put('/:id', protect, isAdmin, upload.single('image'), implementsController.updateImplement);
router.delete('/:id', protect, isAdmin, implementsController.deleteImplement);

module.exports = router;
