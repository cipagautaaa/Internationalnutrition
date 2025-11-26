@echo off
echo Deteniendo servidores Node.js anteriores...
taskkill /F /IM node.exe 2>nul

echo.
echo Esperando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo Cambiando al directorio backend...
cd /d "c:\Users\juanp\OneDrive\Escritorio\Proyecto\Proyecto\tienda-suplementos\backend"

echo.
echo Iniciando servidor backend...
echo.
node server.js
