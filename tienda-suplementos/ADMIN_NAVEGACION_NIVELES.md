# Sistema de Navegación por Niveles en Panel de Administración

## 📋 Descripción
Se ha implementado un sistema de navegación por niveles en el panel de administración de productos, que muestra un panel adicional de selección de subcategorías cuando se elige Proteínas o Creatina, evitando confusión al administrar productos.

## 🎯 Flujo de Navegación

### Nivel 1: Selección de Categoría
El usuario ve todas las categorías disponibles con estadísticas:
- Proteínas
- Creatina
- Aminoácidos
- Pre-Workout
- Vitaminas
- Otros

**Información mostrada por categoría:**
- Número total de productos
- Productos activos
- Productos inactivos
- Productos sin stock

### Nivel 2: Selección de Subcategoría (solo Proteínas y Creatina)

Cuando el usuario selecciona **Proteínas** o **Creatina**, en lugar de mostrar directamente la tabla de productos, aparece un segundo panel con las subcategorías:

**Para Proteínas:**
- Limpia
- Hipercalórica
- Vegana

**Para Creatina:**
- Monohidrato
- HCL

**Información mostrada por subcategoría:**
- Número total de productos del tipo
- Productos activos del tipo
- Productos inactivos del tipo
- Productos sin stock del tipo

### Nivel 3: Tabla de Productos
Una vez seleccionada la subcategoría (o directamente si la categoría no tiene subcategorías), se muestra la tabla de productos filtrada.

## 🎨 Interfaz de Usuario

### Panel de Subcategorías
```
┌─────────────────────────────────────────┐
│ ← Volver a categorías                  │
│ Categoría: Proteínas                    │
│ Selecciona un tipo para gestionar      │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │  Limpia  │ │Hipercal. │ │ Vegana   ││
│ │ 4 prods  │ │ 0 prods  │ │ 0 prods  ││
│ │Activos:4 │ │Activos:0 │ │Activos:0 ││
│ └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────┘
```

### Breadcrumb de Navegación
En la tabla de productos, aparece un breadcrumb para navegar fácilmente:

**Con subcategorías:**
```
Categorías › Proteínas › Limpia
   [link]      [link]    [actual]
```

**Sin subcategorías:**
```
Categorías › Aminoácidos
   [link]      [actual]
```

## 🔄 Navegación

### Botones de retorno
1. **"← Volver a categorías"**: Regresa al panel principal de categorías
2. **Breadcrumb "Categorías"**: Regresa al panel principal
3. **Breadcrumb "[Categoría]"**: Regresa al panel de subcategorías (si aplica)

### Comportamiento al cambiar de nivel
- Al regresar, se resetean los filtros de búsqueda
- Se limpian las selecciones posteriores
- Se mantiene el estado de los productos cargados

## 💡 Beneficios

### Para el Administrador
1. **Claridad**: Evita confusión al ver muchos productos de diferentes tipos juntos
2. **Organización**: Productos agrupados lógicamente por tipo
3. **Eficiencia**: Acceso rápido a productos específicos
4. **Estadísticas**: Información clara de cuántos productos hay de cada tipo

### Para la Gestión
1. **Mejor control**: Saber exactamente qué tipos tienen más o menos productos
2. **Identificación rápida**: Ver si falta agregar productos de algún tipo
3. **Navegación intuitiva**: Similar a explorar carpetas en un sistema de archivos

## 🔧 Implementación Técnica

### Estados adicionales
```javascript
const [selectedCategory, setSelectedCategory] = useState(null);
const [selectedType, setSelectedType] = useState(null);
```

### Lógica de filtrado
```javascript
const filteredProducts = useMemo(() => {
  let list = products;
  
  // Filtrar por categoría
  if (selectedCategory) {
    list = list.filter(p => p.category === selectedCategory);
  }
  
  // Filtrar por tipo/subcategoría
  if (selectedType) {
    list = list.filter(p => {
      const productType = p.tipo || getDefaultType(p.category);
      return productType === selectedType;
    });
  }
  
  // Filtrar por búsqueda
  if (search.trim()) {
    list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }
  
  return list;
}, [products, selectedCategory, selectedType, search]);
```

### Estructura de vistas
```javascript
// Vista 1: Panel de categorías
if (!selectedCategory) {
  return <CategorySelectionPanel />;
}

// Vista 2: Panel de subcategorías (solo si aplica)
const categoryHasTypes = CATEGORY_TYPES[selectedCategory];
if (categoryHasTypes && !selectedType) {
  return <TypeSelectionPanel />;
}

// Vista 3: Tabla de productos
return <ProductsTable />;
```

## 📊 Ejemplo de Flujo Completo

### Usuario administra proteínas limpias:
1. Entra al panel de administración
2. Ve todas las categorías
3. Clic en "Proteínas" (4 productos)
4. Ve panel con 3 opciones: Limpia (4), Hipercalórica (0), Vegana (0)
5. Clic en "Limpia"
6. Ve tabla con 4 proteínas limpias
7. Puede crear, editar o eliminar productos
8. Breadcrumb muestra: "Categorías › Proteínas › Limpia"
9. Puede volver a tipos con clic en "Proteínas"
10. Puede volver a categorías con clic en "Categorías"

### Usuario administra aminoácidos:
1. Entra al panel de administración
2. Ve todas las categorías
3. Clic en "Aminoácidos" (1 producto)
4. **Directamente** ve la tabla con el producto
5. No hay panel intermedio (no tiene subcategorías)
6. Breadcrumb muestra: "Categorías › Aminoácidos"

## 🎨 Estilos Visuales

### Tarjetas de categoría/tipo
- Borde suave y sombra
- Hover con sombra más pronunciada
- Estadísticas con badges de colores:
  - Verde para activos
  - Amarillo para inactivos
  - Rojo para sin stock
- Flecha "Administrar →" al final

### Breadcrumb
- Links azules con hover underline
- Separadores "›" en gris
- Elemento actual en gris oscuro sin link

## 🔮 Extensibilidad

### Agregar subcategorías a otras categorías:
```javascript
const CATEGORY_TYPES = {
  'Proteínas': ['Limpia', 'Hipercalórica', 'Vegana'],
  'Creatina': ['Monohidrato', 'HCL'],
  'Aminoácidos': ['BCAA', 'Glutamina', 'EAA'] // Nueva
};
```

El sistema detectará automáticamente y mostrará el panel de subcategorías.

## 📱 Responsive

- Desktop: Grid de 3 columnas
- Tablet: Grid de 2 columnas  
- Mobile: Grid de 1 columna
- Breadcrumb se ajusta con wrap

## ✅ Ventajas del Sistema

1. **Navegación Clara**: Tres niveles bien definidos
2. **Información Contextual**: Estadísticas en cada nivel
3. **Flexibilidad**: Funciona con y sin subcategorías
4. **Escalable**: Fácil agregar más subcategorías
5. **UX Mejorada**: Menos sobrecarga de información
6. **Intuitivo**: Similar a navegación de archivos

## 📝 Comparación

### Antes
```
Categorías → Tabla con TODOS los productos mezclados
```

### Ahora
```
Categorías → [Subcategorías] → Tabla filtrada por tipo
```

### Resultado
- ✅ Menos confusión
- ✅ Mejor organización
- ✅ Más fácil de navegar
- ✅ Estadísticas más útiles
