# Script Helper para Railway Deploy
# Uso: .\deploy-railway.ps1

Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   HELPER SCRIPT - RAILWAY DEPLOYMENT          ║" -ForegroundColor Green
Write-Host "║   International Nutrition - Tienda Suplementos║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Variables
$projectPath = "C:\Users\juanp\InternationalNutrition"
$backendPath = "$projectPath\tienda-suplementos\backend"
$frontendPath = "$projectPath\tienda-suplementos\frontend"

# Función para mostrar menú
function Show-Menu {
    Write-Host ""
    Write-Host "Selecciona una opción:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. [VERIFICACIÓN] Verificar archivos locales"
    Write-Host "  2. [GIT] Hacer git push a GitHub"
    Write-Host "  3. [LOCAL] Levantar docker-compose (desarrollo)"
    Write-Host "  4. [LOCAL] Ver logs del backend"
    Write-Host "  5. [LOCAL] Detener containers"
    Write-Host "  6. [TESTING] Probar API local (http://localhost:5000/api/health)"
    Write-Host "  7. [INFO] Mostrar información del proyecto"
    Write-Host "  8. [GUÍAS] Abrir guías de Railway"
    Write-Host "  9. Salir"
    Write-Host ""
    $option = Read-Host "Opción"
    return $option
}

# Función: Verificar archivos
function Check-Files {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  VERIFICANDO ARCHIVOS CRÍTICOS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    $files = @(
        "$backendPath\package.json",
        "$backendPath\server.js",
        "$backendPath\Dockerfile",
        "$backendPath\.env.production",
        "$backendPath\app.js"
    )

    $allExist = $true
    foreach ($file in $files) {
        $exists = Test-Path $file
        $status = if ($exists) { "✅ EXISTE" } else { "❌ FALTA" }
        $displayName = Split-Path $file -Leaf
        Write-Host "  $displayName : $status" -ForegroundColor $(if ($exists) { 'Green' } else { 'Red' })
        if (-not $exists) { $allExist = $false }
    }

    Write-Host ""
    if ($allExist) {
        Write-Host "✅ TODOS LOS ARCHIVOS EXISTEN" -ForegroundColor Green
    } else {
        Write-Host "❌ FALTAN ARCHIVOS. Revisa el proyecto." -ForegroundColor Red
    }
    Write-Host ""
}

