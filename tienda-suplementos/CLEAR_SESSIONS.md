# 🧹 Limpiar Sesiones - Guía Rápida

## Problema
Al iniciar la aplicación, apareces automáticamente logueado como admin debido a que el token se guarda en `localStorage` y persiste entre recargas.

## Soluciones Implementadas

### ✅ 1. Arreglo en la función `logout()`
Se actualizó la función `logout()` en `AuthContext.jsx` para que limpie completamente la sesión:
- Elimina `token` de localStorage
- Elimina `user` de localStorage  
- Elimina el header de Authorization de axios
- Despacha la acción LOGOUT al reducer

### ✅ 2. Atajo de Teclado Global
Se agregó un componente `ClearStorage.jsx` que detecta la combinación:

**`Ctrl + Shift + L`**

Esto limpiará todo el localStorage y sessionStorage, y recargará la página automáticamente.

### 3. Limpiar Manualmente desde Consola

#### Opción A: Desde DevTools del Navegador
1. Abre la aplicación en el navegador
2. Presiona `F12` para abrir las DevTools
3. Ve a la pestaña **Console**
4. Ejecuta el siguiente comando:

```javascript
localStorage.clear(); sessionStorage.clear(); location.reload();
```

#### Opción B: Desde Application Tab
1. Abre DevTools (`F12`)
2. Ve a la pestaña **Application**
3. En el panel izquierdo, expande **Local Storage**
4. Haz clic derecho en tu dominio (localhost:5173 o similar)
5. Selecciona **Clear**
6. Recarga la página (`F5`)

### 4. Cerrar Sesión desde el Admin Panel
Si estás logueado como admin:
1. Ve al Admin Panel
2. Haz clic en el botón **Cerrar Sesión** (icono de logout) en la esquina superior derecha
3. Esto cerrará la sesión completamente

## Verificar que Funciona

Después de limpiar el localStorage:
1. Recarga la página
2. **NO** deberías estar logueado
3. Deberías ver la página principal de la tienda (no el admin panel)
4. El Header debe mostrar el icono de login, no el de perfil

## Para Desarrollo

Si quieres evitar que se guarde la sesión durante el desarrollo, puedes comentar estas líneas en `AuthContext.jsx`:

```javascript
// Comentar estas líneas temporalmente:
// localStorage.setItem('token', token);
// localStorage.setItem('user', JSON.stringify(user));
```

Pero recuerda descomentarlas para producción.

## Atajo Rápido para Recordar

🎯 **`Ctrl + Shift + L`** = Logout Total + Recarga
