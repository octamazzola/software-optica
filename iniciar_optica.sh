#!/usr/bin/env bash
# ==============================================================
#       OPTICA VISION URBANA - SISTEMA DE GESTION (LINUX MINT)
# ==============================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=============================================================="
echo "      OPTICA VISION URBANA - SISTEMA DE GESTION"
echo "=============================================================="
echo ""

# Detener instancias previas si las hubiera
pkill -f "node.*(backend|frontend)" 2>/dev/null || true

# Verificar dependencias
if [ ! -d "backend/node_modules" ]; then
    echo "  [INFO] Instalando dependencias del backend..."
    (cd "$DIR/backend" && npm install)
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "  [INFO] Instalando dependencias del frontend..."
    (cd "$DIR/frontend" && npm install)
fi

echo "  [1/3] Iniciando backend y base de datos..."
(cd "$DIR/backend" && npm run dev) > /dev/null 2>&1 &
BACKEND_PID=$!

echo "  [2/3] Iniciando interfaz web..."
(cd "$DIR/frontend" && npm run dev) > /dev/null 2>&1 &
FRONTEND_PID=$!

echo "  [3/3] Esperando que inicien los servicios..."
sleep 4

echo ""
echo "  Abriendo el sistema en el navegador..."
xdg-open "http://localhost:5173" 2>/dev/null || sensible-browser "http://localhost:5173" 2>/dev/null || x-www-browser "http://localhost:5173" 2>/dev/null &

echo ""
echo "=============================================================="
echo "  ESTADO: Sistema iniciado correctamente."
echo "  ACCESO: http://localhost:5173"
echo "=============================================================="
echo ""
echo "  IMPORTANTE: Deje esta terminal abierta mientras use el sistema."
echo "  Para finalizar y CERRAR el sistema por completo,"
echo "  presione Ctrl+C o cierre esta ventana."
echo ""

cleanup() {
    echo ""
    echo "  Cerrando el sistema..."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    pkill -f "node.*(backend|frontend)" 2>/dev/null || true
    echo "  Listo. Hasta luego!"
    exit 0
}

trap cleanup INT TERM EXIT

wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