# Función: Git push
function Git-Push {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  HACER GIT PUSH" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    Set-Location $projectPath

    Write-Host "Ver cambios pendientes:" -ForegroundColor Yellow
    git status
    Write-Host ""

    $confirm = Read-Host "¿Deseas hacer push? (s/n)"
    if ($confirm -eq 's' -or $confirm -eq 'S') {
        $message = Read-Host "Mensaje de commit"
        git add .
        git commit -m $message
        git push origin main
        Write-Host ""
        Write-Host "✅ Push completado" -ForegroundColor Green
    } else {
        Write-Host "⏭️  Operación cancelada" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Función: Docker compose up
function Docker-Up {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  LEVANTANDO DOCKER COMPOSE" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    Set-Location "$projectPath\tienda-suplementos"
    docker-compose up --build -d

    Write-Host ""
    Write-Host "✅ Containers iniciados" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs disponibles:" -ForegroundColor Yellow
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
}

# Función: Ver logs
function Show-Logs {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  LOGS DEL BACKEND (últimas 20 líneas)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    docker logs tienda-suplementos-backend-1 --tail 20
    Write-Host ""
    Write-Host "Para ver logs en vivo, usa:" -ForegroundColor Yellow
    Write-Host "  docker logs tienda-suplementos-backend-1 -f" -ForegroundColor Cyan
    Write-Host ""
}

# Función: Docker down
function Docker-Down {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  DETENIENDO CONTAINERS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    Set-Location "$projectPath\tienda-suplementos"
    docker-compose down

    Write-Host ""
    Write-Host "✅ Containers detenidos" -ForegroundColor Green
    Write-Host ""
}

# Función: Probar API
function Test-API {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PROBANDO API LOCAL" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -ErrorAction Stop
        Write-Host "✅ API RESPONDIENDO" -ForegroundColor Green
        Write-Host ""
        Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Cyan
        Write-Host "Body: $($response.Content)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ API NO RESPONDE" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Soluciones:" -ForegroundColor Yellow
        Write-Host "  1. Verifica que docker-compose está ejecutándose"
        Write-Host "  2. Espera 5-10 segundos a que el backend inicie"
        Write-Host "  3. Revisa los logs: docker logs tienda-suplementos-backend-1"
    }
    Write-Host ""
}

# Función: Mostrar información
function Show-Info {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  INFORMACIÓN DEL PROYECTO" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Rutas principales:" -ForegroundColor Yellow
    Write-Host "  Proyecto:  $projectPath" -ForegroundColor Cyan
    Write-Host "  Backend:   $backendPath" -ForegroundColor Cyan
    Write-Host "  Frontend:  $frontendPath" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Repositorio:" -ForegroundColor Yellow
    Write-Host "  GitHub: https://github.com/cipagautaaa/InternationalNutrition" -ForegroundColor Cyan
    Write-Host "  Rama: main" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Railway:" -ForegroundColor Yellow
    Write-Host "  Sitio: https://railway.app" -ForegroundColor Cyan
    Write-Host "  Proyecto: International Nutrition" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "MongoDB:" -ForegroundColor Yellow
    Write-Host "  Atlas: https://cloud.mongodb.com" -ForegroundColor Cyan
    Write-Host "  Cluster: Cluster0" -ForegroundColor Cyan
    Write-Host "  BD: tienda_suplementos" -ForegroundColor Cyan
    Write-Host ""
}

# Función: Abrir guías
function Open-Guides {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  GUÍAS DE RAILWAY" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Documentos creados:" -ForegroundColor Yellow
    Write-Host "  1. RAILWAY_QUICK_START.md         - Inicio rápido" -ForegroundColor Cyan
    Write-Host "  2. RAILWAY_DEPLOYMENT_GUIDE.md    - Guía completa paso a paso" -ForegroundColor Cyan
    Write-Host "  3. RAILWAY_CHECKLIST.md           - Checklist interactivo" -ForegroundColor Cyan
    Write-Host "  4. RAILWAY_TROUBLESHOOTING.md     - Problemas y soluciones" -ForegroundColor Cyan
    Write-Host "  5. RAILWAY_COMPLETE_GUIDE.md      - Guía avanzada" -ForegroundColor Cyan
    Write-Host ""

    $guide = Read-Host "¿Qué guía deseas abrir? (número o 'salir')"
    
    $guides = @{
        "1" = "RAILWAY_QUICK_START.md"
        "2" = "RAILWAY_DEPLOYMENT_GUIDE.md"
        "3" = "RAILWAY_CHECKLIST.md"
        "4" = "RAILWAY_TROUBLESHOOTING.md"
        "5" = "RAILWAY_COMPLETE_GUIDE.md"
    }

    if ($guides.ContainsKey($guide)) {
        $file = "$projectPath\tienda-suplementos\$($guides[$guide])"
        if (Test-Path $file) {
            & notepad.exe $file
        } else {
            Write-Host "❌ Archivo no encontrado" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Loop principal
do {
    $option = Show-Menu

    switch ($option) {
        "1" { Check-Files }
        "2" { Git-Push }
        "3" { Docker-Up }
        "4" { Show-Logs }
        "5" { Docker-Down }
        "6" { Test-API }
        "7" { Show-Info }
        "8" { Open-Guides }
        "9" {
            Write-Host "¡Hasta luego! 👋" -ForegroundColor Green
            exit
        }
        default {
            Write-Host "Opción inválida. Intenta de nuevo." -ForegroundColor Red
        }
    }
} while ($true)
