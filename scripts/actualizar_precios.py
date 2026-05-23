#!/usr/bin/env python3
"""
Control Gestión F&B - Actualizador de Precios desde Makro / Bedoya
Scrapea precios actuales de la web de Makro y los actualiza en la BD local.

Uso:
    python actualizar_precios.py [--fuente makro|bedoya|todos] [--dry-run]

Requiere:
    pip install requests beautifulsoup4 lxml
"""

import argparse
import sqlite3
import json
import time
import re
import logging
from datetime import date, datetime
from pathlib import Path
from typing import Optional

# ─── Configuración ─────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
DB_PATH  = BASE_DIR / "database" / "fnb_control.db"
LOG_DIR  = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / f"precios_{date.today()}.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

# ─── Headers para no ser bloqueado ─────────────────────────────────────────────
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                  'AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'es-ES,es;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

# ─── Mapeado URL producto → ID en nuestra BD ───────────────────────────────────
# Cuando tengas URLs específicas de Makro para cada producto, añádelas aquí.
# Formato: { producto_id_en_bd: 'url_en_makro' }
MAKRO_URLS = {
    # Carnes
    1:  'https://tienda.makro.es/shop/product/solomillo-ternera',
    # ... se irá completando según navegación en Makro
}

# ─── Scraper Base ───────────────────────────────────────────────────────────────
class ScraperBase:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.actualizados = 0
        self.errores = 0
        self.sin_cambio = 0

        try:
            import requests
            from bs4 import BeautifulSoup
            self.requests   = requests
            self.BeautifulSoup = BeautifulSoup
            self._disponible = True
        except ImportError:
            log.warning("⚠️  requests/beautifulsoup4 no instalados.")
            log.warning("   Ejecuta: pip install requests beautifulsoup4 lxml")
            self._disponible = False

    def get_page(self, url: str, retries: int = 3) -> Optional[str]:
        """Descarga una página con reintentos."""
        if not self._disponible:
            return None
        for i in range(retries):
            try:
                r = self.requests.get(url, headers=HEADERS, timeout=15)
                r.raise_for_status()
                return r.text
            except Exception as e:
                log.warning(f"Intento {i+1}/{retries} fallido para {url}: {e}")
                time.sleep(2 ** i)
        return None

    def parse_precio(self, texto: str) -> Optional[float]:
        """Extrae precio numérico de un texto."""
        if not texto:
            return None
        # Limpiar: "12,50 €/kg" → 12.50
        clean = re.sub(r'[^\d,\.]', '', texto.replace(',', '.'))
        # Si hay varios puntos, quitar todos menos el último
        partes = clean.split('.')
        if len(partes) > 2:
            clean = ''.join(partes[:-1]) + '.' + partes[-1]
        try:
            return round(float(clean), 4)
        except (ValueError, TypeError):
            return None


