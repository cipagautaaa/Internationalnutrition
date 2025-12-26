const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'El código de descuento es requerido'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'El código debe tener al menos 3 caracteres'],
    maxlength: [30, 'El código no puede tener más de 30 caracteres']
  },
  productDiscount: {
    type: Number,
    required: [true, 'El descuento para productos es requerido'],
    min: [0, 'El descuento no puede ser negativo'],
    max: [100, 'El descuento no puede superar el 100%'],
    default: 0
  },
  comboDiscount: {
    type: Number,
    required: [true, 'El descuento para combos es requerido'],
    min: [0, 'El descuento no puede ser negativo'],
    max: [100, 'El descuento no puede superar el 100%'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'La descripción no puede tener más de 200 caracteres']
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number,
    default: null  // null = sin límite de usos
  },
  expiresAt: {
    type: Date,
    default: null  // null = sin fecha de expiración
  }
}, {
  timestamps: true
});

// Nota: No se necesita índice adicional porque `unique: true` ya lo crea

// Método para verificar si el código es válido (activo, no expirado, no excedido)
discountCodeSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  
  // Verificar expiración
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  
  // Verificar límite de usos
  if (this.maxUses !== null && this.usageCount >= this.maxUses) return false;
  
  return true;
};

// Método para incrementar el contador de uso
discountCodeSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
};

// Virtual para obtener el estado legible
discountCodeSchema.virtual('status').get(function() {
  if (!this.isActive) return 'Inactivo';
  if (this.expiresAt && new Date() > this.expiresAt) return 'Expirado';
  if (this.maxUses !== null && this.usageCount >= this.maxUses) return 'Agotado';
  return 'Activo';
});

// Asegurar que los virtuals se incluyan en JSON
discountCodeSchema.set('toJSON', { virtuals: true });
discountCodeSchema.set('toObject', { virtuals: true });

const DiscountCode = mongoose.model('DiscountCode', discountCodeSchema);

module.exports = DiscountCode;
