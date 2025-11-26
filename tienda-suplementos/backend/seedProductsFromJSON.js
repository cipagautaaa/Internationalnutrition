// backend/seedProductsFromJSON.js
// Script mejorado para poblar la base de datos desde archivo JSON
// Uso: npm run seed:json [opciones]
// Opciones: --clean (limpiar antes), --category="Proteínas" (solo una categoría)

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Función para normalizar categorías (coincide con el backend)
const normalizeCategory = (c) => {
  const cat = (c || '').trim();
  const map = {
    'Pre-Workout': 'Pre-entrenos y Quemadores',
    'Aminoácidos': 'Aminoácidos y Recuperadores',
    'Vitaminas': 'Salud y Bienestar',
    'Para la salud': 'Salud y Bienestar',
    'Complementos': 'Salud y Bienestar',
    'Comida': 'Comidas con proteína',
    'Creatina': 'Creatinas',
    // Nuevas (ya normalizadas)
    'Proteínas': 'Proteínas',
    'Pre-entrenos y Quemadores': 'Pre-entrenos y Quemadores',
    'Creatinas': 'Creatinas',
    'Aminoácidos y Recuperadores': 'Aminoácidos y Recuperadores',
    'Salud y Bienestar': 'Salud y Bienestar',
    'Rendimiento hormonal': 'Salud y Bienestar',
    'Comidas con proteína': 'Comidas con proteína'
  };
  return map[cat] || cat || 'Sin categoría';
};

// Función para normalizar tipos según la categoría
const normalizeTipo = (category, rawTipo) => {
  if (!rawTipo) return '';
  
  const tipoUpper = String(rawTipo).trim().toUpperCase();
  const tipoLower = String(rawTipo).trim().toLowerCase();
  
  // Mapping de tipos por categoría (igual que en el backend)
  const tipoMap = {
    'PROTEÍNAS': {
      'PROTEÍNAS LIMPIAS': 'Proteínas limpias',
      'LIMPIA': 'Proteínas limpias',
      'PROTEÍNA LIMPIA': 'Proteínas limpias',
      'PROTEINAS LIMPIAS': 'Proteínas limpias',
      'PROTEÍNAS HIPERCALÓRICAS': 'Proteínas hipercalóricas',
      'HIPERCALÓRICA': 'Proteínas hipercalóricas',
      'HIPERCALORICA': 'Proteínas hipercalóricas',
      'PROTEÍNA HIPERCALÓRICA': 'Proteínas hipercalóricas',
      'PROTEÍNAS VEGANAS': 'Proteínas veganas',
      'VEGANA': 'Proteínas veganas',
      'PROTEÍNA VEGANA': 'Proteínas veganas'
    },
    'CREATINAS': {
      'MONOHIDRATADAS': 'Monohidratadas',
      'MONOHIDRATO': 'Monohidratadas',
      'HCL': 'HCL',
      'CREATINA HCL': 'HCL'
    },
    'PRE-ENTRENOS Y QUEMADORES': {
      'PRE-ENTRENOS': 'Pre-entrenos',
      'PRE ENTRENO': 'Pre-entrenos',
      'QUEMADORES DE GRASA': 'Quemadores de grasa',
      'QUEMADOR': 'Quemadores de grasa'
    }
  };
  
  const categoryUpper = normalizeCategory(category).toUpperCase();
  const categoryMap = tipoMap[categoryUpper];
  
  if (categoryMap && categoryMap[tipoUpper]) {
    return categoryMap[tipoUpper];
  }
  
  return rawTipo.trim();
};

const stripAccents = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[^\w\s./-]/g, '')
    .replace(/[\u0300-\u036f]/g, '');

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.,-]/g, '').replace(',', '.');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const computeSizeScore = (rawSize) => {
  if (!rawSize) return 1;
  const normalized = stripAccents(String(rawSize)).toLowerCase().replace(/,/g, '.');
  const patterns = [
    { regex: /(?:(\d+(?:\.\d+)?))\s*(kg|kilo|kilogramo|kilogramos|kgs?)/g, multiplier: 1000 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(lb|lbs|libras?)/g, multiplier: 453.592 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(oz|onzas?)/g, multiplier: 28.3495 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(g|gr|gramos?)/g, multiplier: 1 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(mg|miligramos?)/g, multiplier: 0.001 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(l|lt|litros?)/g, multiplier: 1000 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(ml|mililitros?)/g, multiplier: 1 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(servicios?|servings?|serv|scoops?)/g, multiplier: 10 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(capsulas?|caps|softgels?|tabletas?|tab|gomitas?|gummies|pills?|pastillas?|unid(?:ades?)?)/g, multiplier: 1 },
    { regex: /(?:(\d+(?:\.\d+)?))\s*(packs?|sobres?|sticks?)/g, multiplier: 1 }
  ];

  let best = 0;
  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    let match;
    while ((match = pattern.regex.exec(normalized)) !== null) {
      const value = parseFloat(match[1]);
      if (!Number.isFinite(value)) continue;
      const score = value * pattern.multiplier;
      if (score > best) best = score;
    }
  }

  if (best > 0) return best;
  const fallback = normalized.match(/(\d+(?:\.\d+)?)/);
  if (fallback) {
    const value = parseFloat(fallback[1]);
    if (Number.isFinite(value)) return value;
  }
  return 1;
};

