# Sistema de Filtrado por Subcategorías (Tipos)

## 📋 Descripción
Se ha implementado un sistema de pestañas para filtrar productos por subcategorías (tipos) en las páginas de **Proteínas** y **Creatina**. Los usuarios ahora pueden ver productos organizados por tipo sin necesidad de navegar entre diferentes páginas.

## ✨ Características

### Para la categoría Proteínas
Los productos se filtran en 3 tipos:
- **Limpia**: Proteínas bajas en carbohidratos y grasas
- **Hipercalórica**: Proteínas con alto contenido calórico (gainers)
- **Vegana**: Proteínas de origen vegetal

### Para la categoría Creatina
Los productos se filtran en 2 tipos:
- **Monohidrato**: Creatina monohidrato tradicional
- **HCL**: Creatina HCL (Clorhidrato)

### Para otras categorías
No se muestran pestañas de filtrado y se visualizan todos los productos normalmente.

## 🎨 Interfaz de Usuario

### Diseño de las pestañas
- **Ubicación**: Aparecen justo encima de la cuadrícula de productos
- **Estilo activo**: Fondo rojo con borde inferior grueso y elevación
- **Estilo inactivo**: Fondo gris claro con hover rojo
- **Indicador**: Texto debajo de las pestañas mostrando el tipo activo
- **Responsive**: Se adapta a diferentes tamaños de pantalla

### Comportamiento
1. Al entrar a la página de Proteínas, se muestra automáticamente "Limpia"
2. Al hacer clic en otra pestaña, el contenido se filtra instantáneamente
3. Solo se muestran productos del tipo seleccionado
4. Si no hay productos de un tipo, se muestra un mensaje informativo

## 🔧 Implementación Técnica

### Componente principal: `CategoryTypeTabs.jsx`
```jsx
<CategoryTypeTabs
  category="Proteínas"
  products={allProducts}
  onFilteredProducts={setFilteredProducts}
/>
```

**Props:**
- `category`: Categoría actual ("Proteínas" o "Creatina")
- `products`: Array de todos los productos de la categoría
- `onFilteredProducts`: Callback que recibe los productos filtrados

**Lógica de filtrado:**
- Filtra productos por el campo `tipo`
- Si un producto no tiene `tipo`, usa el valor por defecto:
  - Proteínas → "Limpia"
  - Creatina → "Monohidrato"

### Integración en `ProductList.jsx`
El componente `ProductList` ahora:
1. Detecta si la categoría es Proteínas o Creatina
2. Muestra las pestañas de tipo si aplica
3. Renderiza los productos filtrados o todos según el caso

```jsx
const showTypeTabs = category === 'Proteínas' || category === 'Creatina';
const displayProducts = showTypeTabs ? filteredProducts : products;
```

## 📊 Migración de Datos

### Script ejecutado: `migrateProductTypes.js`
Se ejecutó un script que asignó tipos por defecto a todos los productos existentes:

**Resultados:**
- ✅ 4 Proteínas actualizadas a tipo "Limpia"
- ✅ 3 Creatinas actualizadas a tipo "Monohidrato"

**Comando para ejecutar nuevamente:**
```bash
cd backend
node scripts/migrateProductTypes.js
```

### Productos nuevos
Los productos nuevos creados desde el panel de administración:
- **Deben** especificar el tipo al crearlos (campo obligatorio)
- El tipo se guarda en la base de datos
- Se muestran automáticamente en la pestaña correspondiente

## 🎯 Flujo de Usuario

### Escenario 1: Usuario visita página de Proteínas
1. La página carga con "Limpia" seleccionada por defecto
2. Se muestran solo las proteínas limpias
3. Usuario hace clic en "Hipercalórica"
4. La vista se actualiza mostrando solo proteínas hipercalóricas
5. Usuario puede cambiar entre tipos sin recargar la página

### Escenario 2: Usuario visita página de Creatina
1. La página carga con "Monohidrato" seleccionada por defecto
2. Se muestran solo las creatinas monohidratadas
3. Usuario hace clic en "HCL"
4. La vista se actualiza mostrando solo creatinas HCL

### Escenario 3: Usuario visita otras categorías
1. La página carga normalmente
2. No aparecen pestañas de filtrado
3. Se muestran todos los productos de la categoría

## 📁 Archivos Modificados/Creados

### Frontend
- ✅ **Creado**: `src/components/CategoryTypeTabs.jsx`
- ✅ **Modificado**: `src/components/ProductList.jsx`

### Backend
- ✅ **Creado**: `backend/scripts/migrateProductTypes.js`
- ✅ **Modificado**: `backend/models/Product.js` (anteriormente)

## 🎨 Estilos Aplicados

### Pestaña activa
```css
bg-red-600 text-white border-b-4 border-red-600 transform -translate-y-1
```

### Pestaña inactiva
```css
bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600
```

### Transiciones
```css
transition-all duration-300
```

## 🔄 Compatibilidad con Productos Legacy

El sistema es **totalmente retrocompatible**:
- Productos sin campo `tipo` se asignan automáticamente al tipo por defecto
- No se requiere modificar productos existentes manualmente
- El script de migración ya asignó tipos a todos los productos

## 🚀 Extensibilidad

### Agregar tipos a otras categorías

1. **Actualizar constantes** en `CategoryTypeTabs.jsx`:
```javascript
const CATEGORY_TYPES = {
  'Proteínas': ['Limpia', 'Hipercalórica', 'Vegana'],
  'Creatina': ['Monohidrato', 'HCL'],
  'Aminoácidos': ['BCAA', 'Glutamina', 'EAA'] // Nueva categoría
};
```

2. **Actualizar lógica de tipo por defecto**:
```javascript
const getDefaultType = (cat) => {
  if (cat === 'Proteínas') return 'Limpia';
  if (cat === 'Creatina') return 'Monohidrato';
  if (cat === 'Aminoácidos') return 'BCAA'; // Nuevo
  return null;
};
```

3. **Actualizar validación en backend** (`models/Product.js`)

## 📱 Responsive Design

- **Desktop**: Pestañas con padding amplio y texto visible
- **Tablet**: Pestañas ajustadas manteniendo legibilidad
- **Mobile**: Pestañas compactas pero táctiles

## ⚡ Rendimiento

- **Sin peticiones adicionales**: El filtrado se hace en el cliente
- **Renderizado instantáneo**: Solo se ocultan/muestran elementos
- **Optimizado**: React maneja eficientemente el cambio de estado

## 🎉 Beneficios

1. ✅ **Mejor UX**: Navegación rápida entre tipos
2. ✅ **Sin recarga**: Filtrado instantáneo
3. ✅ **Visual atractivo**: Pestañas con estilo moderno
4. ✅ **Escalable**: Fácil agregar más tipos o categorías
5. ✅ **Retrocompatible**: Funciona con productos existentes
6. ✅ **Mantenible**: Código limpio y documentado

## 🔮 Mejoras Futuras

- [ ] Animaciones de transición entre pestañas
- [ ] Contador de productos por tipo en cada pestaña
- [ ] Filtros combinados (tipo + precio + marca)
- [ ] URL params para mantener filtro al recargar
- [ ] Analytics de tipos más visitados
