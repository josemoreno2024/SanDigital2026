#!/bin/bash

echo "🔐 Push seguro a GitHub"
echo "======================="
echo ""
echo "Por favor, ingresa tu Personal Access Token de GitHub:"
echo "(El token NO se mostrará en pantalla)"
echo ""

# Leer el token de forma segura (sin mostrarlo)
read -s GITHUB_TOKEN

echo ""
echo "🚀 Haciendo push al repositorio..."

# Configurar la URL con el token temporalmente
git remote set-url origin "https://josemoreno2024:${GITHUB_TOKEN}@github.com/josemoreno2024/SanDigital2026.git"

# Hacer el push
git push -f origin main

# Verificar si fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Push completado exitosamente"
    
    # Limpiar la URL para no dejar el token expuesto
    git remote set-url origin "https://github.com/josemoreno2024/SanDigital2026.git"
    echo "🔒 Credenciales limpiadas"
else
    echo "❌ Error al hacer push"
    # Limpiar la URL aunque falle
    git remote set-url origin "https://github.com/josemoreno2024/SanDigital2026.git"
fi

# Limpiar la variable del token
unset GITHUB_TOKEN
