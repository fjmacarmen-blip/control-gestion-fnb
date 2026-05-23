#!/usr/bin/env python3
"""
Control Gestión F&B - Inicialización de Base de Datos
Crea la BD SQLite y carga los datos iniciales de productos.

Uso:
    python setup_db.py

Requiere: sqlite3 (incluido en Python)
"""

import sqlite3
import os
import sys
from pathlib import Path
from datetime import datetime

# ─── Rutas ────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent.parent
DB_PATH    = BASE_DIR / "database" / "fnb_control.db"
SCHEMA_SQL = BASE_DIR / "database" / "schema.sql"
SEED_SQL   = BASE_DIR / "database" / "seed_data.sql"

def create_database():
    """Crea la base de datos y aplica el esquema."""
    print(f"\n{'='*60}")
    print("  CONTROL GESTIÓN F&B - Setup de Base de Datos")
    print(f"{'='*60}")

    # Verificar archivos SQL
    for f in [SCHEMA_SQL, SEED_SQL]:
        if not f.exists():
            print(f"❌ Archivo no encontrado: {f}")
            sys.exit(1)

    # Crear BD (si existe la recrea)
    if DB_PATH.exists():
        respuesta = input(f"\n⚠️  La base de datos ya existe. ¿Recrear? (s/N): ")
        if respuesta.lower() != 's':
            print("❌ Operación cancelada.")
            return
        DB_PATH.unlink()
        print("🗑️  Base de datos anterior eliminada.")

    print(f"\n📁 Creando base de datos en: {DB_PATH}")

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    # Aplicar esquema
    print("📐 Aplicando esquema...")
    with open(SCHEMA_SQL, 'r', encoding='utf-8') as f:
        schema = f.read()
    cur.executescript(schema)

    # Cargar datos iniciales
    print("🌱 Cargando datos iniciales (productos y precios)...")
    with open(SEED_SQL, 'r', encoding='utf-8') as f:
        seed = f.read()
    cur.executescript(seed)

    con.commit()

    # Estadísticas
    stats = {}
    for tabla in ['proveedores','categorias','unidades_medida','productos','historial_precios']:
        cur.execute(f"SELECT COUNT(*) FROM {tabla}")
        stats[tabla] = cur.fetchone()[0]

    con.close()

    print(f"\n✅ Base de datos creada con éxito!\n")
    print(f"   Proveedores:    {stats['proveedores']:>4}")
    print(f"   Categorías:     {stats['categorias']:>4}")
    print(f"   Unidades:       {stats['unidades_medida']:>4}")
    print(f"   Productos:      {stats['productos']:>4}")
    print(f"   Historial:      {stats['historial_precios']:>4} entradas")
    print(f"\n   📂 {DB_PATH}\n")

if __name__ == "__main__":
    create_database()
