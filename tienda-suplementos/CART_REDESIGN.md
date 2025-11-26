# Rediseño del Carrito de Compras

## Descripción General

Se ha implementado un rediseño completo del carrito de compras tanto en el drawer lateral como en la página del carrito, siguiendo un diseño moderno y funcional con las siguientes características:

## Funcionalidades Implementadas

### 1. **Header Mejorado**
- Título "CARRITO DE COMPRAS" en mayúsculas con tracking amplio
- Botón de cierre (X) más grande y visible
- Diseño limpio y profesional

### 2. **CartItem Rediseñado**

#### Visualización de Precios
- **Precio original** (tachado) cuando hay descuento
- **Precio con descuento** en rojo y destacado
- **Tag de descuento** con etiqueta negra mostrando el código y monto ahorrado
  - Formato: `edgarimn (-$13.950)`

#### Controles de Cantidad
- **Botones circulares +/-** para incrementar/decrementar cantidad
- Diseño con bordes redondeados y mejor UX
- **Botón de eliminar (papelera)** ubicado debajo del contador
- Transiciones suaves en hover

#### Botones de Acción Rápida
- **Botón Copiar**: Copia la información del producto al portapapeles
  - Muestra alerta de confirmación "¡Copiado!"
  - Icono de portapapeles
- **Botón Etiquetar**: Funcionalidad para etiquetar productos
  - Icono de etiqueta
  - Preparado para futuras integraciones

### 3. **Sección "También te puede gustar"**

- **Carrusel de productos relacionados**
- Navegación con flechas izquierda/derecha
- **Dots de navegación** para indicar posición actual
- Muestra producto con imagen, nombre, precio original y precio con descuento
- Botón de agregar rápido (+) circular en color cyan
- Fondo gris suave para diferenciar del contenido principal

### 4. **Subtotal Mejorado**

Muestra desglose detallado:
```
$139.500 - $13.950
Subtotal: $125.550 COP
```

- Precio original menos descuento igual a subtotal
- Formato en pesos colombianos (COP)
- Texto grande y bold para el total final

### 5. **Botones de Acción**

#### En el Drawer:
- **"VER CARRITO"**: Botón con borde, estilo outline
  - Navega a `/cart` para ver el carrito completo
- **"FINALIZAR COMPRA"**: Botón principal en color cyan
  - Navega a `/wompi-checkout` para proceder al pago
  - Estilo destacado con color de marca

#### En la Página del Carrito:
- **"Continuar Comprando"**: Regresa a la página de productos
- **"Finalizar Compra"**: Procede al checkout

### 6. **Métodos de Pago**

Footer con iconos/badges de métodos de pago aceptados:
- Icono genérico (símbolo ≡)
- Nequi
- Daviplata
- Addi
- VISA

### 7. **Branding**

- Logo/texto de la tienda: **imnnutrition.co**
- Mensaje de confianza: "Compra segura y protegida"

## Archivos Modificados

### 1. `CartDrawer.jsx`
- Nuevo header con título uppercase
- Integración de carrusel de productos relacionados
- Subtotal con desglose de descuentos
- Dos botones de acción separados
- Footer con métodos de pago

### 2. `CartItem.jsx`
- Rediseño completo del layout
- Botones +/- circulares para cantidad
- Botón de eliminar con icono de papelera
- Visualización de precios con descuento
- Tag de descuento con código
- Botones de acción rápida (copiar y etiquetar)
- Alertas de confirmación

### 3. `Cart.jsx` (Página completa)
- Diseño similar al drawer para consistencia
- Resumen de pedido detallado
- Carrusel de productos relacionados
- Métodos de pago
- Mejor manejo del estado vacío

## Características Técnicas

### Estado y Navegación
- Usa `useState` para manejar el carrusel
- Integración con `CartContext` para operaciones del carrito
- Navegación con `react-router-dom`

### Iconos
- Usa `lucide-react` para iconos modernos y consistentes
- Iconos: `X`, `Trash2`, `Minus`, `Plus`, `Copy`, `Tag`, `ChevronLeft`, `ChevronRight`

### Estilos
- Tailwind CSS para todos los estilos
- Transiciones suaves en hover
- Diseño responsive (móvil y escritorio)
- Colores de marca: cyan-500 para acciones principales

### UX Mejorada
- Feedback visual inmediato
- Alertas de confirmación
- Botones claramente diferenciados
- Información de precios transparente
- Navegación intuitiva

## Próximos Pasos (Opcionales)

1. **~~Productos Relacionados~~**: ✅ **IMPLEMENTADO** - Ahora obtiene productos reales de la base de datos
   - Filtra productos que ya están en el carrito
   - Prioriza productos de la misma categoría
   - Máximo 5 sugerencias
   - Botón funcional para agregar al carrito
   - Actualización dinámica después de agregar

2. **Etiquetado**: Implementar funcionalidad completa de etiquetado:
   - Guardar productos favoritos
   - Crear listas de deseos
   - Compartir productos

