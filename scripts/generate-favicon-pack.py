"""
v5.9 · Generador de paquete favicon completo para Queens Bellybutton.

Sigue las pautas del skill favicon-gen (sin requerir ImageMagick).
Usa la imagen master del isotipo + la opción A pura (SVG limpia) como fallback.

Salidas en branding/favicon/:
  - favicon.ico              (multi 16/32/48)
  - favicon-16x16.png
  - favicon-32x32.png
  - apple-touch-icon.png     (180x180, fondo navy solido, sin transparencia)
  - icon-192.png             (PWA)
  - icon-512.png             (PWA)
  - favicon.svg              (vectorial · copia de A-pure simplificada)
  - site.webmanifest         (PWA manifest)
  - HEAD-SNIPPET.html        (HTML listo para pegar en <head>)
"""
import os
import shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'branding', 'master', 'queens-isotipo-512.png')
OUT  = os.path.join(ROOT, 'branding', 'favicon')
SVG_SOURCE = os.path.join(ROOT, 'branding', 'v2-queens-bellybutton', 'A-pure', 'mark.svg')
os.makedirs(OUT, exist_ok=True)

NAVY = '#0a1733'
NAVY_RGB = (10, 23, 51)

# ── Cargar isotipo master ─────────────────────────────────────────────────────
print("[1] Cargando isotipo master 512x512…")
master = Image.open(SRC).convert('RGB')
print(f"    Origen: {master.size}, modo: {master.mode}")

def report(name, path):
    kb = os.path.getsize(path) // 1024 if os.path.getsize(path) >= 1024 else 0
    bytes_ = os.path.getsize(path)
    sz = f"{kb} KB" if kb else f"{bytes_} B"
    print(f"  OK  {name}  ({sz})")

# ── 2. PNG sizes (16, 32, 180, 192, 512) ─────────────────────────────────────
print("[2] Generando PNGs en todos los tamanos…")
sizes_to_gen = [
    (16,  'favicon-16x16.png'),
    (32,  'favicon-32x32.png'),
    (180, 'apple-touch-icon.png'),
    (192, 'icon-192.png'),
    (512, 'icon-512.png'),
]
for size, name in sizes_to_gen:
    img = master.resize((size, size), Image.LANCZOS)
    # Para apple-touch-icon e iOS: fondo solido NAVY (no transparente)
    # Como nuestro master ya tiene fondo navy solido, no requiere conversion adicional
    out_path = os.path.join(OUT, name)
    img.save(out_path, format='PNG', optimize=True)
    report(name, out_path)

# ── 3. .ico multi-resolucion ──────────────────────────────────────────────────
print("[3] Generando favicon.ico (multi 16/32/48)…")
ico_path = os.path.join(OUT, 'favicon.ico')
# Pillow soporta multi-size ICO nativamente. Le pasamos la master y sizes deseados.
master.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
report('favicon.ico', ico_path)

# ── 4. favicon.svg (vectorial fallback · copia de A-pure simplificada) ───────
# La imagen IA con flor no se puede vectorizar bien para 16x16.
# Usamos la opcion A pura (Q + corona sin botanica) que ya tenemos como SVG limpio.
# A 16x16 la flor seria ilegible; la Q sola se reconoce.
print("[4] Copiando favicon.svg (version simplificada Q+corona)…")
svg_dest = os.path.join(OUT, 'favicon.svg')
shutil.copy2(SVG_SOURCE, svg_dest)
report('favicon.svg', svg_dest)

# ── 5. site.webmanifest ───────────────────────────────────────────────────────
print("[5] Generando site.webmanifest…")
import json
manifest = {
    "name": "Queens Bellybutton",
    "short_name": "QBB",
    "description": "Hospitality Management Software · plataforma F&B multi-tenant",
    "start_url": "/",
    "display": "standalone",
    "orientation": "portrait",
    "theme_color": NAVY,
    "background_color": NAVY,
    "icons": [
        {
            "src": "/branding/favicon/icon-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "/branding/favicon/icon-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "/branding/favicon/apple-touch-icon.png",
            "sizes": "180x180",
            "type": "image/png",
            "purpose": "maskable"
        }
    ]
}
manifest_path = os.path.join(OUT, 'site.webmanifest')
with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
report('site.webmanifest', manifest_path)

# ── 6. HEAD-SNIPPET.html ──────────────────────────────────────────────────────
print("[6] Generando HEAD-SNIPPET.html…")
snippet = '''<!--
  Queens Bellybutton · favicon + PWA manifest (v5.9)
  Copiar este bloque dentro del <head> de cada HTML.
  Rutas relativas a la raiz del sitio (GitHub Pages /).
-->
<link rel="icon" type="image/svg+xml" href="/branding/favicon/favicon.svg">
<link rel="icon" type="image/x-icon" href="/branding/favicon/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/branding/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/branding/favicon/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/branding/favicon/apple-touch-icon.png">
<link rel="manifest" href="/branding/favicon/site.webmanifest">
<meta name="theme-color" content="''' + NAVY + '''">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Queens Bellybutton">
'''
snip_path = os.path.join(OUT, 'HEAD-SNIPPET.html')
with open(snip_path, 'w', encoding='utf-8') as f:
    f.write(snippet)
report('HEAD-SNIPPET.html', snip_path)

print("\n[OK] Paquete favicon generado. 9 archivos en branding/favicon/")