const pushVariant = (store, variant, fallbackImage, fallbackInStock) => {
  if (!variant) return;
  const sizeLabel = typeof variant.size === 'string' ? variant.size.trim() : '';
  if (!sizeLabel) return;

  const price = toNumber(variant.price);
  if (price === null) return;

  const key = stripAccents(sizeLabel).toLowerCase().replace(/\s+/g, ' ').trim();
  if (!key) return;

  const originalPrice = toNumber(variant.originalPrice);
  const stockNumber = typeof variant.stock === 'number' ? variant.stock : null;
  const fallback = fallbackInStock !== false;
  const explicitInStock = variant.inStock !== undefined ? variant.inStock !== false : null;
  const inStock = stockNumber !== null ? stockNumber > 0 : (explicitInStock !== null ? explicitInStock : fallback);

  const candidate = {
    size: sizeLabel,
    price,
    originalPrice,
    image: variant.image || fallbackImage || '/placeholder-product.png',
    inStock,
    score: computeSizeScore(sizeLabel)
  };

  const existing = store.get(key);
  if (!existing) {
    store.set(key, candidate);
    return;
  }

  existing.price = candidate.price;
  if (candidate.originalPrice !== null && candidate.originalPrice !== undefined) {
    existing.originalPrice = candidate.originalPrice;
  }
  if (candidate.image && (!existing.image || existing.image === '/placeholder-product.png')) {
    existing.image = candidate.image;
  }
  existing.inStock = existing.inStock || candidate.inStock;
  existing.score = Math.max(existing.score, candidate.score);
};

const groupIntoFamilies = (products) => {
  const groups = new Map();

  for (const product of products) {
    const key = stripAccents(product.name || '').toLowerCase().trim();
    if (!key) {
      console.warn('⚠️  Producto sin nombre detectado. Se omite.');
      continue;
    }
    if (!groups.has(key)) {
      groups.set(key, { displayName: product.name ? product.name.trim() : 'Producto sin nombre', items: [] });
    }
    groups.get(key).items.push(product);
  }

  const families = [];

  for (const { displayName, items } of groups.values()) {
    if (!items.length) continue;
    const baseMeta = items[0];
    const category = baseMeta.category;
    if (!category) {
      console.warn(`⚠️  Producto "${displayName}" sin categoría. Omitido.`);
      continue;
    }

    const variantsStore = new Map();
    const flavorsSet = new Set();
    let featured = false;
    let featuredPosition = null;
    let sales = 0;
    let isActive = false;
    let description = baseMeta.description || 'Descripción pendiente';
    const tipo = baseMeta.tipo || baseMeta.productType || '';

    items.forEach((item) => {
      if (item.description && item.description.length > description.length) {
        description = item.description;
      }

      const fallbackImage = item.image || (Array.isArray(item.images) && item.images[0]) || '/placeholder-product.png';
      const fallbackStock = item.inStock !== false;

      pushVariant(
        variantsStore,
        {
          size: item.baseSize || item.size || '1 unidad',
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
          inStock: item.inStock,
          stock: item.stock
        },
        fallbackImage,
        fallbackStock
      );

      if (Array.isArray(item.variants)) {
        item.variants.forEach((variant) => {
          pushVariant(variantsStore, variant, fallbackImage, fallbackStock);
        });
      }

      if (Array.isArray(item.flavors)) {
        item.flavors.forEach((flavor) => {
          if (typeof flavor !== 'string') return;
          const trimmed = flavor.trim();
          if (trimmed) flavorsSet.add(trimmed);
        });
      }

      featured = featured || item.featured === true;
      if (item.featuredPosition !== undefined && item.featuredPosition !== null) {
        featuredPosition = item.featuredPosition;
      }
      if (typeof item.sales === 'number' && item.sales > sales) {
        sales = item.sales;
      }
      if (item.isActive !== false) {
        isActive = true;
      }
    });

    const variantsArr = Array.from(variantsStore.values());
    if (!variantsArr.length) {
      console.warn(`⚠️  Producto "${displayName}" omitido: no se encontraron variantes con precio.`);
      continue;
    }

    variantsArr.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.price || 0) - (a.price || 0);
    });

    const [primaryVariant, ...rest] = variantsArr;
    if (!primaryVariant || primaryVariant.price === null) {
      console.warn(`⚠️  Producto "${displayName}" omitido: variante principal sin precio válido.`);
      continue;
    }

    const base = {
      size: primaryVariant.size,
      price: primaryVariant.price,
      originalPrice: primaryVariant.originalPrice,
      image: primaryVariant.image || '/placeholder-product.png',
      inStock: primaryVariant.inStock !== false
    };

    const variants = rest.map(({ size, price, originalPrice, image, inStock }) => ({
      size,
      price,
      originalPrice,
      image: image || '/placeholder-product.png',
      inStock: inStock !== false
    }));

    families.push({
      name: displayName,
      category,
      description,
      tipo,
      flavors: flavorsSet.size ? Array.from(flavorsSet) : ['Sin sabor'],
      featured,
      featuredPosition,
      sales,
      isActive,
      base,
      variants
    });
  }

  return families;
};

