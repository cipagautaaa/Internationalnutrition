# 📧 Configuración de Email - Referencia Rápida

## Estado Actual
- **Proveedor**: Gmail OAuth (API HTTP)
- **Por qué**: Railway bloquea SMTP, Gmail OAuth usa HTTP y funciona sin problemas.

---

## Variables de Railway (celebrated-beauty)

```
EMAIL_PROVIDER=gmail-oauth
EMAIL_USER=internationalnutritioncol@gmail.com
EMAIL_FROM=internationalnutritioncol@gmail.com
ADMIN_EMAIL=internationalnutritioncol@gmail.com
GMAIL_CLIENT_ID=(tu client id de Google Cloud Console)
GMAIL_CLIENT_SECRET=(tu client secret de Google Cloud Console)
GMAIL_REFRESH_TOKEN=(valor generado con get-gmail-token.js)
```

---

## 🔴 Si los emails dejan de funcionar

### Paso 1: Diagnosticar
Abre en el navegador:
```
https://api.intsupps.com/api/email-status
```

- Si dice `Gmail OAuth configurado correctamente` → el problema es otro.
- Si dice `ERROR` o `Faltante` → faltan variables en Railway.

### Paso 2: Probar envío
```powershell
Invoke-RestMethod -Method Post -Uri "https://api.intsupps.com/api/auth/test-email" -ContentType "application/json" -Body '{"email":"TU_CORREO@gmail.com"}'
```

- `success: true` → funciona, revisa spam.
- `success: false` con `invalid_grant` o `Token expired` → regenerar refresh token (ver abajo).

---

## 🔄 Regenerar GMAIL_REFRESH_TOKEN

Esto es necesario si:
- El token expira (puede pasar si la app OAuth está en modo "Testing")
- Cambias la contraseña de la cuenta de Gmail
- Revocas permisos en Google

### Pasos:

1. **En tu PC local**, abre PowerShell:
   ```
   cd "c:\Users\luism\OneDrive\Escritorio\octavo semestre\InternationalNutrition\tienda-suplementos\backend"
   node get-gmail-token.js
   ```

2. **Abre el link** que imprime, autoriza con `internationalnutritioncol@gmail.com`.

3. **Copia el nuevo `GMAIL_REFRESH_TOKEN`** que imprime el script.

4. **En Railway** → celebrated-beauty → Variables:
   - Actualiza `GMAIL_REFRESH_TOKEN` con el nuevo valor.
   - Redeploy.

---

## ⚠️ Evitar que el token expire pronto

El refresh token puede expirar en 7 días si la app OAuth está en modo "Testing".

### Solución: Mover a Producción
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Proyecto: **email INTSUPPS**
3. Google Auth Platform → **Público**
4. Cambia de "Pruebas" a **"En producción"**
5. (Google puede pedir verificación, pero para tu propio dominio suele funcionar sin verificar)

---

## 📋 Checklist de Variables en Railway

| Variable | Valor esperado |
|----------|----------------|
| `EMAIL_PROVIDER` | `gmail-oauth` |
| `EMAIL_USER` | `internationalnutritioncol@gmail.com` |
| `EMAIL_FROM` | `internationalnutritioncol@gmail.com` |
| `ADMIN_EMAIL` | `internationalnutritioncol@gmail.com` |
| `GMAIL_CLIENT_ID` | `327751835698-...apps.googleusercontent.com` |
| `GMAIL_CLIENT_SECRET` | `GOCSPX-...` |
| `GMAIL_REFRESH_TOKEN` | `1//01...` (largo) |

---

## 📞 Endpoints útiles

| Endpoint | Para qué |
|----------|----------|
| `GET /api/email-status` | Ver configuración actual |
| `POST /api/auth/test-email` | Probar envío (body: `{"email":"..."}`) |
| `GET /api/health` | Verificar que el servidor responde |

---

## 🛡️ Seguridad

- **No compartas** `GMAIL_CLIENT_SECRET` ni `GMAIL_REFRESH_TOKEN` públicamente.
- Si los expones por error, regenera el Client Secret en Google Cloud y vuelve a generar el refresh token.