# ─── Scraper Makro ──────────────────────────────────────────────────────────────
class ScraperMakro(ScraperBase):
    """
    Scrapea precios de tienda.makro.es
    Makro requiere registro para ver precios completos.
    Estrategia: usar las páginas de producto públicas + JSON-LD schema.
    """

    CATEGORIAS_URL = {
        'carne':      'https://tienda.makro.es/shop/category/frescos/carne',
        'pescado':    'https://tienda.makro.es/shop/category/frescos/pescado',
        'lacteos':    'https://tienda.makro.es/shop/category/lacteos',
        'aceites':    'https://tienda.makro.es/shop/category/aceites-y-salsas',
        'conservas':  'https://tienda.makro.es/shop/category/conservas',
    }

    def extraer_precio_json_ld(self, html: str) -> Optional[float]:
        """Extrae precio del JSON-LD (schema.org Product) si existe."""
        if not html:
            return None
        bs = self.BeautifulSoup(html, 'lxml')
        for script in bs.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0]
                if data.get('@type') == 'Product':
                    offers = data.get('offers', {})
                    if isinstance(offers, list):
                        offers = offers[0]
                    precio_str = offers.get('price', '')
                    return self.parse_precio(str(precio_str))
            except Exception:
                continue
        return None

    def scrape_producto(self, url: str) -> Optional[float]:
        """Obtiene precio de una URL de producto Makro."""
        html = self.get_page(url)
        if not html:
            return None

        bs = self.BeautifulSoup(html, 'lxml')

        # Intento 1: JSON-LD
        precio = self.extraer_precio_json_ld(html)
        if precio:
            return precio

        # Intento 2: Selectores CSS comunes de Makro
        selectores = [
            '.product-price__value',
            '[data-testid="product-price"]',
            '.price__value',
            '.pdp-price',
            'span.price',
        ]
        for sel in selectores:
            elem = bs.select_one(sel)
            if elem:
                precio = self.parse_precio(elem.get_text())
                if precio:
                    return precio

        log.debug(f"No se encontró precio en: {url}")
        return None

    def actualizar_productos(self, con: sqlite3.Connection) -> dict:
        """Actualiza precios de todos los productos con URL de Makro."""
        cur = con.cursor()

        # Obtener productos con URL de referencia en Makro
        cur.execute("""
            SELECT id, nombre, precio_coste, url_referencia
            FROM productos
            WHERE url_referencia LIKE '%makro%'
            AND activo = 1
        """)
        productos = cur.fetchall()

        if not productos:
            log.info("No hay productos con URL de Makro configurada.")
            return {'actualizados': 0, 'errores': 0, 'sin_cambio': 0}

        log.info(f"🛒 Actualizando {len(productos)} productos de Makro...")

        for p in productos:
            pid, nombre, precio_actual, url = p
            log.info(f"   → {nombre} ({url})")

            nuevo_precio = self.scrape_producto(url)
            time.sleep(1.5)  # respetar servidor

            if nuevo_precio is None:
                log.warning(f"   ⚠️  Sin precio para: {nombre}")
                self.errores += 1
                continue

            if abs(nuevo_precio - precio_actual) < 0.001:
                log.debug(f"   = Sin cambio: {nombre} = {precio_actual:.2f}€")
                self.sin_cambio += 1
                continue

            variacion = ((nuevo_precio - precio_actual) / precio_actual) * 100
            log.info(f"   📊 {nombre}: {precio_actual:.2f}€ → {nuevo_precio:.2f}€ ({variacion:+.1f}%)")

            if not self.dry_run:
                # El trigger de la BD registra el historial automáticamente
                cur.execute("""
                    UPDATE productos
                    SET precio_coste = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (nuevo_precio, pid))
                # También actualizar precio_kg_l si aplica
                cur.execute("""
                    UPDATE productos
                    SET precio_kg_l = ROUND(? / cantidad_compra, 4)
                    WHERE id = ? AND cantidad_compra > 0
                """, (nuevo_precio, pid))

            self.actualizados += 1

        if not self.dry_run:
            con.commit()

        return {
            'actualizados': self.actualizados,
            'errores': self.errores,
            'sin_cambio': self.sin_cambio
        }


# ─── Actualizador Manual (para cuando el scraping no funcione) ─────────────────
def actualizar_precio_manual(con: sqlite3.Connection, producto_id: int, nuevo_precio: float, fuente: str = 'manual'):
    """Actualiza el precio de un producto manualmente."""
    cur = con.cursor()
    cur.execute("SELECT nombre, precio_coste FROM productos WHERE id = ?", (producto_id,))
    p = cur.fetchone()
    if not p:
        print(f"❌ Producto {producto_id} no encontrado.")
        return

    nombre, precio_actual = p
    print(f"📦 {nombre}")
    print(f"   Precio actual: {precio_actual:.4f} €")
    print(f"   Nuevo precio:  {nuevo_precio:.4f} €")
    print(f"   Variación:     {((nuevo_precio-precio_actual)/precio_actual)*100:+.1f}%")

    # Registrar en historial manualmente
    cur.execute("""
        INSERT INTO historial_precios (producto_id, proveedor_id, precio, fuente)
        SELECT id, proveedor_id, ?, ? FROM productos WHERE id = ?
    """, (nuevo_precio, fuente, producto_id))

    # Actualizar precio actual
    cur.execute("""
        UPDATE productos SET precio_coste = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    """, (nuevo_precio, producto_id))

    con.commit()
    print(f"✅ Precio actualizado.")


# ─── Actualización masiva desde CSV ────────────────────────────────────────────
def actualizar_desde_csv(con: sqlite3.Connection, csv_path: Path):
    """
    Actualiza precios desde un CSV exportado de Makro/Bedoya.
    Formato CSV esperado:
        nombre_producto,precio_nuevo,proveedor,notas
    """
    import csv
    cur = con.cursor()
    actualizados = 0
    no_encontrados = []

    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            nombre   = row.get('nombre_producto', '').strip()
            precio   = float(row.get('precio_nuevo', 0))
            fuente   = row.get('proveedor', 'csv_import')

            # Buscar por nombre (match aproximado)
            cur.execute("""
                SELECT id FROM productos
                WHERE nombre LIKE ? AND activo = 1
                LIMIT 1
            """, (f"%{nombre}%",))
            p = cur.fetchone()

            if not p:
                no_encontrados.append(nombre)
                continue

            cur.execute("""
                INSERT INTO historial_precios (producto_id, proveedor_id, precio, fuente)
                SELECT id, proveedor_id, ?, ? FROM productos WHERE id = ?
            """, (precio, fuente, p[0]))

            cur.execute("""
                UPDATE productos SET precio_coste = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (precio, p[0]))

            actualizados += 1

    con.commit()

    print(f"\n✅ {actualizados} precios actualizados desde CSV.")
    if no_encontrados:
        print(f"⚠️  No encontrados ({len(no_encontrados)}): {', '.join(no_encontrados[:10])}")


