#!/usr/bin/env bash
# ==============================================================
#       CREAR ACCESO DIRECTO EN ESCRITORIO (LINUX MINT)
# ==============================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Buscar directorio de escritorio en español o inglés
DESKTOP_DIR="$HOME/Escritorio"
if [ ! -d "$DESKTOP_DIR" ]; then
    DESKTOP_DIR="$HOME/Desktop"
fi

mkdir -p "$DESKTOP_DIR"

LAUNCHER="$DESKTOP_DIR/Optica_Vision_Urbana.desktop"

cat <<EOF > "$LAUNCHER"
[Desktop Entry]
Version=1.0
Type=Application
Name=Óptica Visión Urbana
Comment=Sistema de Gestión para Óptica
Exec=bash "$DIR/iniciar_optica.sh"
Path=$DIR
Icon=applications-internet
Terminal=true
StartupNotify=true
Categories=Office;
EOF

chmod +x "$LAUNCHER"
chmod +x "$DIR/iniciar_optica.sh"
chmod +x "$DIR/cerrar_optica.sh"
chmod +x "$DIR/crear_acceso_directo.sh"

echo "=============================================================="
echo "  Acceso directo creado con éxito en:"
echo "  $LAUNCHER"
echo "=============================================================="
echo "  Ya podés hacer doble click sobre el icono en tu Escritorio."
