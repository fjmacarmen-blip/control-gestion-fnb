#!/usr/bin/env python3
"""
Control Gestión F&B - Consultas rápidas a la base de datos.
Herramienta de consola para explorar productos, precios y categorías.

Uso:
    python consultar_bd.py listar [--categoria NOMBRE]
    python consultar_bd.py buscar TERMINO
    python consultar_bd.py precio PRODUCTO_ID
    python consultar_bd.py historial PRODUCTO_ID
    python consultar_bd.py stats
"""

import sqlite3
import argparse
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DB_PATH  = BASE_DIR / "database" / "fnb_control.db"


def get_con():
    if not DB_PATH.exists():
        print(f"❌ BD no encontrada. Ejecuta: python setup_db.py")
        sys.exit(1)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def cmd_listar(args):
    """Lista productos, opcionalmente filtrado por categoría."""
    con = get_con()
    cur = con.cursor()

    query = """
        SELECT p.id, p.nombre, c.nombre_corto AS categoria,
               p.precio_coste, u.abreviatura AS unidad,
               p.unidad_compra, p.marca, p.origen
        FROM productos p
        JOIN categorias c ON c.id = p.categoria_id
        JOIN unidades_medida u ON u.id = p.unidad_id
        WHERE p.activo = 1
    """
    params = []

    if args.categoria:
        query += " AND c.nombre LIKE ?"
        params.append(f"%{args.categoria}%")

    query += " ORDER BY c.orden, p.nombre"
    cur.execute(query, params)
    rows = cur.fetchall()

    print(f"\n{'ID':>5} {'Producto':<38} {'Cat':<12} {'Precio':>9} {'Unidad':<8} {'Origen'}")
    print(f"{'─'*95}")

    cat_actual = None
    for r in rows:
        if r['categoria'] != cat_actual:
            cat_actual = r['categoria']
            print(f"\n  ── {cat_actual.upper()} ──")
        precio_str = f"{r['precio_coste']:.2f} €/{r['unidad']}"
        print(f"{r['id']:>5} {r['nombre']:<38} {r['categoria']:<12} {precio_str:>10}  {r['origen'] or '─'}")

    print(f"\n  Total: {len(rows)} productos\n")
    con.close()


def cmd_buscar(args):
    """Busca productos por nombre."""
    con = get_con()
    cur = con.cursor()
    termino = args.termino

    cur.execute("""
        SELECT p.id, p.nombre, c.nombre_corto AS categoria,
               p.precio_coste, u.abreviatura AS unidad,
               p.unidad_compra, p.marca, p.proveedor_id
        FROM productos p
        JOIN categorias c ON c.id = p.categoria_id
        JOIN unidades_medida u ON u.id = p.unidad_id
        WHERE p.activo = 1 AND (
            p.nombre LIKE ? OR p.nombre_comercial LIKE ? OR p.marca LIKE ?
        )
        ORDER BY p.nombre
    """, (f"%{termino}%", f"%{termino}%", f"%{termino}%"))

    rows = cur.fetchall()
    if not rows:
        print(f"\n  Sin resultados para '{termino}'")
    else:
        print(f"\n  Resultados para '{termino}':\n")
        print(f"  {'ID':>5} {'Nombre':<38} {'Precio':>9} {'Presentación'}")
        print(f"  {'─'*75}")
        for r in rows:
            print(f"  {r['id']:>5} {r['nombre']:<38} {r['precio_coste']:>7.2f}€  {r['unidad_compra'] or ''}")

    print()
    con.close()


def cmd_precio(args):
    """Muestra detalle completo de un producto."""
    con = get_con()
    cur = con.cursor()

    cur.execute("""
        SELECT p.*, c.nombre AS categoria, u.nombre AS unidad_nombre,
               u.abreviatura, prov.nombre AS proveedor_nombre
        FROM productos p
        JOIN categorias c ON c.id = p.categoria_id
        JOIN unidades_medida u ON u.id = p.unidad_id
        LEFT JOIN proveedores prov ON prov.id = p.proveedor_id
        WHERE p.id = ?
    """, (args.producto_id,))

    p = cur.fetchone()
    if not p:
        print(f"❌ Producto {args.producto_id} no encontrado.")
        con.close()
        return

    print(f"\n{'='*55}")
    print(f"  FICHA DE PRODUCTO #{p['id']}")
    print(f"{'='*55}")
    print(f"  Nombre:        {p['nombre']}")
    if p['nombre_comercial']:
        print(f"  Nombre com.:   {p['nombre_comercial']}")
    print(f"  Categoría:     {p['categoria']}")
    print(f"  Marca:         {p['marca'] or '─'}")
    print(f"  Origen:        {p['origen'] or '─'}")
    if p['denominacion']:
        print(f"  Denominación:  {p['denominacion']}")
    print(f"{'─'*55}")
    print(f"  Proveedor:     {p['proveedor_nombre'] or '─'}")
    print(f"  Presentación:  {p['unidad_compra'] or '─'}")
    print(f"  Cant. compra:  {p['cantidad_compra']} {p['abreviatura']}")
    print(f"{'─'*55}")
    print(f"  PRECIO COSTE:  {p['precio_coste']:.4f} € / {p['unidad_compra'] or p['abreviatura']}")
    if p['precio_kg_l']:
        print(f"  Precio kg/l:   {p['precio_kg_l']:.4f} €/kg-l")
    print(f"{'─'*55}")
    print(f"  Sin gluten:    {'Sí' if p['sin_gluten'] else 'No'}")
    print(f"  Ecológico:     {'Sí' if p['ecologico'] else 'No'}")
    if p['alergenos']:
        print(f"  Alérgenos:     {p['alergenos']}")
    if p['notas']:
        print(f"  Notas:         {p['notas']}")
    print(f"  Actualizado:   {p['updated_at']}")
    if p['url_referencia']:
        print(f"  URL ref:       {p['url_referencia']}")
    print(f"{'='*55}\n")

    con.close()


