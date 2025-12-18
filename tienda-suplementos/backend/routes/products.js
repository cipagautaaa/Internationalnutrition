const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/uploadR2');

const IMPLEMENTS_LABEL = 'Wargo y accesorios para gym';

// --- Utilidades de taxonomía ---
const NEW_TAXONOMY = [
  'Proteínas',
  'Pre-entrenos y Quemadores',
  'Creatinas',
  'Aminoácidos y Recuperadores',
  'Salud y Bienestar',
  'Alimentacion saludable y alta en proteina',
  IMPLEMENTS_LABEL
];

const ensureFlavors = (flavorsInput) => {
  if (!Array.isArray(flavorsInput)) return ['Sin sabor'];
  const clean = flavorsInput
    .map(f => (typeof f === 'string' ? f.trim() : ''))
    .filter(Boolean);
  if (clean.length === 0) return ['Sin sabor'];
  return Array.from(new Set(clean));
};

const coerceNumber = (value, fallback = undefined) => {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const coerceBoolean = (value, fallback = true) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (lowered === 'true') return true;
    if (lowered === 'false') return false;
  }
  return Boolean(value);
};

const toPlainObject = (doc) => (doc && typeof doc.toObject === 'function' ? doc.toObject() : doc);

const buildFamilyResponse = (primaryDoc, variantDocs = []) => {
  if (!primaryDoc) return null;
  const primary = toPlainObject(primaryDoc);
  const variants = variantDocs
    .filter(Boolean)
    .map(doc => {
      const variant = toPlainObject(doc);
      return {
        _id: variant._id,
        name: variant.name,
        description: variant.description,
        price: variant.price,
        originalPrice: variant.originalPrice,
        size: variant.size,
        image: variant.image,
        inStock: variant.inStock !== false,
        isActive: variant.isActive !== false,
        familyId: variant.familyId,
        variantOf: variant.variantOf,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt
      };
    })
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });

  primary.baseSize = primary.size; // compatibilidad con frontend existente
  primary.inStock = primary.inStock !== false;
  primary.isActive = primary.isActive !== false;
  primary.familyId = primary.familyId || (primary._id ? primary._id.toString() : undefined);
  primary.variants = variants;
  primary.flavors = ensureFlavors(primary.flavors);

  return primary;
};

const groupProductsByFamily = (products) => {
  const groups = new Map();

  for (const doc of products) {
    const familyId = doc.familyId || (doc._id ? doc._id.toString() : new mongoose.Types.ObjectId().toString());
    if (!groups.has(familyId)) {
      groups.set(familyId, { primary: null, variants: [] });
    }
    const entry = groups.get(familyId);
    if (doc.isPrimary || !entry.primary) {
      if (entry.primary) {
        entry.variants.push(entry.primary);
      }
      entry.primary = doc;
    } else {
      entry.variants.push(doc);
    }
  }

  return Array.from(groups.values())
    .map(({ primary, variants }) => buildFamilyResponse(primary, variants.filter(v => !v.isPrimary)) )
    .filter(Boolean);
};

const sortAggregatedProducts = (products, sortParam = '-createdAt') => {
  if (!Array.isArray(products) || products.length === 0) return [];
  const sortFields = String(sortParam)
    .split(',')
    .map(token => token.trim())
    .filter(Boolean);

  const comparator = (a, b, field, direction) => {
    const fieldA = a?.[field];
    const fieldB = b?.[field];
    if (fieldA === fieldB) return 0;
    if (fieldA === undefined || fieldA === null) return direction === 'asc' ? -1 : 1;
    if (fieldB === undefined || fieldB === null) return direction === 'asc' ? 1 : -1;
    if (fieldA > fieldB) return direction === 'asc' ? 1 : -1;
    if (fieldA < fieldB) return direction === 'asc' ? -1 : 1;
    return 0;
  };

  const fields = sortFields.length ? sortFields : ['-createdAt'];

  return [...products].sort((a, b) => {
    for (const rawField of fields) {
      const direction = rawField.startsWith('-') ? 'desc' : 'asc';
      const field = rawField.replace(/^[-+]/, '');
      const result = comparator(a, b, field, direction);
      if (result !== 0) return result;
    }
    return 0;
  });
};

const paginateAggregated = (items, page = 1, limit = 20) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;
  const slice = items.slice(start, end);
  return {
    page: safePage,
    limit: safeLimit,
    pages: Math.max(1, Math.ceil(items.length / safeLimit)),
    total: items.length,
    hasNext: end < items.length,
    hasPrev: safePage > 1,
    data: slice
  };
};

