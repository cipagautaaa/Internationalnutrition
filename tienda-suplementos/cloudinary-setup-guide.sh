#!/bin/bash
# Script para guiar configuración de Cloudinary
# Uso: bash cloudinary-setup-guide.sh

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "    🖼️  CLOUDINARY SETUP - GUÍA INTERACTIVA"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Función para mostrar paso
show_step() {
    local step=$1
    local title=$2
    local total=$3
    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│ PASO $step/$total: $title"
    echo "└─────────────────────────────────────────────────────────────┘"
}

# Función para mostrar instrucciones
show_instruction() {
    echo "→ $1"
}

# Función para pedir confirmación
ask_continue() {
    read -p "¿Listo para continuar? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Abortado"
        exit 1
    fi
}

# PASO 1: Crear Cuenta
show_step "1" "CREAR CUENTA CLOUDINARY" "6"
echo ""
show_instruction "1. Abre tu navegador"
show_instruction "2. Ve a: https://cloudinary.com"
show_instruction "3. Haz clic en: 'Sign Up for Free'"
show_instruction "4. Completa:"
show_instruction "   • Email: tu_email@gmail.com"
show_instruction "   • Contraseña: segura_123"
show_instruction "   • Nombre: Tu Nombre"
show_instruction "5. Confirma tu email"
show_instruction "6. Inicia sesión en el dashboard"
echo ""
ask_continue

# PASO 2: Obtener Credenciales
show_step "2" "OBTENER CREDENCIALES" "6"
echo ""
show_instruction "1. Estando en: https://cloudinary.com/console"
show_instruction "2. Busca el panel en la parte SUPERIOR"
show_instruction "3. Verás 3 campos:"
echo ""
echo "   ┌──────────────────────────────────────────────┐"
echo "   │ Cloud Name    │ ej: dvp3e4w8p                │"
echo "   │ API Key       │ ej: 123456789012345          │"
echo "   │ API Secret    │ ej: a1b2c3d4e5f6g7h8i9j0... │"
echo "   └──────────────────────────────────────────────┘"
echo ""
show_instruction "4. COPIA estos 3 valores (Ctrl+C)"
show_instruction "5. Prepárate para pegarlos en el siguiente paso"
echo ""
ask_continue

# PASO 3: Abrir Editor
show_step "3" "ABRIR ARCHIVO .env" "6"
echo ""
show_instruction "1. Abre VS Code (o tu editor)"
show_instruction "2. Navega a: tienda-suplementos/backend/.env"
show_instruction "3. Busca la sección:"
echo ""
echo "   # Cloudinary Configuration"
echo "   CLOUDINARY_CLOUD_NAME="
echo "   CLOUDINARY_API_KEY="
echo "   CLOUDINARY_API_SECRET="
echo ""
show_instruction "4. Posiciónate después de cada '='"
echo ""
ask_continue

# PASO 4: Completar Valores
show_step "4" "COMPLETAR VALORES EN .env" "6"
echo ""
show_instruction "Detrás de cada = pega tus valores:"
echo ""
echo "   CLOUDINARY_CLOUD_NAME=dvp3e4w8p"
echo "   CLOUDINARY_API_KEY=123456789012345"
echo "   CLOUDINARY_API_SECRET=a1b2c3d4e5f6g7h8i9j0"
echo ""
show_instruction "❌ NO uses comillas"
show_instruction "❌ NO agregues espacios extras"
show_instruction "✅ Guarda el archivo (Ctrl+S)"
echo ""
ask_continue

# PASO 5: Crear Productos de Prueba
show_step "5" "CREAR 4 PRODUCTOS DE PRUEBA" "6"
echo ""
show_instruction "Abre una terminal en VS Code (Ctrl+`)"
show_instruction "Navega a backend:"
echo ""
echo "   cd backend"
echo ""
show_instruction "Ejecuta el script:"
echo ""
echo "   node testCloudinaryProducts.js"
echo ""
show_instruction "Deberías ver:"
echo ""
echo "   ✅ Conectado a MongoDB"
echo "   ✅ 4 productos creados exitosamente"
echo ""
show_instruction "Si algo falla:"
echo "   • ¿Completaste el .env? (sin espacios, sin comillas)"
echo "   • ¿Los valores son correctos?"
echo "   • ¿Reiniciaste la terminal después de guardar .env?"
echo ""
ask_continue

# PASO 6: Reiniciar Servidor
show_step "6" "REINICIAR SERVIDOR" "6"
echo ""
show_instruction "Ejecuta:"
echo ""
echo "   npm run dev"
echo ""
show_instruction "Deberías ver:"
echo ""
echo "   Server running on port 5000"
echo "   ✅ MongoDB connected"
echo ""
show_instruction "¡YA ESTÁ LISTO!"
echo ""
show_instruction "Para probar:"
echo ""
echo "   1. Abre: http://localhost:5173/admin"
echo "   2. Ve a: Productos → Crear Producto"
echo "   3. Intenta subir una imagen"
echo "   4. Si funciona: ¡ÉXITO!"
echo ""
show_instruction "Para ver tus imágenes en Cloudinary:"
echo ""
echo "   https://cloudinary.com/console/media_library"
echo "   → Expande carpeta: suplementos/productos"
echo ""

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "                   ✅ ¡CONFIGURACIÓN COMPLETADA!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📚 Documentación disponible:"
echo "   • CLOUDINARY_README.md"
echo "   • CLOUDINARY_SETUP.md"
echo "   • CLOUDINARY_QUICK_START.md"
echo "   • CLOUDINARY_IMPLEMENTATION.md"
echo ""
echo "🆘 ¿Problemas?"
echo "   Revisa los archivos .md o ejecuta: npm run dev"
echo ""
