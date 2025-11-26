# 🔒 Seguridad de Sesión de Administrador

## Problema Resuelto

Antes, cuando un administrador iniciaba sesión, su token se guardaba en `localStorage`, lo que causaba que:
- Al recargar la página, aparecía automáticamente como admin sin pedir el PIN
- Cualquier persona con acceso a la computadora podía entrar al panel de admin sin autenticación

## Solución Implementada

### 🎯 **Tokens de Admin NO se persisten en localStorage**

Ahora, las credenciales de administrador se manejan de manera especial:

1. **Durante el login**: Los tokens de admin NO se guardan en `localStorage`
2. **Al recargar la página**: El admin debe autenticarse nuevamente con email + PIN
3. **Usuarios normales**: Sus tokens SÍ se guardan (para mejor UX)

### 📋 Cambios en el Código

#### 1. `AuthContext.jsx` - Función `login()`
```javascript
if (user.role !== 'admin') {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
```
Solo guarda el token si el usuario NO es admin.

#### 2. `AuthContext.jsx` - Función `verifyCode()`
```javascript
if (user.role !== 'admin') {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
```
Mismo comportamiento para verificación de código.

#### 3. `AuthContext.jsx` - Función `verifyAdminPin()`
```javascript
// NO guardar token de admin en localStorage (por seguridad)
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
dispatch({ type: 'ADMIN_PIN_SUCCESS', payload: { user } });
```
El token se establece en axios pero NO se guarda en localStorage.

#### 4. `AuthContext.jsx` - useEffect boot
```javascript
// Si hay un usuario guardado y es admin, NO restaurar sesión
if (savedUser) {
  const userData = JSON.parse(savedUser);
  if (userData.role === 'admin') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return;
  }
}
```
Al iniciar la app, limpia cualquier token de admin que pueda estar guardado.

#### 5. `ClearStorage.jsx` - Limpieza automática
```javascript
useEffect(() => {
  const cleanAdminSession = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.role === 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  };
  cleanAdminSession();
}, []);
```
Al cargar cualquier página, verifica y limpia sesiones de admin automáticamente.

## 🔐 Flujo de Autenticación Actual

### Para Administradores:
1. Navegar a `/login`
2. Ingresar email de admin
3. Ingresar PIN de administrador
4. ✅ Acceso al panel de admin
5. **Si recarga la página**: Debe autenticarse nuevamente (email + PIN)
6. **Si cierra sesión**: Redirige a `/login`

### Para Usuarios Normales:
1. Navegar a `/sign-in` o `/login`
2. Ingresar email
3. Verificar código de 6 dígitos
4. ✅ Acceso a la tienda
5. **Si recarga la página**: Mantiene la sesión activa
6. **Si cierra sesión**: Token eliminado de localStorage

## 🛡️ Ventajas de Seguridad

1. **Protección contra acceso no autorizado**: Nadie puede usar el panel de admin sin conocer el PIN
2. **Sesiones temporales**: Las sesiones de admin expiran al cerrar el navegador o recargar
3. **Limpieza automática**: Cualquier token de admin guardado accidentalmente se elimina automáticamente
4. **Separación de privilegios**: Usuarios normales tienen mejor UX, admins tienen mejor seguridad

## 🧪 Cómo Probar

### Prueba 1: Admin debe autenticarse siempre
1. Abre la aplicación en el navegador
2. Ve a `/login`
3. Ingresa email de admin
4. Ingresa PIN
5. ✅ Verifica que accede al panel
6. **Recarga la página (F5)**
7. ✅ Verifica que pide email + PIN nuevamente (NO está logueado automáticamente)

### Prueba 2: Usuario normal mantiene sesión
1. Ve a `/sign-in`
2. Ingresa email de usuario normal
3. Verifica código
4. ✅ Acceso a la tienda
5. **Recarga la página (F5)**
6. ✅ Verifica que sigue logueado (NO pide autenticación)

### Prueba 3: Limpieza automática
1. Abre DevTools (F12)
2. Ve a Console
3. Ejecuta: `localStorage.setItem('user', '{"role":"admin","email":"test@admin.com"}')`
4. **Recarga la página (F5)**
5. Abre Console nuevamente
6. Ejecuta: `localStorage.getItem('user')`
7. ✅ Verifica que devuelve `null` (fue limpiado automáticamente)

## 🔄 Comparación: Antes vs Ahora

| Escenario | Antes | Ahora |
|-----------|-------|-------|
| Admin recarga página | Logueado automáticamente ❌ | Debe autenticarse ✅ |
| Admin cierra navegador | Sesión persiste ❌ | Sesión expira ✅ |
| Usuario recarga página | Logueado automáticamente ✅ | Logueado automáticamente ✅ |
| Token en localStorage | Sí (admin y usuario) ❌ | Solo usuario ✅ |
| Seguridad admin | Baja ❌ | Alta ✅ |
| UX usuario normal | Buena ✅ | Buena ✅ |

## 📌 Notas Importantes

- **Este comportamiento es intencional y mejora la seguridad**
- Los admins deben autenticarse en cada sesión (email + PIN)
- Los usuarios normales mantienen la comodidad de sesiones persistentes
- El atajo `Ctrl + Shift + L` sigue funcionando para limpiar todo el localStorage manualmente

## 🚀 Próximos Pasos Opcionales

Si deseas aún más seguridad, puedes implementar:
1. **Expiración de token**: Tokens de admin expiran después de X minutos de inactividad
2. **Auditoría de acceso**: Registrar cada acceso de admin en base de datos
3. **2FA adicional**: Requerir código SMS además del PIN
4. **IP Whitelist**: Solo permitir acceso de admin desde IPs específicas
