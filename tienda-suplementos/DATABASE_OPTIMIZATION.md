# 📊 OPTIMIZACIÓN DE BASE DE DATOS - ÍNDICES MONGODB

## 🎯 ¿Qué son los Índices?

Los índices en MongoDB son estructuras de datos que mejoran la velocidad de las consultas. Son como el índice de un libro: en lugar de leer todo el libro para encontrar un tema, puedes ir directamente a la página indicada.

## 🚀 Beneficios de los Índices Implementados

### ⚡ **Mejoras de Rendimiento Esperadas:**
- **Búsquedas por email**: 10-50x más rápidas
- **Filtros por categoría**: 5-20x más rápidas  
- **Búsquedas de texto**: 20-100x más rápidas
- **Consultas de órdenes**: 5-30x más rápidas
- **Ordenamientos**: 3-10x más rápidos

## 📋 Índices Creados

### 👤 **MODELO USER**
1. **email_unique_idx** - Índice único en email
2. **email_verified_idx** - Búsquedas por email + verificación
3. **admin_idx** - Filtro de administradores
4. **verification_code_ttl_idx** - TTL para códigos (auto-expira)

### 🛍️ **MODELO PRODUCT**
1. **category_idx** - Filtros por categoría
2. **category_price_idx** - Categoría + precio (ordenamiento)
3. **stock_idx** - Productos en stock
4. **product_text_search_idx** - Búsqueda de texto completo
5. **created_at_desc_idx** - Ordenamiento por fecha
6. **rating_stock_idx** - Rating + stock

### 📦 **MODELO ORDER**
1. **user_idx** - Órdenes por usuario
2. **user_created_desc_idx** - Usuario + fecha (historial)
3. **payment_status_idx** - Estado de pago
4. **order_status_idx** - Estado de orden
5. **mercadopago_payment_idx** - ID de pago MercadoPago
6. **payment_status_date_idx** - Reportes de admin

## 🛠️ Comandos de Ejecución

### **Crear todos los índices:**
```bash
cd backend
npm run create-indexes
```

### **Eliminar índices personalizados:**
```bash
cd backend
npm run drop-indexes
```

### **Configurar BD desde cero:**
```bash
cd backend
npm run db:setup
```

## 📈 Casos de Uso Optimizados

### **1. Login de Usuario**
```javascript
// ANTES: Scan completo de la colección
User.findOne({ email, isEmailVerified: true })

// DESPUÉS: Usa email_verified_idx
// ⚡ 10-50x más rápido
```

### **2. Búsqueda de Productos**
```javascript
// ANTES: Scan completo por categoría
Product.find({ category: 'Proteínas' }).sort({ price: 1 })

// DESPUÉS: Usa category_price_idx
// ⚡ 5-20x más rápido
```

### **3. Búsqueda de Texto**
```javascript
// ANTES: Sin búsqueda de texto
// DESPUÉS: Usa product_text_search_idx
Product.find({ $text: { $search: "whey protein" } })
// ⚡ 20-100x más rápido
```

### **4. Historial de Órdenes**
```javascript
// ANTES: Scan completo por usuario
Order.find({ user: userId }).sort({ createdAt: -1 })

// DESPUÉS: Usa user_created_desc_idx
// ⚡ 5-30x más rápido
```

## 🔍 Verificar Índices

### **Ver todos los índices:**
```javascript
// En MongoDB Compass o shell
db.users.getIndexes()
db.products.getIndexes()
db.orders.getIndexes()
```

### **Analizar rendimiento de consultas:**
```javascript
// Agregar .explain() a cualquier consulta
db.products.find({ category: "Proteínas" }).explain("executionStats")
```

## ⚠️ Consideraciones Importantes

### **✅ Ventajas:**
- Consultas mucho más rápidas
- Mejor experiencia de usuario
- Menor carga del servidor
- Escalabilidad mejorada

### **⚠️ Desventajas:**
- Espacio adicional en disco (~10-20%)
- Escrituras ligeramente más lentas
- Mantenimiento automático por MongoDB

## 🎯 Cuándo Ejecutar

### **Primera vez (Obligatorio):**
```bash
npm run create-indexes
```

### **Después de cambios en esquemas:**
Si modificas los modelos, podrías necesitar recrear índices.

### **En producción:**
Los índices se crean automáticamente en background, no afectan la disponibilidad.

## 📊 Monitoreo de Rendimiento

### **Herramientas recomendadas:**
1. **MongoDB Compass** - GUI para ver índices y rendimiento
2. **MongoDB Atlas** - Métricas automáticas si usas Atlas
3. **Logs de aplicación** - Tiempo de respuesta de APIs

### **Métricas a observar:**
- Tiempo de respuesta de búsquedas
- Uso de CPU en BD
- Operaciones por segundo
- Cache hit ratio

## 🚀 Próximos Pasos

1. **Ejecutar el script** de índices
2. **Monitorear rendimiento** durante una semana
3. **Considerar paginación** si tienes muchos productos
4. **Agregar cache Redis** para consultas muy frecuentes

---

💡 **Tip:** Los índices son la optimización más efectiva para bases de datos. Con estos cambios, tu aplicación estará lista para manejar miles de usuarios concurrentes.