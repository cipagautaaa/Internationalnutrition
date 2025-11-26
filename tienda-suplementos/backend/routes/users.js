const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// GET /api/users - listado solo lectura (admin)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { search, limit = 200, page = 1 } = req.query;
    const q = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      q.$or = [ { email: regex }, { firstName: regex }, { lastName: regex } ];
    }
    const numericLimit = Math.min(Number(limit), 500);
    const skip = (Number(page) - 1) * numericLimit;
    const [users, total] = await Promise.all([
      User.find(q)
        .sort('-createdAt')
        .skip(skip)
        .limit(numericLimit)
        .select('email firstName lastName role isEmailVerified lastLogin createdAt'),
      User.countDocuments(q)
    ]);
    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / numericLimit) || 1,
        total
      }
    });
  } catch (err) {
    console.error('Error listando usuarios:', err);
    res.status(500).json({ success: false, message: 'Error listando usuarios' });
  }
});

// GET /api/users/profile - obtener perfil del usuario
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-adminPinHash');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        shippingInfo: user.shippingInfo || {},
        addresses: user.addresses || [],
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo el perfil'
    });
  }
});

// PUT /api/users/profile - actualizar perfil del usuario
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-adminPinHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        shippingInfo: user.shippingInfo || {},
        addresses: user.addresses || []
      }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando el perfil'
    });
  }
});

// PUT /api/users/shipping-info - actualizar información de envío
router.put('/shipping-info', protect, async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      street,
      addressLine2,
      city,
      region,
      zipCode,
      country
    } = req.body;

    const shippingInfo = {
      fullName: fullName?.trim() || '',
      phoneNumber: phoneNumber?.trim() || '',
      street: street?.trim() || '',
      addressLine2: addressLine2?.trim() || '',
      city: city?.trim() || '',
      region: region?.trim() || '',
      zipCode: zipCode?.trim() || '',
      country: country?.trim() || 'Colombia'
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { shippingInfo },
      { new: true, runValidators: true }
    ).select('-adminPinHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Información de envío actualizada exitosamente',
      shippingInfo: user.shippingInfo
    });
  } catch (error) {
    console.error('Error actualizando información de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando la información de envío'
    });
  }
});

module.exports = router;