const normalizeCategory = (c) => {
  const cat = (c || '').trim();
  const map = {
    'Pre-Workout': 'Pre-entrenos y Quemadores',
    'Pre-entrenos y Energía': 'Pre-entrenos y Quemadores',
    'Aminoácidos': 'Aminoácidos y Recuperadores',
    'Vitaminas': 'Salud y Bienestar',
    'Para la salud': 'Salud y Bienestar',
    'Rendimiento hormonal': 'Salud y Bienestar',
    'Complementos': 'Salud y Bienestar',
    'Comida': 'Alimentacion saludable y alta en proteina',
    'Creatina': 'Creatinas',
    // Nuevas (ya normalizadas)
    'Proteínas': 'Proteínas',
    'Pre-entrenos y Quemadores': 'Pre-entrenos y Quemadores',
    'Creatinas': 'Creatinas',
    'Aminoácidos y Recuperadores': 'Aminoácidos y Recuperadores',
    'Salud y Bienestar': 'Salud y Bienestar',
    'Comidas con proteína': 'Alimentacion saludable y alta en proteina',
    'Alimentacion saludable y alta en proteina': 'Alimentacion saludable y alta en proteina',
    // Implementos
    'Implementos': IMPLEMENTS_LABEL,
    'implementos': IMPLEMENTS_LABEL,
    [IMPLEMENTS_LABEL]: IMPLEMENTS_LABEL,
  };
  return map[cat] || cat || 'Sin categoría';
};

// POST /api/products/upload-image (subir imagen) - admin
router.post('/upload-image', protect, isAdmin, upload.single('image', { folder: 'suplementos/productos' }), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
    }

    // Retornar la URL pública en Cloudflare R2
    const imageUrl = req.file.path || req.file.url;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Imagen subida exitosamente a Cloudflare R2'
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al subir la imagen' });
  }
});

