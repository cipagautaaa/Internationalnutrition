# Guía de Importación desde Excel

## 📋 Formato del Excel

Tu archivo Excel puede tener columnas con **cualquiera de estos nombres** (el script reconoce mayúsculas, minúsculas y variaciones):

### Columnas Obligatorias:
- **Producto**: `Producto`, `producto`, `Nombre`, `nombre`, `Name`, `name`
- **Tamaño**: `Tamaño`, `tamaño`, `Tamano`, `tamano`, `Size`, `size`, `Presentacion`, `presentacion`
- **Categoría**: `Categoria`, `categoria`, `Category`, `category`
- **Tipo**: `Tipo`, `tipo`, `Type`, `type`, `Subtipo`, `subtipo`
- **Precio**: `Precio`, `precio`, `Price`, `price`

### Columnas Opcionales:
- **Precio Original**: `Precio Original`, `PrecioOriginal`, `precio original`, `Original Price`
- **Descripción**: `Descripcion`, `descripcion`, `Description`, `description`
- **Imagen**: `Imagen`, `imagen`, `Image`, `image` (URL)
- **Sabor**: `Sabor`, `sabor`, `Flavor`, `flavor`
- **Stock**: `Stock`, `stock`, `Inventario`, `inventario` (número)
- **En Stock**: `En Stock`, `InStock` (Si/No, True/False)

---

## 📊 Ejemplo de Excel

| Producto | Tamaño | Categoria | Tipo | Precio | Precio Original | Descripcion | Sabor |
|----------|--------|-----------|------|--------|-----------------|-------------|-------|
| Whey Protein Gold Standard | 1 lb | Proteínas | Limpia | 55000 | 65000 | Proteína de suero premium | Chocolate |
| Whey Protein Gold Standard | 2 lb | Proteínas | Limpia | 95000 | 110000 | Proteína de suero premium | Chocolate |
| Whey Protein Gold Standard | 5 lb | Proteínas | Limpia | 210000 | 250000 | Proteína de suero premium | Chocolate |
| Creatina Monohidrato Pura | 300g | Creatinas | Monohidrato | 35000 | 40000 | Creatina 100% pura | Sin sabor |
| Creatina Monohidrato Pura | 500g | Creatinas | Monohidrato | 55000 | 65000 | Creatina 100% pura | Sin sabor |
| Creatina Monohidrato Pura | 1000g | Creatinas | Monohidrato | 95000 | 110000 | Creatina 100% pura | Sin sabor |

---

## 🚀 Cómo Usar

### 1. Preparar tu Excel
- Coloca tu archivo Excel en cualquier ubicación
- Asegúrate de que tenga las columnas mínimas requeridas

### 2. Ejecutar la importación

```bash
# Importar desde Excel (sin borrar datos existentes)
node seedFromExcel.js ruta/al/archivo.xlsx

# Limpiar BD e importar desde cero
node seedFromExcel.js ruta/al/archivo.xlsx --clean

# Especificar una hoja específica del Excel
node seedFromExcel.js ruta/al/archivo.xlsx --sheet="Productos"

# Ver ayuda
node seedFromExcel.js --help
```

### 3. Ejemplos prácticos

```bash
# Excel en la misma carpeta del backend
node seedFromExcel.js productos.xlsx --clean

# Excel en el escritorio
node seedFromExcel.js "C:\Users\tuusuario\Desktop\productos.xlsx"

# Excel con hoja específica
node seedFromExcel.js productos.xlsx --sheet="Hoja2" --clean
```

---

## ✨ Características Automáticas

### 🎯 Agrupación Inteligente
- **Productos con el mismo nombre** → Se agrupan en una sola familia
- **Tamaño más grande** → Queda como presentación principal en la card
- **Otros tamaños** → Se convierten en variantes seleccionables

### 📐 Ejemplo de Agrupación

Si tu Excel tiene estas 3 filas:

```
Whey Protein Gold Standard | 1 lb  | Proteínas | Limpia | $55,000 | $65,000
Whey Protein Gold Standard | 2 lb  | Proteínas | Limpia | $95,000 | $110,000
Whey Protein Gold Standard | 5 lb  | Proteínas | Limpia | $210,000 | $250,000
```

**Resultado en la tienda:**
- ✅ **1 sola tarjeta** con el producto "Whey Protein Gold Standard"
- ⭐ Presentación principal: **5 lb** por $210,000 (el más grande)
- 🔽 Variantes disponibles: 2 lb, 1 lb (en selector de tamaño)

### 🔄 Normalización Automática de Categorías

El script reconoce categorías legacy y las normaliza:

| Tu Excel dice | Se guarda como |
|---------------|----------------|
| Creatina | Creatinas |
| Rendimiento hormonal | Salud y Bienestar |
| Vitaminas | Salud y Bienestar |
| Para la salud | Salud y Bienestar |
| Pre-Workout | Pre-entrenos y Energía |
| Aminoácidos | Aminoácidos y Recuperadores |
| Comida | Comidas con proteína |

---

## 📌 Notas Importantes

1. **Columnas obligatorias**: Producto, Tamaño, Categoría, Tipo y Precio son requeridas
2. **Precio Original**: Es opcional, si no se incluye el producto no mostrará descuento
3. **Productos duplicados**: Si ya existe un producto con el mismo nombre, se actualizará con los nuevos datos
4. **Tamaños grandes primero**: El sistema calcula automáticamente qué tamaño es mayor (reconoce kg, lb, g, oz, ml, servicios, cápsulas, etc.)
5. **Imágenes**: Si no especificas imagen, se usa `/placeholder-product.png`
6. **Stock**: Si dejas vacío "En Stock", se asume que SÍ hay stock

---

## 🎯 Resultado Final

Después de ejecutar el script verás:

```
✅ Conectado a MongoDB
📂 Leyendo archivo: productos.xlsx
✅ 150 filas leídas
✅ 145 productos válidos parseados
🧮 48 familias detectadas
➕ Insertado: Whey Protein Gold Standard (3 presentaciones)
➕ Insertado: Creatina Monohidrato Pura (3 presentaciones)
...
📊 RESUMEN:
   ➕ Familias insertadas: 48
   📦 Total familias procesadas: 48

📋 PRODUCTOS POR CATEGORÍA:
   Proteínas: 85 productos
   Creatinas: 24 productos
   Pre-entrenos y Energía: 18 productos
   ...

🎉 ¡Importación desde Excel completada exitosamente!
```

---

## 💡 Tips

- **Usa --clean** solo la primera vez o cuando quieras reemplazar todo
- **Sin --clean** actualiza productos existentes sin borrar otros
- Puedes tener múltiples filas del mismo producto con diferentes tamaños
- El script es **tolerante**: reconoce diferentes nombres de columnas
- Los sabores se unifican: todas las variantes comparten los sabores