3. **Cupones de Descuento**: Agregar campo para aplicar cupones

4. **Estimación de Envío**: Mostrar costos de envío según ubicación

5. **Stock en Tiempo Real**: Mostrar disponibilidad del producto

## Uso

Para probar las nuevas funcionalidades:

1. Agrega productos al carrito desde la página de productos
2. Abre el drawer del carrito (icono de carrito en el header)
3. Prueba los botones +/- para cambiar cantidad
4. Haz clic en "Copiar" para copiar información del producto
5. Navega por los productos relacionados con las flechas
6. **Haz clic en el botón + (cyan) para agregar un producto relacionado al carrito**
7. Observa cómo se actualizan las sugerencias después de agregar
8. Haz clic en "VER CARRITO" para ver la página completa del carrito
9. Haz clic en "FINALIZAR COMPRA" para proceder al checkout

### Sistema de Productos Relacionados

El sistema de productos relacionados funciona de la siguiente manera:

1. **Carga automática**: Cuando abres el carrito con productos, automáticamente carga sugerencias
2. **Filtrado inteligente**:
   - Excluye productos que ya están en el carrito
   - Prioriza productos de la misma categoría
   - Muestra hasta 5 productos diferentes
3. **Agregar rápidamente**: Botón + (cyan) agrega el producto con un clic
4. **Actualización dinámica**: Después de agregar, las sugerencias se actualizan
5. **Navegación**: Usa flechas o dots para explorar las sugerencias
6. **Fallback de imágenes**: Si una imagen no carga, muestra un placeholder
7. **Loading state**: Muestra "Cargando..." mientras obtiene productos

## Notas de Desarrollo

- ✅ **Productos relacionados implementados**: Ahora obtienen datos reales de la API mediante `fetch` a `/products?limit=5`
- Los iconos de métodos de pago son representaciones simples. Puedes reemplazarlos con imágenes/logos reales.
- La funcionalidad de "etiquetar" está preparada pero requiere implementación backend.
- Los descuentos se calculan automáticamente si el producto tiene un campo `originalPrice` diferente a `price`.
- **API Endpoint**: Asegúrate de que `VITE_API_URL` esté configurado correctamente en tu archivo `.env`

### Funcionamiento Técnico de Productos Relacionados

```javascript
// La función fetchRelatedProducts:
// 1. Obtiene categorías de productos en el carrito
const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

// 2. Obtiene IDs de productos ya en el carrito
const cartProductIds = items.map(item => item._id || item.id);

// 3. Llama a la API
const response = await fetch(`${import.meta.env.VITE_API_URL}/products?limit=5`);

// 4. Filtra productos que no están en el carrito
let filtered = data.data.filter(product => !cartProductIds.includes(product._id));

// 5. Prioriza misma categoría
const sameCategory = filtered.filter(product => categories.includes(product.category));
const otherCategory = filtered.filter(product => !categories.includes(product.category));
filtered = [...sameCategory, ...otherCategory];

// 6. Toma máximo 5 productos
setRelatedProducts(filtered.slice(0, 5));
```

### Configurar Productos con Descuento

Para que un producto muestre descuento en el carrito:

1. **En el Backend**: El modelo de Producto ahora incluye el campo `originalPrice`:
   ```javascript
   originalPrice: {
     type: Number,
     min: [0, 'El precio original no puede ser negativo'],
     default: null
   }
   ```

2. **Al crear/editar un producto**:
   - `price`: Precio actual con descuento (ej: 125550)
   - `originalPrice`: Precio original sin descuento (ej: 139500)
   - Si `originalPrice` no se especifica o es null, no se mostrará descuento

3. **Ejemplo de producto con descuento**:
   ```json
   {
     "name": "Essence Whey",
     "price": 125550,
     "originalPrice": 139500,
     "description": "Proteína de alta calidad",
     ...
   }
   ```

4. **Visualización automática**:
   - En ProductCard: Muestra porcentaje de descuento
   - En CartItem: Muestra precio tachado y tag de descuento
   - En Subtotal: Calcula ahorro total

### Código de Descuento Personalizado

El tag de descuento actualmente muestra "edgarimn" como código hardcodeado. Para personalizarlo:

1. **Opción 1 - Campo en el producto**:
   Agregar campo `discountCode` al modelo de producto:
   ```javascript
   discountCode: {
     type: String,
     trim: true,
     default: null
   }
   ```

2. **Opción 2 - Sistema de cupones**:
   Crear un sistema de cupones donde cada descuento tenga un código asociado

3. **Modificar CartItem.jsx** línea del tag:
   ```jsx
   <span>{item.discountCode || 'DESCUENTO'} (-${discount.toLocaleString()})</span>
   ```

## Compatibilidad

- React 18+
- React Router DOM v6
- Tailwind CSS v3
- Lucide React (iconos)

---

**Fecha de implementación**: Octubre 2025
**Versión**: 2.0