def cmd_historial(args):
    """Muestra el historial de precios de un producto."""
    con = get_con()
    cur = con.cursor()

    cur.execute("SELECT nombre FROM productos WHERE id = ?", (args.producto_id,))
    p = cur.fetchone()
    if not p:
        print(f"❌ Producto {args.producto_id} no encontrado.")
        con.close()
        return

    cur.execute("""
        SELECT h.fecha, h.precio, prov.nombre AS proveedor, h.fuente, h.notas
        FROM historial_precios h
        LEFT JOIN proveedores prov ON prov.id = h.proveedor_id
        WHERE h.producto_id = ?
        ORDER BY h.fecha DESC
        LIMIT 50
    """, (args.producto_id,))

    rows = cur.fetchall()

    print(f"\n  Historial de precios: {p['nombre']}")
    print(f"  {'Fecha':<12} {'Precio':>9} {'Proveedor':<20} {'Fuente'}")
    print(f"  {'─'*65}")

    prev = None
    for r in rows:
        if prev is not None:
            diff = r['precio'] - prev
            flecha = "📈" if diff > 0 else "📉" if diff < 0 else "─"
            precio_str = f"{r['precio']:>7.4f}€ {flecha}"
        else:
            precio_str = f"{r['precio']:>7.4f}€   "
        print(f"  {r['fecha']:<12} {precio_str} {(r['proveedor'] or '─'):<20} {r['fuente'] or '─'}")
        prev = r['precio']

    print()
    con.close()


def cmd_stats(args):
    """Estadísticas generales de la base de datos."""
    con = get_con()
    cur = con.cursor()

    cur.execute("SELECT COUNT(*) FROM productos WHERE activo=1")
    total_prods = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM recetas WHERE activa=1")
    total_recetas = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM historial_precios")
    total_hist = cur.fetchone()[0]

    cur.execute("""
        SELECT c.nombre, COUNT(p.id) as n, ROUND(AVG(p.precio_coste),2) as avg_precio
        FROM categorias c
        LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo=1
        GROUP BY c.id
        HAVING n > 0
        ORDER BY n DESC
    """)
    cats = cur.fetchall()

    print(f"\n{'='*50}")
    print(f"  ESTADÍSTICAS DE LA BASE DE DATOS F&B")
    print(f"{'='*50}")
    print(f"  Productos activos:    {total_prods}")
    print(f"  Recetas activas:      {total_recetas}")
    print(f"  Registros historial:  {total_hist}")
    print(f"\n  {'Categoría':<30} {'Productos':>9} {'Precio medio':>13}")
    print(f"  {'─'*55}")
    for c in cats:
        print(f"  {c['nombre']:<30} {c['n']:>9}    {c['avg_precio']:>8.2f} €")
    print(f"{'='*50}\n")

    con.close()


def main():
    parser = argparse.ArgumentParser(description='Consultas F&B Database')
    subs = parser.add_subparsers(dest='cmd')

    p_listar = subs.add_parser('listar', help='Listar productos')
    p_listar.add_argument('--categoria', '-c', help='Filtrar por categoría')

    p_buscar = subs.add_parser('buscar', help='Buscar producto')
    p_buscar.add_argument('termino')

    p_precio = subs.add_parser('precio', help='Ver detalle de producto')
    p_precio.add_argument('producto_id', type=int)

    p_hist = subs.add_parser('historial', help='Historial de precios')
    p_hist.add_argument('producto_id', type=int)

    subs.add_parser('stats', help='Estadísticas generales')

    args = parser.parse_args()

    if args.cmd == 'listar':     cmd_listar(args)
    elif args.cmd == 'buscar':   cmd_buscar(args)
    elif args.cmd == 'precio':   cmd_precio(args)
    elif args.cmd == 'historial':cmd_historial(args)
    elif args.cmd == 'stats':    cmd_stats(args)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
