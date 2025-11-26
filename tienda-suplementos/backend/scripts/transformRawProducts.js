// scripts/transformRawProducts.js
// Convierte backend/productos_raw.json (con columnas en español) a backend/data/products.json
// agrupando por "Producto" como familia y creando variantes por "Tamaño".

const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '..', 'productos_raw.json');
const OUT_PATH = path.join(__dirname, '..', 'data', 'products.json');

const normalizeCategory = (c) => {
  const cat = String(c || '').trim().toLowerCase();
  const map = new Map([
    ['proteinas', 'Proteínas'],
    ['protein as', 'Proteínas'],
    ['proteínas', 'Proteínas'],
    ['pre entrenos y energia', 'Pre-entrenos y Quemadores'],
    ['pre entrenos y energía', 'Pre-entrenos y Quemadores'],
    ['pre entrenos', 'Pre-entrenos y Quemadores'],
    ['creatinas', 'Creatinas'],
    ['creatina', 'Creatinas'],
    ['aminoacidos y recuperadores', 'Aminoácidos y Recuperadores'],
    ['aminoácidos y recuperadores', 'Aminoácidos y Recuperadores'],
    ['salud y bienestar', 'Salud y Bienestar'],
    ['rendimiento hormonal', 'Salud y Bienestar'],
    ['comidas con proteina', 'Comidas con proteína'],
    ['comidas con proteína', 'Comidas con proteína']
  ]);
  return map.get(cat) || (cat ? cat[0].toUpperCase() + cat.slice(1) : 'Sin categoría');
};

// Lista blanca simple para no romper validación en Product.tipo
const ALLOWED_TIPOS_BY_CATEGORY = {
  'Proteínas': ['Proteínas limpias', 'Proteínas hipercalóricas', 'Proteínas veganas', 'Limpia', 'Hipercalórica', 'Vegana'],
  'Creatinas': ['Monohidratado', 'Monohidrato', 'HCL', 'Complejos de creatina'],
  'Pre-entrenos y Quemadores': ['Pre-entrenos', 'Quemadores de grasa', 'Energizantes y bebidas', 'Termogénicos con cafeína'],
  'Aminoácidos y Recuperadores': ['BCAA y EAA', 'Glutamina', 'Mezclas aminoácidas', 'Carbohidratos post-entreno'],
  'Salud y Bienestar': ['Multivitamínicos', 'Vitaminas y minerales', 'Colágeno, omega y antioxidantes', 'Adaptógenos y suplementos naturales'],
  'Comidas con proteína': ['Pancakes y mezclas', 'Barras y galletas proteicas', 'Snacks funcionales']
};

const mapTipo = (category, rawTipo) => {
  if (!rawTipo) return undefined;
  const t = String(rawTipo).trim().toLowerCase();
  const cat = category;
  const allowed = ALLOWED_TIPOS_BY_CATEGORY[cat] || [];
  // Normalizaciones básicas desde el excel
  const direct = new Map([
    ['proteina limpia', 'Limpia'],
    ['proteína limpia', 'Limpia'],
    ['proteina hipercalorica', 'Hipercalórica'],
    ['proteína hipercalorica', 'Hipercalórica'],
    ['proteina vegana', 'Vegana'],
    ['creatina hcl', 'HCL'],
    ['monohidrato', 'Monohidrato'],
    ['monohidratado', 'Monohidratado'],
    ['pre entreno', 'Pre-entrenos'],
    ['quemadores de grasa', 'Quemadores de grasa']
  ]);
  const mapped = direct.get(t);
  if (mapped && allowed.includes(mapped)) return mapped;
  // Si no coincide, omitir para no fallar la validación (campo opcional)
  return undefined;
};

function toNumber(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^0-9.,-]/g, '').replace(',', '.');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function main() {
  if (!fs.existsSync(RAW_PATH)) {
    console.error('❌ No se encontró backend/productos_raw.json');
    process.exit(1);
  }

  const rows = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));
  if (!Array.isArray(rows) || !rows.length) {
    console.error('❌ productos_raw.json no contiene un arreglo con productos');
    process.exit(1);
  }

  // Agrupar por nombre de producto (familias)
  const groups = new Map();
  for (const r of rows) {
    const name = String(r['Producto'] || '').trim();
    if (!name) continue;
    const category = normalizeCategory(r['Categoría']);
    const size = String(r['Tamaño'] || r['Tamano'] || '').trim() || 'UNICO';
    const price = toNumber(r['Precio']);
    const originalPrice = toNumber(r['Precio original']);
    const tipo = mapTipo(category, r['Tipo']);

    const item = {
      name,
      description: 'Descripción pendiente',
      category,
      price, // precio base candidato
      baseSize: size,
      image: '/placeholder-product.png',
      inStock: true,
      isActive: true,
      variants: [
        {
          size,
          price,
          originalPrice,
          inStock: true
        }
      ]
    };
    if (tipo) item.tipo = tipo;

    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(item);
  }

  // Consolidar familias -> producto base + variantes
  const products = [];
  for (const [displayName, items] of groups.entries()) {
    if (!items.length) continue;
    const base = items[0];
    const category = base.category;
    const tipo = base.tipo; // ya mapeado/limpiado o undefined
    const flavors = ['Sin sabor'];

    const variantsMap = new Map();
    for (const it of items) {
      for (const v of it.variants) {
        if (!v.size || (v.price === null || v.price === undefined)) continue;
        const key = v.size.trim().toLowerCase();
        variantsMap.set(key, {
          size: v.size.trim(),
          price: v.price,
          originalPrice: v.originalPrice ?? null,
          image: '/placeholder-product.png',
          inStock: true
        });
      }
    }

    const variantsArr = Array.from(variantsMap.values());
    if (!variantsArr.length) continue;

    // Elegir base: mayor tamaño por heurística simple (largo del string) y/o mayor precio
    variantsArr.sort((a, b) => {
      if ((b.price || 0) !== (a.price || 0)) return (b.price || 0) - (a.price || 0);
      return (b.size || '').length - (a.size || '').length;
    });
    const primary = variantsArr[0];
    const rest = variantsArr.slice(1);

    products.push({
      name: displayName,
      description: 'Descripción pendiente',
      category,
      productType: tipo, // seed lo mapea a tipo si aplica
      images: ['/placeholder-product.png'],
      baseSize: primary.size,
      price: primary.price,
      originalPrice: primary.originalPrice ?? null,
      inStock: true,
      isActive: true,
      flavors,
      variants: rest
    });
  }

  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  const out = { categories, products };

  // Asegurar carpeta data
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log(`✅ Transformación completa: ${products.length} productos en data/products.json`);
}

main();