# ─── Reporte de variaciones de precio ──────────────────────────────────────────
def reporte_variaciones(con: sqlite3.Connection, dias: int = 30):
    """Muestra productos con mayor variación de precio en los últimos N días."""
    cur = con.cursor()
    cur.execute("""
        WITH precios_rango AS (
            SELECT
                h.producto_id,
                p.nombre,
                MIN(h.fecha)  AS fecha_inicio,
                MAX(h.fecha)  AS fecha_fin,
                FIRST_VALUE(h.precio) OVER (PARTITION BY h.producto_id ORDER BY h.fecha ASC)  AS precio_inicio,
                LAST_VALUE(h.precio)  OVER (PARTITION BY h.producto_id ORDER BY h.fecha ASC
                    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS precio_actual
            FROM historial_precios h
            JOIN productos p ON p.id = h.producto_id
            WHERE h.fecha >= DATE('now', '-' || ? || ' days')
            GROUP BY h.producto_id, p.nombre
        )
        SELECT
            nombre,
            ROUND(precio_inicio, 2) AS precio_inicio,
            ROUND(precio_actual, 2) AS precio_actual,
            ROUND((precio_actual - precio_inicio), 2) AS variacion_eur,
            ROUND((precio_actual - precio_inicio) / precio_inicio * 100, 1) AS variacion_pct
        FROM precios_rango
        WHERE precio_inicio != precio_actual
        ORDER BY ABS(variacion_pct) DESC
        LIMIT 20
    """, (dias,))

    rows = cur.fetchall()
    if not rows:
        print(f"\n📊 Sin variaciones de precio en los últimos {dias} días.")
        return

    print(f"\n{'='*70}")
    print(f"  VARIACIONES DE PRECIO - Últimos {dias} días")
    print(f"{'='*70}")
    print(f"{'Producto':<35} {'Antes':>8} {'Ahora':>8} {'Var€':>7} {'Var%':>7}")
    print(f"{'-'*70}")
    for r in rows:
        flecha = "📈" if r[4] > 0 else "📉"
        print(f"{r[0]:<35} {r[1]:>7.2f}€ {r[2]:>7.2f}€ {r[3]:>+7.2f}€ {flecha}{r[4]:>+6.1f}%")
    print(f"{'='*70}\n")


# ─── CLI ───────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Actualizador de precios F&B')
    parser.add_argument('--fuente', choices=['makro', 'bedoya', 'todos'], default='makro')
    parser.add_argument('--dry-run', action='store_true', help='Simular sin guardar')
    parser.add_argument('--reporte', type=int, metavar='DIAS',
                        help='Mostrar reporte de variaciones (ej: --reporte 30)')
    parser.add_argument('--csv', type=Path, help='Actualizar desde CSV')
    parser.add_argument('--manual', nargs=2, metavar=('ID_PRODUCTO', 'NUEVO_PRECIO'),
                        help='Actualizar precio manualmente')
    args = parser.parse_args()

    if not DB_PATH.exists():
        print(f"❌ Base de datos no encontrada: {DB_PATH}")
        print("   Ejecuta primero: python setup_db.py")
        return

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row

    try:
        if args.reporte:
            reporte_variaciones(con, args.reporte)

        elif args.manual:
            pid, precio = int(args.manual[0]), float(args.manual[1])
            actualizar_precio_manual(con, pid, precio)

        elif args.csv:
            actualizar_desde_csv(con, args.csv)

        else:
            log.info(f"{'='*60}")
            log.info(f"  Actualizador de Precios F&B")
            log.info(f"  Fuente: {args.fuente} | Dry-run: {args.dry_run}")
            log.info(f"  Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
            log.info(f"{'='*60}")

            if args.fuente in ('makro', 'todos'):
                scraper = ScraperMakro(dry_run=args.dry_run)
                resultado = scraper.actualizar_productos(con)
                log.info(f"\n📊 Makro → Actualizados: {resultado['actualizados']} | "
                         f"Sin cambio: {resultado['sin_cambio']} | "
                         f"Errores: {resultado['errores']}")

    finally:
        con.close()


if __name__ == '__main__':
    main()
