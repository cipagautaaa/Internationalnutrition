const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Seguridad adicional admin: PIN hash y flag
  adminPinHash: {
    type: String,
    default: null
  },
  adminPinEnabled: {
    type: Boolean,
    default: false
  },
  // Intentos y bloqueo temporal del PIN admin
  adminPinAttempts: {
    type: Number,
    default: 0
  },
  adminPinLockedUntil: {
    type: Date,
    default: null
  },
  // Direcciones guardadas
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  // Información de envío predeterminada
  shippingInfo: {
    fullName: {
      type: String,
      trim: true,
      default: ''
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    street: {
      type: String,
      trim: true,
      default: ''
    },
    addressLine2: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    region: {
      type: String,
      trim: true,
      default: ''
    },
    zipCode: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: 'Colombia'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