// GET /api/products/admin/category-summary (resumen normalizado por nueva taxonomía) - admin
router.get('/admin/category-summary', protect, isAdmin, async (req, res) => {
  try {
    const Implement = require('../models/Implement');
    const products = await Product.find({}).select('category isActive inStock');

    const summaryMap = new Map();
    // Inicializar con 0 para todas las categorías nuevas
    for (const cat of NEW_TAXONOMY) {
      summaryMap.set(cat, { category: cat, total: 0, active: 0, inactive: 0, outOfStock: 0 });
    }

    for (const p of products) {
      const cat = normalizeCategory(p.category);
      if (!summaryMap.has(cat)) {
        summaryMap.set(cat, { category: cat, total: 0, active: 0, inactive: 0, outOfStock: 0 });
      }
      const row = summaryMap.get(cat);
      row.total += 1;
      if (p.isActive === true) row.active += 1; else if (p.isActive === false) row.inactive += 1;
      if (p.inStock === false) row.outOfStock += 1;
    }

    // Agregar conteo de Wargo y accesorios para gym
    const implements = await Implement.find({}).select('isActive');
    const implementsActive = implements.filter(i => i.isActive === true).length;
    const implementsInactive = implements.filter(i => i.isActive === false).length;
    summaryMap.set(IMPLEMENTS_LABEL, {
      category: IMPLEMENTS_LABEL,
      total: implements.length,
      active: implementsActive,
      inactive: implementsInactive,
      outOfStock: 0
    });

    // Ordenar según la nueva taxonomía, dejando al final cualquier categoría no reconocida
    const data = Array.from(summaryMap.values()).sort((a, b) => {
      const ia = NEW_TAXONOMY.indexOf(a.category);
      const ib = NEW_TAXONOMY.indexOf(b.category);
      return (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib);
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error en category-summary:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el resumen de categorías' });
  }
});

// ===== RUTAS PARA PRODUCTOS DESTACADOS (ANTES DE /:id) =====

// GET /api/products/featured - Obtener productos destacados
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true })
      .sort({ featuredPosition: 1 })
      .limit(4);
    
    // Crear un array de 4 posiciones garantizadas
    const slots = [null, null, null, null];
    
    // Llenar las posiciones con los productos destacados
    featuredProducts.forEach(product => {
      const position = product.featuredPosition || 0;
      if (position >= 0 && position < 4) {
        slots[position] = product;
      }
    });
    
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products/featured - Agregar producto a destacados (admin)
router.post('/featured', protect, isAdmin, async (req, res) => {
  try {
    const { productId, position } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID es requerido' });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const targetPosition = position !== undefined ? position : 0;

    if (product.featured) {
      const updated = await Product.findByIdAndUpdate(
        productId,
        { featuredPosition: targetPosition },
        { new: true, runValidators: false }
      );
      return res.json({ success: true, data: updated });
    }

    if (position !== undefined) {
      await Product.updateMany(
        { featured: true, featuredPosition: position },
        { $set: { featured: false, featuredPosition: null } }
      );
    }

    const updated = await Product.findByIdAndUpdate(
      productId,
      { featured: true, featuredPosition: targetPosition },
      { new: true, runValidators: false }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/featured/:id - Remover producto de destacados (admin)
router.delete('/featured/:id', protect, isAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { featured: false, featuredPosition: null },
      { new: true, runValidators: false }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    res.json({ success: true, message: 'Producto removido de destacados', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// GET /api/products  (listado con filtros / paginación / búsqueda)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sort = '-createdAt',
      includeInactive = 'false',
      flat = 'false'
    } = req.query;

    const query = {};
    if (category) {
      // Aceptar alias/legados y normalizar categorías para mayor tolerancia
      const canonical = normalizeCategory(category);
      const CATEGORY_ALIASES = {
        'Proteínas': ['Proteinas', 'Proteina'],
        'Pre-entrenos y Quemadores': ['Pre-Workout', 'Pre workout', 'Pre entrenos', 'Pre entrenos y energia', 'Pre entrenos y energía'],
        'Creatinas': ['Creatina'],
        'Aminoácidos y Recuperadores': ['Aminoácidos', 'Aminoacidos y recuperadores'],
        'Salud y Bienestar': ['Vitaminas', 'Para la salud', 'Rendimiento hormonal', 'Complementos'],
        'Alimentacion saludable y alta en proteina': ['Comida', 'Comidas con proteina', 'Comidas con proteína']
      };
      const candidates = Array.from(new Set([
        canonical,
        String(category).trim(),
        ...((CATEGORY_ALIASES[canonical] || []))
      ])).filter(Boolean);
      query.category = { $in: candidates };
    }
    if (includeInactive !== 'true') {
      query.$or = [
        { isActive: true },
        { isActive: { $exists: false } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const rawProducts = await Product.find(query);

    if (flat === 'true') {
      const plain = rawProducts.map(doc => toPlainObject(doc));
      const sortedFlat = sortAggregatedProducts(plain, sort);
      const effectiveLimit = Math.min(Number(limit) || 20, 2000);
      const safePage = Math.max(1, Number(page) || 1);
      const start = (safePage - 1) * effectiveLimit;
      const end = start + effectiveLimit;
      const slice = sortedFlat.slice(start, end);

      return res.json({
        success: true,
        data: slice,
        pagination: {
          page: safePage,
          pages: Math.max(1, Math.ceil(sortedFlat.length / effectiveLimit)),
          limit: effectiveLimit,
          total: sortedFlat.length,
          hasNext: end < sortedFlat.length,
          hasPrev: safePage > 1
        }
      });
    }

    const aggregated = groupProductsByFamily(rawProducts);
    const sorted = sortAggregatedProducts(aggregated, sort);
    const effectiveLimit = Math.min(Number(limit) || 20, 2000); // techo defensivo
    const pagination = paginateAggregated(sorted, page, effectiveLimit);

    res.json({
      success: true,
      data: pagination.data,
      pagination: {
        page: pagination.page,
        pages: pagination.pages,
        limit: pagination.limit,
        total: pagination.total,
        hasNext: pagination.hasNext,
        hasPrev: pagination.hasPrev
      }
    });
  } catch (error) {
    console.error('Error listando productos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
});

// GET /api/products/:id (detalle)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isActive === false) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    const familyId = product.familyId || product._id.toString();
    const familyProducts = await Product.find({ familyId });
    const aggregated = groupProductsByFamily(familyProducts).find(p => String(p._id) === String(product._id) || p.familyId === familyId);
    res.json({ success: true, data: aggregated || buildFamilyResponse(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: 'ID inválido' });
  }
});

// POST /api/products (crear) - admin
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const variantsInput = Array.isArray(req.body.variants) ? req.body.variants : [];
    const sharedFlavors = ensureFlavors(req.body.flavors);
    const resolvedSize = (req.body.size || req.body.baseSize || '').trim();

    if (!resolvedSize) {
      return res.status(400).json({ success: false, message: 'El tamaño es requerido' });
    }

    const price = coerceNumber(req.body.price);
    if (price === undefined) {
      return res.status(400).json({ success: false, message: 'El precio es requerido y debe ser numérico' });
    }

    const familyId = new mongoose.Types.ObjectId().toString();

    const basePayload = {
      name: req.body.name,
      description: req.body.description,
      price,
      originalPrice: coerceNumber(req.body.originalPrice, null),
      category: req.body.category,
      tipo: req.body.tipo || undefined,
      image: req.body.image,
      inStock: coerceBoolean(req.body.inStock, true),
      isActive: coerceBoolean(req.body.isActive, true),
      size: resolvedSize,
      flavors: sharedFlavors,
      featured: coerceBoolean(req.body.featured, false),
      featuredPosition: coerceNumber(req.body.featuredPosition, null),
      sales: coerceNumber(req.body.sales, 0) || 0,
      familyId,
      isPrimary: true,
      variantOf: null
    };

    const baseProduct = await Product.create(basePayload);

    const createdVariants = [];
    for (const rawVariant of variantsInput) {
      if (!rawVariant) continue;
      const variantSize = (rawVariant.size || '').trim();
      const variantPrice = coerceNumber(rawVariant.price, basePayload.price);
      if (!variantSize || variantPrice === undefined) continue;

      const variantPayload = {
        name: rawVariant.name?.trim() || basePayload.name,
        description: rawVariant.description?.trim() || basePayload.description,
        price: variantPrice,
        originalPrice: coerceNumber(rawVariant.originalPrice, basePayload.originalPrice ?? null),
        category: basePayload.category,
        tipo: basePayload.tipo,
        image: rawVariant.image?.trim() || basePayload.image,
        inStock: coerceBoolean(rawVariant.inStock, basePayload.inStock),
        isActive: basePayload.isActive,
        size: variantSize,
        flavors: sharedFlavors,
        featured: basePayload.featured,
        featuredPosition: basePayload.featuredPosition,
        sales: basePayload.sales,
        familyId,
        isPrimary: false,
        variantOf: baseProduct._id
      };

      const variantDoc = await Product.create(variantPayload);
      createdVariants.push(variantDoc);
    }

    res.status(201).json({ success: true, data: buildFamilyResponse(baseProduct, createdVariants) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id (actualizar) - admin
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const familyId = existingProduct.familyId || existingProduct._id.toString();
    
    // IMPORTANTE: Si no se envían variantes en el body, solo actualizar este producto individual
    const variantsInput = Array.isArray(req.body.variants) ? req.body.variants : null;
    const isUpdatingWholeFamily = variantsInput !== null;
    
    // Si estamos actualizando solo un producto individual (sin array de variantes)
    if (!isUpdatingWholeFamily) {
      const resolvedSize = (req.body.size || req.body.baseSize || existingProduct.size || '').trim();
      if (!resolvedSize) {
        return res.status(400).json({ success: false, message: 'El tamaño es requerido' });
      }

      const price = coerceNumber(req.body.price, existingProduct.price);
      if (price === undefined) {
        return res.status(400).json({ success: false, message: 'El precio es requerido y debe ser numérico' });
      }

      const sharedFlavors = ensureFlavors(req.body.flavors ?? existingProduct.flavors);

      existingProduct.set({
        name: req.body.name !== undefined ? req.body.name : existingProduct.name,
        description: req.body.description !== undefined ? req.body.description : existingProduct.description,
        price,
        originalPrice: coerceNumber(req.body.originalPrice, existingProduct.originalPrice ?? null),
        category: req.body.category || existingProduct.category,
        tipo: req.body.tipo !== undefined ? req.body.tipo : existingProduct.tipo,
        image: req.body.image !== undefined ? req.body.image : existingProduct.image,
        inStock: coerceBoolean(req.body.inStock, existingProduct.inStock),
        isActive: coerceBoolean(req.body.isActive, existingProduct.isActive),
        size: resolvedSize,
        flavors: sharedFlavors,
        featured: coerceBoolean(req.body.featured, existingProduct.featured),
        featuredPosition: coerceNumber(req.body.featuredPosition, existingProduct.featuredPosition),
        sales: coerceNumber(req.body.sales, existingProduct.sales) || 0
      });

      await existingProduct.save();

      // Devolver la familia completa actualizada
      const updatedFamily = await Product.find({ familyId });
      const aggregated = groupProductsByFamily(updatedFamily).find(p => 
        String(p._id) === String(existingProduct._id) || 
        p.variants?.some(v => String(v._id) === String(existingProduct._id))
      ) || buildFamilyResponse(existingProduct);

      return res.json({ success: true, data: aggregated });
    }

    // Si llegamos aquí, estamos actualizando toda la familia con variantes
    const baseProduct = existingProduct.isPrimary
      ? existingProduct
      : await Product.findOne({ familyId, isPrimary: true }) || existingProduct;

    const sharedFlavors = ensureFlavors(req.body.flavors ?? baseProduct.flavors);
    const resolvedSize = (req.body.size || req.body.baseSize || baseProduct.size || '').trim();
    if (!resolvedSize) {
      return res.status(400).json({ success: false, message: 'El tamaño es requerido' });
    }

    const price = coerceNumber(req.body.price, baseProduct.price);
    if (price === undefined) {
      return res.status(400).json({ success: false, message: 'El precio es requerido y debe ser numérico' });
    }

    baseProduct.set({
      name: req.body.name !== undefined ? req.body.name : baseProduct.name,
      description: req.body.description !== undefined ? req.body.description : baseProduct.description,
      price,
      originalPrice: coerceNumber(req.body.originalPrice, baseProduct.originalPrice ?? null),
      category: req.body.category || baseProduct.category,
      tipo: req.body.tipo !== undefined ? req.body.tipo : baseProduct.tipo,
      image: req.body.image !== undefined ? req.body.image : baseProduct.image,
      inStock: coerceBoolean(req.body.inStock, baseProduct.inStock),
      isActive: coerceBoolean(req.body.isActive, baseProduct.isActive),
      size: resolvedSize,
      flavors: sharedFlavors,
      featured: coerceBoolean(req.body.featured, baseProduct.featured),
      featuredPosition: coerceNumber(req.body.featuredPosition, baseProduct.featuredPosition),
      sales: coerceNumber(req.body.sales, baseProduct.sales) || 0,
      familyId,
      isPrimary: true,
      variantOf: null
    });

    await baseProduct.save();

    const existingVariants = await Product.find({ familyId, _id: { $ne: baseProduct._id } });
    const variantsById = new Map(existingVariants.map(doc => [String(doc._id), doc]));
    const keepIds = new Set();

    for (const rawVariant of variantsInput) {
      if (!rawVariant) continue;
      const variantSize = (rawVariant.size || '').trim();
      const variantPrice = coerceNumber(rawVariant.price, baseProduct.price);
      if (!variantSize || variantPrice === undefined) continue;

      const variantId = rawVariant._id ? String(rawVariant._id) : null;
      const payload = {
        name: rawVariant.name?.trim() || baseProduct.name,
        description: rawVariant.description?.trim() || baseProduct.description,
        price: variantPrice,
        originalPrice: coerceNumber(rawVariant.originalPrice, baseProduct.originalPrice ?? null),
        category: baseProduct.category,
        tipo: baseProduct.tipo,
        image: rawVariant.image?.trim() || baseProduct.image,
        inStock: coerceBoolean(rawVariant.inStock, baseProduct.inStock),
        isActive: baseProduct.isActive,
        size: variantSize,
        flavors: sharedFlavors,
        featured: baseProduct.featured,
        featuredPosition: baseProduct.featuredPosition,
        sales: baseProduct.sales,
        familyId,
        isPrimary: false,
        variantOf: baseProduct._id
      };

      if (variantId && variantsById.has(variantId)) {
        const variantDoc = variantsById.get(variantId);
        variantDoc.set(payload);
        await variantDoc.save();
        keepIds.add(variantId);
      } else {
        const newVariant = await Product.create(payload);
        keepIds.add(String(newVariant._id));
      }
    }

    const idsToDelete = existingVariants
      .filter(doc => !keepIds.has(String(doc._id)))
      .map(doc => doc._id);

    if (idsToDelete.length > 0) {
      await Product.deleteMany({ _id: { $in: idsToDelete } });
    }

    const updatedFamily = await Product.find({ familyId });
    const aggregated = groupProductsByFamily(updatedFamily).find(p => String(p._id) === String(baseProduct._id)) || buildFamilyResponse(baseProduct);

    res.json({ success: true, data: aggregated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id (hard delete) - admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    if (product.isPrimary || product.isPrimary === undefined) {
      // Fallback defensivo: algunos productos legacy pueden no tener familyId persistido
      const familyId = product.familyId || product._id.toString();
      await Product.deleteMany({
        $or: [
          { familyId },
          { variantOf: product._id },
          { _id: product._id }
        ]
      });
      return res.json({
        success: true,
        message: 'Producto y sus variantes eliminados permanentemente',
        data: { _id: product._id, familyId }
      });
    }

    await Product.deleteOne({ _id: product._id });
    res.json({
      success: true,
      message: 'Variante eliminada permanentemente',
      data: { _id: product._id, familyId: product.familyId }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
