# 🔐 Obtener Contraseña de Aplicación de Google

## 📋 ¿Por Qué Necesito Esto?

Google no permite que envíes emails directamente con tu contraseña normal desde una app. Debes generar una **contraseña especial de aplicación** de 16 caracteres.

---

## 🔑 Pasos para Obtenerla

### Paso 1: Ve a tu Cuenta de Google

1. Abre [myaccount.google.com](https://myaccount.google.com)
2. Inicia sesión si no lo has hecho
3. En el menú izquierdo, busca **Seguridad** (o **Security**)
4. Haz clic en **Seguridad**

### Paso 2: Activa Autenticación de 2 Pasos (si no lo tienes)

Si ves esta opción:
1. Busca **Autenticación de 2 pasos** (o **2-Step Verification**)
2. Si está desactivada, haz clic en **Activar**
3. Sigue los pasos (Google te pedirá verificar con tu teléfono)

> **Importante**: La contraseña de aplicación SÓ existe si tienes 2-Step activado.

### Paso 3: Abre Contraseñas de Aplicación

Una vez que tienes 2-Step:
1. Ve de nuevo a [myaccount.google.com/security](https://myaccount.google.com/security)
2. En el menú izquierdo, busca **Contraseñas de aplicación** (App passwords)
3. Haz clic en **Contraseñas de aplicación**

### Paso 4: Selecciona App y Dispositivo

Verás dos opciones:
- **Selecciona la app**: Elige **Correo** (Mail)
- **Selecciona el dispositivo**: Elige **Windows Computer** (o tu dispositivo)

### Paso 5: Genera y Copia

1. Haz clic en **Generar** (Generate)
2. Google mostrará una contraseña de 16 caracteres
3. Verás algo como: `lmno pqrs tuvw xyz` (con espacios)
4. **Cópiala:**
   - Haz clic en el icono de copiar
   - O selecciona y copia manualmente

---

## 📝 Cómo Usarla en Railway

### Importante: Sin Espacios

Google te muestra:
```
lmno pqrs tuvw xyz
```

Pero en Railway debes pegar **sin espacios**:
```
lmnopqrstuvwxyz
```

### En Railway:

1. Ve a Variables del Backend
2. Agrega: `EMAIL_PASS` = `lmnopqrstuvwxyz` (sin espacios)

---

## 🖥️ Pantallazos Guía

### Pantalla 1: Security de Google

```
┌─ Google Account Security ─────────────────────┐
│                                               │
│ ⬅ Volver                                     │
│                                               │
│ Mi Seguridad                                 │
│ ├─ Autenticación de 2 pasos ... ✅ Activa   │
│ ├─ Contraseñas de aplicación ... ← AQUI     │
│ ├─ Tus dispositivos                         │
│ └─ Actividad reciente                       │
│                                               │
└───────────────────────────────────────────────┘
```

### Pantalla 2: Seleccionar App

```
┌─ Contraseñas de Aplicación ───────────────────┐
│                                               │
│ Selecciona la app:  [Correo ▼]               │
│ Selecciona el dispositivo: [Windows ▼]       │
│                                               │
│                 [GENERAR]                     │
│                                               │
└───────────────────────────────────────────────┘
```

### Pantalla 3: Contraseña Generada

```
┌─ Tu Contraseña de Aplicación ─────────────────┐
│                                               │
│ Tu contraseña de aplicación para Correo:     │
│                                               │
│  lmno pqrs tuvw xyz  [Copiar]                │
│                                               │
│ Esta contraseña se mostrará una sola vez.    │
│ Guárdala en un lugar seguro.                 │
│                                               │
│                 [LISTO]                       │
│                                               │
└───────────────────────────────────────────────┘
```

---

## ❓ Preguntas Frecuentes

### "¿Dónde está 'Contraseñas de aplicación'?"

Si NO ves esta opción:
1. Verifica que tienes **Autenticación de 2 pasos ACTIVADA**
2. Si está desactivada, actívala primero
3. Espera 5 minutos
4. Recarga [myaccount.google.com/security](https://myaccount.google.com/security)

### "Me pide código de verificación"

Google te pedirá verificar tu identidad:
1. Selecciona cómo quieres verificar (SMS, app de autenticación, etc.)
2. Completa la verificación
3. Continúa

### "La contraseña que generé ya no sirve"

Las contraseñas de aplicación se pueden usar múltiples veces, pero:
- Si la perdiste, genera una nueva
- La anterior seguirá funcionando
- Puedes tener varias contraseñas de aplicación

### "¿Cuándo expira la contraseña?"

Las contraseñas de aplicación **NO expiran**. Duran indefinidamente.

---

## 🔒 Seguridad

- ✅ Es seguro poner esta contraseña en Railway
- ✅ Es diferente a tu contraseña normal de Google
- ✅ Si se filtra, puedes eliminarla sin afectar tu cuenta
- ✅ Google NO te dará esta contraseña de nuevo (guárdala)

---

## 📊 Resumen

1. Ve a myaccount.google.com/security
2. Activa "Autenticación de 2 pasos" (si no lo tienes)
3. Abre "Contraseñas de aplicación"
4. Selecciona Correo + Windows
5. Haz clic en Generar
6. **Copia sin espacios**: `lmnopqrstuvwxyz`
7. Pégalo en Railway como `EMAIL_PASS`

---

**Última actualización**: Diciembre 2025
