// backend/seedFromExcel.js
// Script para inyectar productos desde archivo Excel
// Uso: node seedFromExcel.js ruta/al/archivo.xlsx [opciones]
// Opciones: --clean (limpiar BD antes), --sheet="Hoja1" (especificar hoja)

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// ==================== UTILIDADES ====================

const normalizeCategory = (c) => {
  const cat = (c || '').trim();
  const map = {
    'Pre-Workout': 'Pre-entrenos y Quemadores',
    'Aminoácidos': 'Aminoácidos y Recuperadores',
    'Vitaminas': 'Salud y Bienestar',
    'Para la salud': 'Salud y Bienestar',
    'Complementos': 'Salud y Bienestar',
    'Rendimiento hormonal': 'Salud y Bienestar',
    'Comida': 'Comidas con proteína',
    'Creatina': 'Creatinas',
    'Proteínas': 'Proteínas',
    'Pre-entrenos y Quemadores': 'Pre-entrenos y Quemadores',
    'Creatinas': 'Creatinas',
    'Aminoácidos y Recuperadores': 'Aminoácidos y Recuperadores',
    'Salud y Bienestar': 'Salud y Bienestar',
    'Comidas con proteína': 'Comidas con proteína'
  };
  return map[cat] || cat || 'Sin categoría';
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

      const fallbackImage = item.image || '/placeholder-product.png';
      const fallbackStock = item.inStock !== false;

      pushVariant(
        variantsStore,
        {
          size: item.size || '1 unidad',
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
          inStock: item.inStock,
          stock: item.stock
        },
        fallbackImage,
        fallbackStock
      );

      if (item.sabor && typeof item.sabor === 'string') {
        const trimmed = item.sabor.trim();
        if (trimmed) flavorsSet.add(trimmed);
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

// ==================== LECTURA DE EXCEL ====================

const readExcelFile = (filePath, sheetName = null) => {
  console.log(`📂 Leyendo archivo: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ Archivo no encontrado: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = sheetName 
    ? workbook.Sheets[sheetName] 
    : workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    const available = workbook.SheetNames.join(', ');
    throw new Error(`❌ Hoja "${sheetName || workbook.SheetNames[0]}" no encontrada. Disponibles: ${available}`);
  }

  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: null });
  console.log(`✅ ${rawData.length} filas leídas`);
  
  return rawData;
};

const parseExcelRow = (row) => {
  // Mapeo flexible de columnas (soporta diferentes nombres)
  const getName = () => row.Producto || row.producto || row.Nombre || row.nombre || row.Name || row.name || null;
  const getCategory = () => row.Categoria || row.categoria || row.Category || row.category || null;
  const getPrice = () => row.Precio || row.precio || row.Price || row.price || null;
  const getOriginalPrice = () => row['Precio Original'] || row['precio original'] || row.PrecioOriginal || row.precioOriginal || row['Original Price'] || null;
  const getSize = () => row.Tamaño || row.tamaño || row.Tamano || row.tamano || row.Size || row.size || row.Presentacion || row.presentacion || null;
  const getDescription = () => row.Descripcion || row.descripcion || row.Description || row.description || '';
  const getImage = () => row.Imagen || row.imagen || row.Image || row.image || null;
  const getTipo = () => row.Tipo || row.tipo || row.Type || row.type || row.Subtipo || row.subtipo || '';
  const getSabor = () => row.Sabor || row.sabor || row.Flavor || row.flavor || null;
  const getStock = () => row.Stock || row.stock || row.Inventario || row.inventario || null;
  const getInStock = () => {
    const val = row['En Stock'] || row['en stock'] || row.EnStock || row.enStock || row.inStock || row.InStock;
    if (val === null || val === undefined) return true;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      if (lower === 'si' || lower === 'sí' || lower === 'yes' || lower === 'true') return true;
      if (lower === 'no' || lower === 'false') return false;
    }
    return true;
  };

  const name = getName();
  const category = normalizeCategory(getCategory());
  const price = toNumber(getPrice());
  const originalPrice = toNumber(getOriginalPrice());
  const size = getSize();
  const tipo = getTipo();

  // Validar campos obligatorios (Precio Original es opcional)
  if (!name || !category || !price || !size || !tipo) {
    return null; // Fila inválida
  }

  return {
    name,
    category,
    price,
    originalPrice, // Puede ser null
    size,
    description: getDescription() || 'Descripción pendiente',
    image: getImage() || '/placeholder-product.png',
    tipo,
    sabor: getSabor(),
    stock: toNumber(getStock()),
    inStock: getInStock(),
    isActive: true,
    featured: false,
    sales: 0
  };
};

// ==================== SEEDING ====================

async function seedFromExcel() {
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
      console.log(`
📖 AYUDA - Seed de Productos desde Excel

Uso:
  node seedFromExcel.js archivo.xlsx                    # Importar desde Excel
  node seedFromExcel.js archivo.xlsx --clean            # Limpiar BD antes
  node seedFromExcel.js archivo.xlsx --sheet="Hoja2"   # Especificar hoja

Formato del Excel:
  Las columnas OBLIGATORIAS son (pueden tener diferentes nombres, case-insensitive):
  
  ✅ OBLIGATORIAS:
  - Producto / producto / Nombre / nombre / Name
  - Tamaño / tamaño / Size / size / Presentacion
  - Categoria / categoria / Category / category
  - Tipo / tipo / Type / type / Subtipo
  - Precio / precio / Price / price
  
  📋 OPCIONALES:
  - Precio Original / precio original / PrecioOriginal / Original Price
  - Descripcion / descripcion / Description
  - Imagen / imagen / Image
  - Sabor / sabor / Flavor
  - Stock / stock / Inventario
  - En Stock / en stock / InStock (Si/No, True/False)

Ejemplo de datos:
  Producto                    | Tamaño | Categoria  | Tipo        | Precio | Precio Original | Descripcion
  Whey Protein Gold Standard  | 1 lb   | Proteínas  | Limpia      | 55000  | 65000           | Proteína de suero...
  Whey Protein Gold Standard  | 2 lb   | Proteínas  | Limpia      | 95000  | 110000          | Proteína de suero...
  Whey Protein Gold Standard  | 5 lb   | Proteínas  | Limpia      | 210000 | 250000          | Proteína de suero...

Notas:
  * Productos con el mismo nombre se agrupan automáticamente
  * El tamaño más grande será la presentación principal
  * Categorías legacy se normalizan automáticamente
`);
      process.exit(0);
    }

    const filePath = args.find(arg => !arg.startsWith('--')) || null;
    if (!filePath) {
      console.error('❌ Debes especificar la ruta del archivo Excel');
      console.log('💡 Usa: node seedFromExcel.js archivo.xlsx');
      process.exit(1);
    }

    const shouldClean = args.includes('--clean');
    const sheetArg = args.find(arg => arg.startsWith('--sheet='));
    const sheetName = sheetArg ? sheetArg.split('=')[1] : null;

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Leer Excel
    const rawData = readExcelFile(filePath, sheetName);
    
    // Parsear filas
    const products = rawData.map(parseExcelRow).filter(p => {
      if (p === null) {
        console.warn(`⚠️  Fila inválida ignorada (faltan columnas obligatorias)`);
        return false;
      }
      return true;
    });

    console.log(`✅ ${products.length} productos válidos parseados`);

    // Limpiar BD si se solicita
    if (shouldClean) {
      const deleted = await Product.deleteMany({});
      console.log(`🗑️  ${deleted.deletedCount} productos eliminados de la BD`);
    }

    // Agrupar en familias
    const families = groupIntoFamilies(products);
    console.log(`🧮 ${families.length} familias detectadas`);

    // Insertar familias
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
    console.log(`   📦 Total familias procesadas: ${families.length}`);

    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log(`\n📋 PRODUCTOS POR CATEGORÍA:`);
    categories.forEach((cat) => {
      console.log(`   ${cat._id}: ${cat.count} productos`);
    });

    console.log('\n🎉 ¡Importación desde Excel completada exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedFromExcel();
