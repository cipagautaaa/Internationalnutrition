# Sistema de Stock Actualizado

## Cambio Implementado

Se ha actualizado el sistema de gestión de stock de **cantidad numérica** a **disponibilidad booleana** (Hay stock / No hay stock).

## Razón del Cambio

No se tiene certeza de la cantidad exacta de stock disponible para cada producto, por lo que se simplificó el sistema a una indicación simple de disponibilidad.

## Cambios Técnicos

### Backend

1. **Modelo de Producto** (`backend/models/Product.js`)
   - El campo `inStock` (Boolean) se mantiene como indicador principal
   - El campo `stock` (Number) se mantiene para compatibilidad con variantes
   - Actualización del enum de categorías para incluir las 8 categorías del navbar:
     - Proteínas
     - Creatina
     - Aminoácidos
     - Pre-Workout
     - Vitaminas
     - Para la salud (nuevo)
     - Complementos (nuevo)
     - Comida (nuevo)

2. **Script de Migración** (`backend/scripts/migrateStockToInStock.js`)
   - Migra automáticamente productos existentes
   - Convierte: `stock > 0` → `inStock: true`
   - Convierte: `stock === 0` → `inStock: false`
   - Ejecutado exitosamente el 5 de octubre de 2025

### Frontend

1. **Formulario de Productos** (`frontend/src/components/admin/ProductForm.jsx`)
   - Campo de stock numérico reemplazado por checkbox "Hay stock disponible"
   - Interfaz más intuitiva y simple
   - Valor por defecto: `true` (hay stock)

2. **Panel de Administración** (`frontend/src/pages/AdminProducts.jsx`)
   - Tabla de productos actualizada:
     - Columna "Stock" → "Disponibilidad"
     - Muestra badge verde "✓ Hay stock" o rojo "✗ Sin stock"
   - Contadores actualizados:
     - "Sin stock" ahora cuenta productos con `inStock: false`
   - Actualización de categorías para incluir las 8 del navbar

## Cómo Usar

### Crear/Editar Producto

1. En el formulario de producto, encontrarás un checkbox:
   ```
   ☑ Hay stock disponible
   ```
2. **Marcado**: Indica que hay stock del producto
3. **Desmarcado**: Indica que NO hay stock del producto

### Visualización en Admin

- **Badges de disponibilidad**:
  - 🟢 Verde "✓ Hay stock": Producto disponible
  - 🔴 Rojo "✗ Sin stock": Producto sin stock

### Contadores en Paneles

Los contadores por categoría muestran:
- Activos: Productos con `isActive: true`
- Inactivos: Productos con `isActive: false`
- Sin stock: Productos con `inStock: false`

## Compatibilidad

- Las **variantes de productos** siguen usando stock numérico (`variants.stock`)
- El campo `stock` del producto principal ya no se usa en la UI pero se mantiene en el modelo
- Migración automática de datos existentes completada

## Fecha de Implementación

5 de octubre de 2025
