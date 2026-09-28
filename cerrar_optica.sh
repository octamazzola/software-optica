#!/usr/bin/env bash
# ==============================================================
#       CERRAR OPTICA VISION URBANA (LINUX MINT)
# ==============================================================

echo "=============================================================="
echo "      CERRANDO OPTICA VISION URBANA"
echo "=============================================================="
echo ""
echo "Apagando servidores y servicios en ejecución..."
pkill -f "node.*(backend|frontend)" 2>/dev/null || true
echo ""
echo "Sistema cerrado correctamente."
sleep 2
