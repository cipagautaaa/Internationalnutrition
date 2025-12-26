const express = require('express');
const router = express.Router();
const DiscountCode = require('../models/DiscountCode');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// =====================================================
// RUTAS PÚBLICAS
// =====================================================

/**
 * POST /api/discount-codes/validate
 * Valida un código de descuento y devuelve los porcentajes si es válido
 * Body: { code: string }
 */
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Código de descuento requerido'
      });
    }

    const discountCode = await DiscountCode.findOne({ 
      code: code.trim().toUpperCase() 
    });

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: 'Código inválido o no existe'
      });
    }

    // Verificar si el código es válido (activo, no expirado, no agotado)
    if (!discountCode.isValid()) {
      let message = 'Código inválido';
      if (!discountCode.isActive) {
        message = 'Este código está desactivado';
      } else if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
        message = 'Este código ha expirado';
      } else if (discountCode.maxUses !== null && discountCode.usageCount >= discountCode.maxUses) {
        message = 'Este código ha alcanzado su límite de usos';
      }
      return res.status(400).json({
        success: false,
        message
      });
    }

    return res.json({
      success: true,
      discountCode: {
        code: discountCode.code,
        productDiscount: discountCode.productDiscount,
        comboDiscount: discountCode.comboDiscount,
        description: discountCode.description
      }
    });

  } catch (error) {
    console.error('Error validando código de descuento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al validar el código'
    });
  }
});

// =====================================================
// RUTAS DE ADMINISTRADOR (CRUD)
// =====================================================

/**
 * GET /api/discount-codes
 * Lista todos los códigos de descuento (solo admin)
 */
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const discountCodes = await DiscountCode.find()
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      discountCodes
    });

  } catch (error) {
    console.error('Error obteniendo códigos de descuento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los códigos de descuento'
    });
  }
});

/**
 * GET /api/discount-codes/:id
 * Obtiene un código de descuento por ID (solo admin)
 */
router.get('/:id', protect, isAdmin, async (req, res) => {
  try {
    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: 'Código de descuento no encontrado'
      });
    }

    return res.json({
      success: true,
      discountCode
    });

  } catch (error) {
    console.error('Error obteniendo código de descuento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el código de descuento'
    });
  }
});

/**
 * POST /api/discount-codes
 * Crea un nuevo código de descuento (solo admin)
 */
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { 
      code, 
      productDiscount, 
      comboDiscount, 
      isActive, 
      description,
      maxUses,
      expiresAt 
    } = req.body;

    // Verificar que el código no exista
    const existing = await DiscountCode.findOne({ 
      code: code?.trim().toUpperCase() 
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un código con ese nombre'
      });
    }

    const discountCode = await DiscountCode.create({
      code: code?.trim().toUpperCase(),
      productDiscount: Number(productDiscount) || 0,
      comboDiscount: Number(comboDiscount) || 0,
      isActive: isActive !== false,
      description: description?.trim() || '',
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    return res.status(201).json({
      success: true,
      message: 'Código de descuento creado exitosamente',
      discountCode
    });

  } catch (error) {
    console.error('Error creando código de descuento:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al crear el código de descuento'
    });
  }
});

/**
 * PUT /api/discount-codes/:id
 * Actualiza un código de descuento (solo admin)
 */
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { 
      code, 
      productDiscount, 
      comboDiscount, 
      isActive, 
      description,
      maxUses,
      expiresAt 
    } = req.body;

    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: 'Código de descuento no encontrado'
      });
    }

    // Si se está cambiando el código, verificar que no exista otro con ese nombre
    if (code && code.trim().toUpperCase() !== discountCode.code) {
      const existing = await DiscountCode.findOne({ 
        code: code.trim().toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro código con ese nombre'
        });
      }
      discountCode.code = code.trim().toUpperCase();
    }

    // Actualizar campos
    if (productDiscount !== undefined) {
      discountCode.productDiscount = Number(productDiscount);
    }
    if (comboDiscount !== undefined) {
      discountCode.comboDiscount = Number(comboDiscount);
    }
    if (isActive !== undefined) {
      discountCode.isActive = isActive;
    }
    if (description !== undefined) {
      discountCode.description = description?.trim() || '';
    }
    if (maxUses !== undefined) {
      discountCode.maxUses = maxUses ? Number(maxUses) : null;
    }
    if (expiresAt !== undefined) {
      discountCode.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    await discountCode.save();

    return res.json({
      success: true,
      message: 'Código de descuento actualizado exitosamente',
      discountCode
    });

  } catch (error) {
    console.error('Error actualizando código de descuento:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el código de descuento'
    });
  }
});

/**
 * DELETE /api/discount-codes/:id
 * Elimina un código de descuento (solo admin)
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: 'Código de descuento no encontrado'
      });
    }

    await discountCode.deleteOne();

    return res.json({
      success: true,
      message: 'Código de descuento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando código de descuento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el código de descuento'
    });
  }
});

/**
 * PATCH /api/discount-codes/:id/toggle
 * Activa/desactiva un código de descuento (solo admin)
 */
router.patch('/:id/toggle', protect, isAdmin, async (req, res) => {
  try {
    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: 'Código de descuento no encontrado'
      });
    }

    discountCode.isActive = !discountCode.isActive;
    await discountCode.save();

    return res.json({
      success: true,
      message: `Código ${discountCode.isActive ? 'activado' : 'desactivado'} exitosamente`,
      discountCode
    });

  } catch (error) {
    console.error('Error alternando estado del código:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del código'
    });
  }
});

module.exports = router;
