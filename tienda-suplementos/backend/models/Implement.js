const mongoose = require('mongoose');

const implementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    size: {
      type: String,
      trim: true,
      default: '',
    },
    sizes: {
      type: [String],
      trim: true,
      default: [],
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/300?text=Implemento'
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Implement', implementSchema);
