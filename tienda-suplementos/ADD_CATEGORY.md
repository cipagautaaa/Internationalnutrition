# Cómo agregar una categoría (o cosas específicas por categoría)

Esta guía resume dónde agregar código cuando quieres crear módulos, "tablas" (colecciones Mongo), o imágenes específicas para una categoría nueva o existente.

## Backend (Node/Express/Mongo)

- Modelo de productos: `backend/models/Product.js`
  - Campo `category` es un String con `enum` fijo:
    - ['Proteínas','Creatina','Aminoácidos','Pre-Workout','Vitaminas','Para la salud','Complementos','Comida']
  - Si creas una nueva categoría, debes agregarla en ese enum para que el backend acepte el valor.
  - Validaciones por categoría: el campo `tipo` tiene validación condicional (Proteínas, Creatina). Si tu nueva categoría necesita subtipos, extiende esa validación.

- API de productos: `backend/routes/products.js`
  - Soporta filtro por `?category=<NombreExacto>`.
  - Subida de imágenes: `POST /api/products/upload-image` guarda en `backend/public/uploads` y devuelve `/uploads/<archivo>`.
  - No necesitas rutas nuevas para listar por categoría; usa el query param `category`.

- Montaje de rutas: `backend/server.js`
  - Las rutas están montadas bajo `/api/*`. Si agregas módulos nuevos (por ejemplo, `/api/categories`), crea un archivo en `backend/routes/` y móntalo aquí con `app.use('/api/categories', require('./routes/categories'))`.

## Frontend (React + Vite)

Hay dos formas de mostrar categoría:

1) Páginas dedicadas por categoría (recomendado para personalizar hero y contenido):
   - Ubicación: `frontend/src/pages/categories/`
   - Base reutilizable: `frontend/src/pages/categories/_CategoryPageBase.jsx`
   - Crea un archivo por categoría, ejemplo `Cafeina.jsx`:
     ```jsx
     import CategoryPageBase from './_CategoryPageBase';
     export default function Cafeina() { return <CategoryPageBase title="Cafeína" />; }
     ```
   - Rutas: agrega en `frontend/src/App.jsx` una ruta como:
     ```jsx
     <Route path="/products/cafeina" element={<Cafeina />} />
     ```
   - Hero/imagen de cabecera: configura en `frontend/src/pages/categoryConfigs.js`:
     ```js
     import cafeinaImg from '../assets/images/cafeina.jpg';
     export const CATEGORY_META = {
       'Cafeína': { hero: { type: 'image', src: cafeinaImg, height: 'calc(100vh - 36px)', overlay: 'bg-black/20' } },
       // ...
     };
     ```

2) Página genérica con slug (`/products/:category`) que traduce a nombres con acentos:
   - Archivo: `frontend/src/pages/Products.jsx`
   - Mapea slugs a nombres exactos de categoría (con acentos) para que el backend filtre.
   - Úsala como fallback si no tienes página dedicada.

- Listado de productos: `frontend/src/components/ProductList.jsx`
  - Pasa `category` con el nombre exacto (ej: 'Creatina', 'Aminoácidos') para que el frontend consulte `/api/products?category=...`.
  - Tabs de tipos sólo aparecen para 'Proteínas' y 'Creatina' por ahora; amplía en `CategoryTypeTabs.jsx` si tu categoría tiene subtipos.

- Carrusel/links a categorías: `frontend/src/components/CategoryCarousel.jsx` y `frontend/src/components/Header.jsx`
  - Asegúrate de agregar el link con slug en minúsculas y sin acentos (ej: `/products/cafeina`).

## Imágenes por categoría

- Activos estáticos para héroes y banners: `frontend/src/assets/images/`
  - Importa la imagen y referencia desde `categoryConfigs.js`.
  - Para imágenes subidas dinámicamente de productos, usa la API backend de upload y guarda la URL `/uploads/...` en el documento del producto.

## Checklists

- Nueva categoría "X":
  - [ ] Backend: agregar 'X' al enum de `Product.js` (y validar `tipo` si aplica).
  - [ ] Frontend: crear `src/pages/categories/X.jsx` usando `CategoryPageBase`.
  - [ ] Frontend: añadir ruta `/products/x` en `App.jsx`.
  - [ ] Frontend: añadir imagen en `src/assets/images/` y registrar en `pages/categoryConfigs.js` con clave exacta 'X'.
  - [ ] Navegación: agregar link en `Header.jsx`, `CategoryCarousel.jsx`, y/o `footer.jsx`.
  - [ ] Admin: si usas formularios, agrega 'X' a los arrays de categorías en `components/admin/ProductForm.jsx` y `pages/AdminProducts.jsx`.
  - [ ] Verificar que `Products.jsx` mapee el slug (si también usas la ruta genérica).

## Convenciones

- Slugs (en la URL): minúsculas, sin acentos ni espacios. Ej: 'aminoacidos', 'preworkout'.
- Títulos/keys (para backend y UI): con acentos y mayúsculas normales. Ej: 'Aminoácidos', 'Pre-Workout'.
- El nombre exacto que ve el backend debe coincidir con `category` del documento Mongo.

---

Si quieres, puedo automatizar esto con un script/CLI (scaffold) que cree el archivo de página, agregue la ruta y el entry en `CATEGORY_META` a partir de un nombre y un slug.
