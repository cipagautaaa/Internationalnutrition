# Troubleshooting: "También te puede gustar" no aparece

## Problema
La sección "También te puede gustar" no se muestra en el carrito.

## Diagnóstico

### 1. Verificar en la Consola del Navegador

Abre las **DevTools** (F12) y ve a la pestaña **Console**. Deberías ver logs como estos:

```
CartDrawer - isCartOpen: true items: 1
Iniciando fetchRelatedProducts...
API Response: {success: true, data: Array(10)}
Filtered products: 5
Final products to show: 5
```

### 2. Posibles Causas

#### Causa 1: Variable de Entorno no Configurada
**Problema**: `VITE_API_URL` no está definida

**Solución**:
1. Verifica que existe el archivo `.env` en la carpeta `frontend/`
2. El contenido debe ser:
```env
VITE_API_URL=http://localhost:5000/api
```
3. Reinicia el servidor de desarrollo después de crear/modificar `.env`

#### Causa 2: Backend no Está Corriendo
**Problema**: La API no responde

**Solución**:
1. Abre una terminal en la carpeta `backend/`
2. Ejecuta: `npm start` o `node server.js`
3. Verifica que se muestre: `Servidor corriendo en puerto 5000`

#### Causa 3: No Hay Productos en la Base de Datos
**Problema**: La base de datos está vacía

**Solución**:
1. En la carpeta `backend/`, ejecuta el seed:
```bash
node seed.js
```
2. Esto creará productos de ejemplo

#### Causa 4: Todos los Productos Están en el Carrito
**Problema**: El filtro elimina todos los productos

**Solución**:
- Si solo tienes pocos productos y todos están en el carrito, no habrá sugerencias
- Agrega más productos a la base de datos
- O vacía algunos productos del carrito

#### Causa 5: Error de CORS
**Problema**: El navegador bloquea las peticiones

**Solución**:
Verifica en `backend/server.js` que CORS esté configurado:
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // URL de tu frontend
  credentials: true
}));
```

### 3. Verificación Manual

#### Probar la API Directamente
Abre el navegador y ve a:
```
http://localhost:5000/api/products?limit=5
```

Deberías ver un JSON con productos:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Producto 1",
      "price": 100000,
      ...
    }
  ]
}
```

### 4. Estados Visuales

El componente ahora muestra diferentes estados:

1. **Cargando**: Verás "Cargando productos..."
2. **Con productos**: Verás el carrusel
3. **Sin productos**: Verás "No hay productos disponibles"
4. **No se muestra nada**: Revisa los pasos anteriores

### 5. Verificar Consola de Logs

Los logs te dirán exactamente qué está pasando:

```javascript
// Logs que deberías ver:
CartDrawer - isCartOpen: true items: 1
Iniciando fetchRelatedProducts...
API Response: {success: true, data: Array(10)}
Filtered products: 8
Final products to show: 5
```

**Si ves**:
- `API Response: undefined` → El backend no responde
- `Filtered products: 0` → Todos los productos están en el carrito
- `Error al obtener productos relacionados:` → Revisa el error específico

### 6. Verificar que el Carrito Tenga Productos

La sección solo aparece si:
```javascript
isCartOpen && items.length > 0
```

**Asegúrate de**:
1. Agregar al menos 1 producto al carrito
2. Abrir el carrito (clic en el icono del carrito)

## Checklist de Verificación

- [ ] `.env` existe y tiene `VITE_API_URL=http://localhost:5000/api`
- [ ] Backend está corriendo en puerto 5000
- [ ] Base de datos tiene productos (ejecutar `node seed.js`)
- [ ] Al menos 1 producto en el carrito
- [ ] Carrito está abierto
- [ ] No hay errores en la consola del navegador
- [ ] La API responde correctamente (probar manualmente)
- [ ] CORS está configurado correctamente

## Solución Rápida

Si nada funciona, ejecuta estos comandos en orden:

```bash
# Terminal 1 - Backend
cd backend
npm install
node seed.js
npm start

# Terminal 2 - Frontend (nueva terminal)
cd frontend
npm install
# Asegúrate de tener .env con VITE_API_URL
npm run dev
```

Luego:
1. Abre http://localhost:5173
2. Agrega un producto al carrito
3. Abre el carrito
4. Abre DevTools (F12) y verifica la consola

## Contacto

Si sigues teniendo problemas, revisa:
1. Los logs en la consola del navegador
2. Los logs en la terminal del backend
3. Que ambos servidores estén corriendo simultáneamente

---

**Última actualización**: Octubre 2025
