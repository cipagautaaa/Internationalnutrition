const mongoose = require('mongoose');

// Categorías nuevas y legacy (compatibilidad transitoria)
const NEW_CATEGORIES = [
  'Proteínas',
  'Pre-entrenos y Quemadores',
  'Pre-entrenos y Energía',
  'Creatinas',
  'Aminoácidos y Recuperadores',
  'Salud y Bienestar',
  'Comidas con proteína'
];

const LEGACY_CATEGORIES = [
  'Proteínas',
  'Creatina',
  'Aminoácidos',
  'Pre-Workout',
  'Vitaminas',
  'Para la salud',
  'Complementos',
  'Rendimiento hormonal',
  'Comida'
];

const ALLOWED_CATEGORIES = Array.from(new Set([...NEW_CATEGORIES, ...LEGACY_CATEGORIES]));

// Tipos/subcategorías permitidas por categoría (no obligatorio)
const ALLOWED_TIPOS_BY_CATEGORY = {
  // Proteínas
  'Proteínas': ['Proteínas limpias', 'Proteínas hipercalóricas', 'Proteínas veganas', 'Limpia', 'Hipercalórica', 'Vegana'],
  // Creatinas (nuevo y legacy)
  'Creatina': ['Monohidratadas', 'HCL', 'Complejos de creatina', 'Monohidrato'],
  'Creatinas': ['Monohidratadas', 'HCL', 'Complejos de creatina', 'Monohidrato'],
  // Pre-entrenos y Quemadores (fusiona pre-workout/termogénicos/energizantes)
  'Pre-entrenos y Quemadores': ['Pre-entrenos', 'Quemadores de grasa', 'Energizantes y bebidas', 'Termogénicos con cafeína'],
  'Pre-entrenos y Energía': ['Pre-entrenos', 'Quemadores de grasa', 'Energizantes y bebidas', 'Termogénicos con cafeína'],
  'Pre-Workout': ['Pre-entrenos', 'Quemadores de grasa', 'Energizantes y bebidas', 'Termogénicos con cafeína'],
  // Aminoácidos y Recuperadores
  'Aminoácidos': ['BCAA y EAA', 'Glutamina', 'Mezclas aminoácidas', 'Carbohidratos post-entreno'],
  'Aminoácidos y Recuperadores': ['BCAA y EAA', 'Glutamina', 'Mezclas aminoácidas', 'Carbohidratos post-entreno'],
  // Salud y Bienestar (fusiona vitaminas, salud y rendimiento hormonal)
  'Vitaminas': ['Multivitamínicos', 'Vitaminas y minerales', 'Colágeno, omega y antioxidantes', 'Adaptógenos y suplementos naturales', 'Precursores de testosterona', 'Potenciadores masculinos naturales'],
  'Para la salud': ['Multivitamínicos', 'Vitaminas y minerales', 'Colágeno, omega y antioxidantes', 'Adaptógenos y suplementos naturales', 'Precursores de testosterona', 'Potenciadores masculinos naturales'],
  'Salud y Bienestar': ['Multivitamínicos', 'Vitaminas y minerales', 'Colágeno, omega y antioxidantes', 'Adaptógenos y suplementos naturales', 'Precursores de testosterona', 'Potenciadores masculinos naturales'],
  'Complementos': ['Multivitamínicos', 'Vitaminas y minerales', 'Colágeno, omega y antioxidantes', 'Adaptógenos y suplementos naturales', 'Precursores de testosterona', 'Potenciadores masculinos naturales'],
  'Rendimiento hormonal': ['Multivitamínicos', 'Vitaminas y minerales', 'Colágeno, omega y antioxidantes', 'Adaptógenos y suplementos naturales', 'Precursores de testosterona', 'Potenciadores masculinos naturales'],
  // Comidas con proteína (nuevo y legacy)
  'Comida': ['Pancakes y mezclas', 'Barras y galletas proteicas', 'Snacks funcionales'],
  'Comidas con proteína': ['Pancakes y mezclas', 'Barras y galletas proteicas', 'Snacks funcionales']
};

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  originalPrice: {
    type: Number,
    min: [0, 'El precio original no puede ser negativo'],
    default: null
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ALLOWED_CATEGORIES
  },
  // Tipo/Subcategoría (opcional). Si existe lista de permitidos, se valida; si no, se acepta libre.
  tipo: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        const allowed = ALLOWED_TIPOS_BY_CATEGORY[this.category];
        if (!value) return true; // opcional
        if (Array.isArray(allowed)) return allowed.includes(value);
        return true;
      },
      message: 'Tipo no válido para la categoría seleccionada'
    }
  },
  // Tamaño principal del producto (ej: "4 libras", "400g", "30 serv")
  size: {
    type: String,
    required: [true, 'El tamaño es requerido']
  },
  image: {
    type: String,
    required: [true, 'La imagen es requerida']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'La calificación no puede ser menor a 0'],
    max: [5, 'La calificación no puede ser mayor a 5']
  },
  // Sabores opcionales. Si length <= 1 no se muestra selector de sabor.
  flavors: [{ type: String, trim: true }],
  // Campos para productos destacados
  featured: {
    type: Boolean,
    default: false
  },
  featuredPosition: {
    type: Number,
    default: null,
    min: [0, 'La posición no puede ser negativa']
  },
  sales: {
    type: Number,
    default: 0,
    min: [0, 'Las ventas no pueden ser negativas']
  },
  familyId: {
    type: String,
    index: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  // Referencia opcional cuando este producto es una variante de otro
  variantOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  // Indica si es el producto principal que se mostrará en la tarjeta
  isPrimary: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas y filtros frecuentes
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Normalizar sabores e IDs familiares antes de guardar
productSchema.pre('save', function(next) {
  if (!this.familyId) {
    this.familyId = this._id ? this._id.toString() : new mongoose.Types.ObjectId().toString();
  }

  if (!Array.isArray(this.flavors) || this.flavors.length === 0) {
    this.flavors = ['Sin sabor'];
  } else {
    const cleanFlavors = this.flavors
      .map(f => (typeof f === 'string' ? f.trim() : ''))
      .filter(Boolean);
    this.flavors = cleanFlavors.length > 0 ? Array.from(new Set(cleanFlavors)) : ['Sin sabor'];
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);
