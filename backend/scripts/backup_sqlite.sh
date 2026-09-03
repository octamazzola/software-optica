#!/bin/bash
# backup_sqlite.sh
# Script para hacer backup de la base de datos de SQLite

# Configuración de rutas (asume que se corre desde la raíz del proyecto backend)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
DB_PATH="$BACKEND_DIR/database.sqlite"
BACKUP_DIR="$BACKEND_DIR/backups"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_$FECHA.sqlite"

if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_FILE"
    echo "Backup creado con éxito en: $BACKUP_FILE"

    # Mantener solo los últimos 30 días (solo funciona en sistemas Unix-like con find)
    find "$BACKUP_DIR" -name "db_*.sqlite" -type f -mtime +30 -delete
    echo "Limpieza de backups antiguos completada."
else
    echo "Error: No se encontró la base de datos en $DB_PATH"
    exit 1
fi
