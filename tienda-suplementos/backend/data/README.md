# 📦 Sistema de Seed de Productos

Este sistema te permite agregar productos masivamente a la base de datos usando archivos JSON.

## 🚀 Uso Rápido

```bash
# Desde la carpeta backend/
cd backend

# Ver ayuda completa
npm run seed:help

# Agregar todos los productos del JSON (recomendado)
npm run seed:json

# Limpiar base de datos e insertar productos nuevos
npm run seed:json --clean

# Solo agregar productos de una categoría específica
npm run seed:json --category="Proteínas"
npm run seed:json --category="Creatinas"
```

## 📁 Estructura de Archivos

```
backend/
├── data/
│   └── products.json          # ← Edita este archivo para agregar productos
├── seedProductsFromJSON.js    # Script que lee el JSON
└── seed.js                    # Script original (backup)
```

## ✏️ Cómo Agregar Productos

1. **Edita el archivo `backend/data/products.json`**
2. **Agrega nuevos productos al array `"products"`**
3. **Ejecuta el comando de seed**

### Ejemplo de producto en JSON:

```json
{
  "name": "Nombre del Producto",
  "description": "Descripción detallada del producto...",
  "price": 50000,
  "category": "Proteínas",
  "brand": "Marca del producto",
  "images": ["https://ejemplo.com/imagen.jpg"],
  "variants": [
    {"size": "1 lb", "price": 50000},
    {"size": "2 lb", "price": 85000}
  ],
  "flavors": ["Chocolate", "Vainilla", "Fresa"],
  "inStock": true,
  "isActive": true,
  "stock": 50,
  "rating": 4.5,
  "productType": "Whey Isolate"
}
```

## 🏷️ Categorías Válidas

- `Proteínas`
- `Creatinas` 
- `Pre-entrenos y Energía`
- `Aminoácidos y Recuperadores`
- `Salud y Bienestar`
- `Rendimiento hormonal`
- `Comidas con proteína`

## 🔧 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run seed:json` | Inserta/actualiza productos desde JSON |
| `npm run seed:json --clean` | Borra todos los productos e inserta desde JSON |
| `npm run seed:json --category="X"` | Solo productos de categoría X |
| `npm run seed:help` | Muestra ayuda completa |
| `npm run seed` | Ejecuta seed original (productos hardcodeados) |
| `npm run db:setup:json` | Crea índices + seed desde JSON |

## ⚠️ Notas Importantes

1. **Backup**: El script NO sobrescribe productos existentes a menos que uses `--clean`
2. **Duplicados**: Si un producto con el mismo nombre existe, se actualiza automáticamente
3. **Validación**: Productos sin `name`, `category` o `price` se saltan automáticamente
4. **Categorías**: Se normalizan automáticamente (ej: "Creatina" → "Creatinas")

## 📊 Después del Seed

El script te mostrará un resumen como:

```
📊 RESUMEN:
   ➕ Productos insertados: 8
   🔄 Productos actualizados: 4  
   📈 Total procesados: 12

📋 PRODUCTOS POR CATEGORÍA:
   Proteínas: 3 productos
   Creatinas: 2 productos
   Pre-entrenos y Energía: 1 productos
   ...
```

## 🆘 Solución de Problemas

**Error de conexión MongoDB:**
- Verifica que el archivo `.env` tenga `MONGODB_URI` correcto
- Asegúrate de que MongoDB esté ejecutándose

**Productos no aparecen:**
- Verifica que `isActive: true` en el JSON
- Usa `--clean` para limpiar productos viejos
- Revisa que la categoría sea válida

**Imágenes no cargan:**
- Usa URLs completas (https://...)
- Verifica que las imágenes sean accesibles públicamente