async function seedProducts() {
  try {
  // Conectar a MongoDB (respetando MONGODB_DB_NAME si está definido)
  const mongoOptions = {};
  if (process.env.MONGODB_DB_NAME) mongoOptions.dbName = process.env.MONGODB_DB_NAME;
  await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Conectado a MongoDB');

    // Leer archivo JSON
    const jsonPath = path.join(__dirname, 'data', 'products.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró el archivo data/products.json');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let productsToInsert = data.products || [];

    // Normalizar categorías
      // Normalizar categorías y asegurar campos obligatorios (baseSize, image, price)
      productsToInsert = productsToInsert.map((raw) => {
        const product = { ...raw };
        product.category = normalizeCategory(product.category);

        const normalizedPrice = toNumber(product.price);
        product.price = normalizedPrice !== null ? normalizedPrice : null;
        const normalizedOriginalPrice = toNumber(product.originalPrice);
        product.originalPrice = normalizedOriginalPrice !== null ? normalizedOriginalPrice : null;

        product.baseSize = product.baseSize || product.size || (Array.isArray(product.variants) && product.variants[0] && product.variants[0].size) || '1 unidad';
        const fallbackImage = product.image || (Array.isArray(product.images) && product.images[0]) || '/placeholder-product.png';
        product.image = fallbackImage;
        product.tipo = normalizeTipo(product.category, product.tipo || product.productType || '');
        product.inStock = product.inStock !== false;
        product.isActive = product.isActive !== false;

        if (Array.isArray(product.variants)) {
          product.variants = product.variants
            .map((variant) => ({
              size: variant.size || product.baseSize || '1 unidad',
              price: toNumber(variant.price),
              originalPrice: toNumber(variant.originalPrice),
              image: variant.image || fallbackImage,
              inStock: variant.inStock !== false,
              stock: typeof variant.stock === 'number' ? variant.stock : null
            }))
            .filter((variant) => variant.size && variant.price !== null);
        }

        if (Array.isArray(product.flavors)) {
          const cleanFlavors = product.flavors
            .filter((flavor) => typeof flavor === 'string' && flavor.trim() !== '')
            .map((flavor) => flavor.trim());
          product.flavors = Array.from(new Set(cleanFlavors));
        }

        return product;
      });

    // Procesar argumentos de línea de comandos
    const args = process.argv.slice(2);
    const shouldClean = args.includes('--clean');
    const categoryFilter = args.find(arg => arg.startsWith('--category='))?.split('=')[1];

    // Filtrar por categoría si se especifica
    if (categoryFilter) {
      const normalizedFilter = normalizeCategory(categoryFilter);
      productsToInsert = productsToInsert.filter(p => p.category === normalizedFilter);
      console.log(`🔍 Filtrando productos de categoría: ${normalizedFilter}`);
    }

    console.log(`📦 Productos a procesar: ${productsToInsert.length}`);

    // Limpiar productos existentes si se solicita
    if (shouldClean) {
      const deleted = await Product.deleteMany({});
      console.log(`🗑️  Productos eliminados: ${deleted.deletedCount}`);
    }

    // Validar productos antes de insertar
    // Validar productos antes de insertar (aceptamos precio 0, pero price debe existir)
    const validProducts = [];
    for (const product of productsToInsert) {
      const hasBasePrice = product.price !== null && product.price !== undefined;
      const hasVariantPrice = Array.isArray(product.variants) && product.variants.some((variant) => variant.price !== null && variant.price !== undefined);

      if (!product.name || !product.category || (!hasBasePrice && !hasVariantPrice)) {
        console.warn(`⚠️  Producto inválido (faltan precios o datos): ${product.name || 'Sin nombre'} - categoría:${product.category}`);
        continue;
      }

      if (!product.baseSize) product.baseSize = '1 unidad';
      if (!product.image) product.image = '/placeholder-product.png';

      validProducts.push(product);
    }

    console.log(`✅ Productos válidos: ${validProducts.length}`);

    const families = groupIntoFamilies(validProducts);
    console.log(`🧮 Familias detectadas: ${families.length}`);

    if (families.length > 0) {
      try {
        let insertedFamilies = 0;
        let updatedFamilies = 0;

        for (const family of families) {
          let operation = 'insert';
          let existingDocs = [];

          if (!shouldClean) {
            existingDocs = await Product.find({ name: family.name });
            if (existingDocs.length) {
              operation = 'update';
            }
          }

          let familyId = existingDocs.find((doc) => doc.isPrimary)?.familyId || existingDocs[0]?.familyId || null;

          if (operation === 'update') {
            const familyIds = Array.from(new Set(existingDocs.map((doc) => doc.familyId).filter(Boolean)));
            if (familyIds.length) {
              await Product.deleteMany({ familyId: { $in: familyIds } });
            }
            const variantParents = existingDocs.map((doc) => doc._id);
            if (variantParents.length) {
              await Product.deleteMany({ variantOf: { $in: variantParents } });
            }
            await Product.deleteMany({ name: family.name });
          }

          if (!familyId) {
            familyId = new mongoose.Types.ObjectId().toString();
          }

          const baseDoc = await Product.create({
            name: family.name,
            description: family.description || 'Descripción pendiente',
            price: family.base.price,
            originalPrice: family.base.originalPrice ?? null,
            category: family.category,
            tipo: family.tipo || undefined,
            image: family.base.image || '/placeholder-product.png',
            inStock: family.base.inStock !== false,
            isActive: family.isActive !== false,
            size: family.base.size,
            flavors: family.flavors,
            featured: family.featured,
            featuredPosition: family.featuredPosition ?? null,
            sales: family.sales || 0,
            familyId,
            isPrimary: true,
            variantOf: null
          });

          for (const variant of family.variants) {
            await Product.create({
              name: family.name,
              description: family.description || baseDoc.description,
              price: variant.price,
              originalPrice: variant.originalPrice ?? null,
              category: family.category,
              tipo: family.tipo || undefined,
              image: variant.image || baseDoc.image,
              inStock: variant.inStock !== false,
              isActive: family.isActive !== false,
              size: variant.size,
              flavors: family.flavors,
              featured: family.featured,
              featuredPosition: family.featuredPosition ?? null,
              sales: family.sales || 0,
              familyId,
              isPrimary: false,
              variantOf: baseDoc._id
            });
          }

          const totalPresentations = 1 + family.variants.length;
          const label = totalPresentations === 1 ? 'presentación' : 'presentaciones';
          if (operation === 'update') {
            updatedFamilies++;
            console.log(`🔄 Actualizado: ${family.name} (${totalPresentations} ${label})`);
          } else {
            insertedFamilies++;
            console.log(`➕ Insertado: ${family.name} (${totalPresentations} ${label})`);
          }
        }

        console.log(`\n📊 RESUMEN:`);
        console.log(`   ➕ Familias insertadas: ${insertedFamilies}`);
        console.log(`   🔄 Familias actualizadas: ${updatedFamilies}`);
        console.log(`   � Total familias procesadas: ${families.length}`);

        const categories = await Product.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]);

        console.log(`\n📋 PRODUCTOS POR CATEGORÍA:`);
        categories.forEach((cat) => {
          console.log(`   ${cat._id}: ${cat.count} productos`);
        });

      } catch (insertError) {
        console.error('❌ Error al insertar productos:', insertError.message);
        process.exit(1);
      }
    }

    console.log('\n🎉 ¡Seed completado exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

// Mostrar ayuda si se solicita
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📖 AYUDA - Seed de Productos desde JSON

Uso:
  npm run seed:json                           # Insertar/actualizar todos los productos
  npm run seed:json --clean                  # Limpiar BD e insertar todos
  npm run seed:json --category="Proteínas"   # Solo productos de una categoría
  npm run seed:json --clean --category="Creatinas"  # Limpiar e insertar solo creatinas

Archivo de datos:
  backend/data/products.json

Categorías válidas:
  - Proteínas
  - Creatinas
  - Pre-entrenos y Quemadores
  - Aminoácidos y Recuperadores
  - Salud y Bienestar
  - Comidas con proteína

Notas:
  * Los productos con el mismo nombre se agrupan en una familia y comparten tarjeta.
  * El tamaño más grande queda como presentación principal.
`);
  process.exit(0);
}

seedProducts();

