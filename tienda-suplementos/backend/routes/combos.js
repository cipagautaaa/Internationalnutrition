const express = require('express');
const router = express.Router();
const Combo = require('../models/Combo');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/uploadR2');

// GET todos los combos o filtrar por categoría
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    const combos = await Combo.find(filter).populate('products.productId').sort({ orden: 1, createdAt: -1 });
    res.json(combos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener combos', error: error.message });
  }
});

// GET combo por ID
router.get('/:id', async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id).populate('products.productId');
    
    if (!combo) {
      return res.status(404).json({ message: 'Combo no encontrado' });
    }
    
    res.json(combo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el combo', error: error.message });
  }
});

// POST crear nuevo combo (solo admin)
router.post('/', auth.protect, isAdmin, upload.single('image', { folder: 'suplementos/combos' }), async (req, res) => {
  try {
    const { name, description, price, originalPrice, discount, category, products, inStock, featured, rating } = req.body;
    
    const comboData = {
      name,
      description,
      price: parseFloat(price),
      category,
      inStock: inStock === 'true' || inStock === true,
    };
    
    // Si hay imagen, la URL ya viene desde Cloudflare R2 vía middleware
    if (req.file?.path) {
      comboData.image = req.file.path;
    }
    
    // Campos opcionales
    if (originalPrice) comboData.originalPrice = parseFloat(originalPrice);
    if (discount) comboData.discount = parseFloat(discount);
    if (featured !== undefined) comboData.featured = featured === 'true' || featured === true;
    if (rating) comboData.rating = parseFloat(rating);
    if (products) {
      comboData.products = typeof products === 'string' ? JSON.parse(products) : products;
    }
    
    const combo = new Combo(comboData);
    const savedCombo = await combo.save();
    
    res.status(201).json(savedCombo);
  } catch (error) {
    console.error('❌ Error al crear combo:', error);
    res.status(400).json({ message: 'Error al crear el combo', error: error.message });
  }
});

// PUT actualizar combo (solo admin)
router.put('/:id', auth.protect, isAdmin, upload.single('image', { folder: 'suplementos/combos' }), async (req, res) => {
  try {
    console.log('📝 PUT /combos/:id recibido');
    console.log('📦 Body:', req.body);
    console.log('📸 File:', req.file ? 'Archivo recibido' : 'No file');
    
    const { name, description, price, originalPrice, discount, category, products, inStock, featured, rating } = req.body;
    
    const combo = await Combo.findById(req.params.id);
    
    if (!combo) {
      return res.status(404).json({ message: 'Combo no encontrado' });
    }
    
    // Actualizar campos (incluso si vienen vacíos, para permitir borrar valores)
    if (name !== undefined) combo.name = name;
    if (description !== undefined) combo.description = description;
    if (price !== undefined) combo.price = parseFloat(price);
    if (originalPrice !== undefined) combo.originalPrice = parseFloat(originalPrice);
    if (discount !== undefined) combo.discount = parseFloat(discount);
    if (category !== undefined) combo.category = category;
    
    // Booleanos: convertir strings a boolean
    if (inStock !== undefined) {
      combo.inStock = inStock === 'true' || inStock === true;
    }
    if (featured !== undefined) {
      combo.featured = featured === 'true' || featured === true;
    }
    
    if (rating !== undefined) combo.rating = parseFloat(rating);
    
    // Productos: parsear si es string
    if (products !== undefined) {
      combo.products = typeof products === 'string' ? JSON.parse(products) : products;
    }
    
    // Si hay archivo nuevo, la URL ya viene desde Cloudflare R2 vía middleware
    if (req.file?.path) {
      combo.image = req.file.path;
    }
    
    const updatedCombo = await combo.save();
    console.log('✅ Combo actualizado exitosamente');
    res.json(updatedCombo);
  } catch (error) {
    console.error('❌ Error al actualizar combo:', error);
    res.status(400).json({ message: 'Error al actualizar el combo', error: error.message });
  }
});

// DELETE eliminar combo (solo admin)
router.delete('/:id', auth.protect, isAdmin, async (req, res) => {
  try {
    const combo = await Combo.findByIdAndDelete(req.params.id);
    
    if (!combo) {
      return res.status(404).json({ message: 'Combo no encontrado' });
    }
    
    res.json({ message: 'Combo eliminado exitosamente', combo });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el combo', error: error.message });
  }
});

// GET combos destacados
router.get('/featured/list', async (req, res) => {
  try {
    const combos = await Combo.find({ featured: true, inStock: true })
      .populate('products.productId')
      .limit(10);
    res.json(combos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener combos destacados', error: error.message });
  }
});

module.exports = router;
