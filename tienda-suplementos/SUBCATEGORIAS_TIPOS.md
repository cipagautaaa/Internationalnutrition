# Sistema de Subcategorías (Tipos) para Productos

## Descripción
Se ha implementado un sistema de subcategorías llamado "Tipo" para las categorías de **Proteínas** y **Creatina**, permitiendo una clasificación más específica de los productos.

## Subcategorías Implementadas

### Proteínas
- **Limpia**: Proteínas bajas en carbohidratos y grasas
- **Hipercalórica**: Proteínas con alto contenido calórico (gainers)
- **Vegana**: Proteínas de origen vegetal

### Creatina
- **Monohidrato**: Creatina monohidrato tradicional
- **HCL**: Creatina HCL (Clorhidrato)

## Características Técnicas

### Backend
- **Campo en modelo**: `tipo` (String, opcional, con validación condicional)
- **Validación**: Solo acepta valores válidos según la categoría
- **Ubicación**: `backend/models/Product.js`

```javascript
tipo: {
  type: String,
  trim: true,
  validate: {
    validator: function(value) {
      if (this.category === 'Proteínas') {
        return ['Limpia', 'Hipercalórica', 'Vegana'].includes(value);
      }
      if (this.category === 'Creatina') {
        return ['Monohidrato', 'HCL'].includes(value);
      }
      return true; // Opcional para otras categorías
    },
    message: 'Tipo no válido para la categoría seleccionada'
  }
}
```

### Frontend
- **Ubicación**: `frontend/src/components/admin/ProductForm.jsx`
- **Comportamiento**:
  - El campo "Tipo" solo aparece cuando la categoría es "Proteínas" o "Creatina"
  - Es un campo requerido para estas categorías
  - Se limpia automáticamente si se cambia a una categoría que no lo requiere
  - Muestra opciones específicas según la categoría seleccionada

## Uso en el Panel de Administración

### Al crear un producto:
1. Selecciona la categoría (ej: "Proteínas")
2. Automáticamente aparecerá el campo "Tipo" debajo
3. Selecciona el tipo correspondiente (ej: "Limpia", "Hipercalórica", "Vegana")
4. Completa el resto del formulario
5. Guarda el producto

### Al editar un producto:
1. El campo "Tipo" mostrará el valor guardado (si existe)
2. Puedes modificarlo seleccionando otra opción del menú desplegable
3. Si cambias la categoría a una que no requiere tipo, el campo desaparecerá

### Comportamiento inteligente:
- Si cambias de "Proteínas" a "Aminoácidos", el campo "Tipo" desaparece
- Si cambias de "Proteínas" a "Creatina", el campo permanece pero cambian las opciones
- El valor anterior se limpia automáticamente al cambiar de categoría

## Estructura de Datos

### Ejemplo de producto con tipo:
```json
{
  "name": "Whey Protein Gold Standard",
  "category": "Proteínas",
  "tipo": "Limpia",
  "price": 150000,
  "baseSize": "5 libras",
  // ... otros campos
}
```

### Ejemplo de producto sin tipo:
```json
{
  "name": "BCAA 2:1:1",
  "category": "Aminoácidos",
  // No tiene campo 'tipo' porque no aplica
  "price": 80000,
  // ... otros campos
}
```

## Migración de Datos Existentes

Los productos existentes **no requieren migración** ya que:
- El campo `tipo` es opcional en el modelo
- Solo se valida cuando la categoría lo requiere
- Los productos antiguos funcionarán normalmente sin el campo

Si deseas agregar el tipo a productos existentes:
1. Edita el producto desde el panel de administración
2. El campo "Tipo" aparecerá si es Proteína o Creatina
3. Selecciona el tipo apropiado
4. Guarda los cambios

## Extensibilidad

Para agregar tipos a otras categorías:

### 1. Backend (`backend/models/Product.js`):
```javascript
if (this.category === 'TuCategoria') {
  return ['Tipo1', 'Tipo2', 'Tipo3'].includes(value);
}
```

### 2. Frontend (`frontend/src/components/admin/ProductForm.jsx`):
```jsx
{(form.category === 'Proteínas' || form.category === 'Creatina' || form.category === 'TuCategoria') && (
  <label className="text-xs font-medium">Tipo
    <select value={form.tipo || ''} onChange={e=>update('tipo', e.target.value)}>
      {/* ... opciones existentes ... */}
      {form.category === 'TuCategoria' && (
        <>
          <option value="Tipo1">Tipo 1</option>
          <option value="Tipo2">Tipo 2</option>
        </>
      )}
    </select>
  </label>
)}
```

### 3. Actualizar lógica de limpieza:
```javascript
const update = (k, v) => {
  if (k === 'category') {
    if (v !== 'Proteínas' && v !== 'Creatina' && v !== 'TuCategoria') {
      setForm(f => ({ ...f, [k]: v, tipo: '' }));
      return;
    }
  }
  setForm(f => ({ ...f, [k]: v }));
};
```

## Validación

### Cliente (Frontend):
- Campo requerido para Proteínas y Creatina
- Validación HTML5 nativa
- Limpieza automática al cambiar categoría

### Servidor (Backend):
- Validación Mongoose personalizada
- Verifica que el tipo sea válido para la categoría
- Mensaje de error descriptivo

## Beneficios

1. **Mejor organización**: Clasificación más específica de productos
2. **Filtrado avanzado**: Posibilidad de filtrar por subcategorías (próxima implementación)
3. **UX mejorada**: El cliente puede encontrar exactamente lo que busca
4. **Escalable**: Fácil agregar tipos a otras categorías
5. **Retrocompatible**: Productos existentes no se ven afectados

## Próximas Mejoras

- [ ] Filtro por tipo en la página de productos para clientes
- [ ] Badges visuales mostrando el tipo en las tarjetas de producto
- [ ] Búsqueda avanzada incluyendo tipos
- [ ] Analytics por tipo de producto
