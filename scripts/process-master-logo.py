"""
v5.9 · pipeline de procesamiento del logo master Queens Bellybutton

Entrada:
  branding/queens-bellybutton-master.jpg (543×659 RGB JPEG)

Salidas en branding/master/:
  - queens-master-full.png     · PNG sin pérdida del original (para edición futura)
  - queens-isotipo-square.png  · crop cuadrado top (543×543) · solo Q+corona+flor+hojas
  - queens-isotipo-512.png     · 512×512 (base PWA manifest)
  - queens-isotipo-192.png     · 192×192 (PWA estándar)
  - queens-isotipo-96.png      · 96×96 (UI/notificaciones)
  - queens-hero-1200.png       · 1200 px ancho · imagen completa con texto · hero landing
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'branding', 'queens-bellybutton-master.jpg')
OUT  = os.path.join(ROOT, 'branding', 'master')
os.makedirs(OUT, exist_ok=True)

def save_png(img, name):
    path = os.path.join(OUT, name)
    img.save(path, format='PNG', optimize=True)
    size_kb = os.path.getsize(path) // 1024
    print(f"  OK  {name}  ({img.size[0]}x{img.size[1]} px, {size_kb} KB)")
    return path

# ── 1. Master full (preservar como PNG sin compresión adicional) ──────────────
print("[1] Abriendo imagen master…")
master = Image.open(SRC).convert('RGB')
print(f"    Dimensiones origen: {master.size}, modo: {master.mode}")
save_png(master, 'queens-master-full.png')

# ── 2. Isotipo cuadrado · solo Q+corona+flor+hojas ────────────────────────────
# La imagen original 543x659. El isotipo (Q+corona+flor) ocupa ~y=20..y=410.
# Hacemos crop centrado horizontalmente y verticalmente sobre la zona del isotipo
# para obtener un cuadrado limpio sin el texto "QUEENS BELLY BUTTON".
print("[2] Crop cuadrado centrado en el isotipo (sin texto)…")
W, H = master.size
ISO_TOP    = 20
ISO_BOTTOM = 410
iso_h = ISO_BOTTOM - ISO_TOP   # 390
iso_w = iso_h                  # cuadrado
left  = (W - iso_w) // 2       # centrado horizontal
right = left + iso_w
isotipo = master.crop((left, ISO_TOP, right, ISO_BOTTOM))
save_png(isotipo, 'queens-isotipo-square.png')

# ── 3-5. Redimensiones del isotipo ────────────────────────────────────────────
print("[3-5] Redimensiones del isotipo a 512 / 192 / 96 px…")
for size in (512, 192, 96):
    resized = isotipo.resize((size, size), Image.LANCZOS)
    save_png(resized, f'queens-isotipo-{size}.png')

# ── 6. Hero · imagen completa escalada a 1200 px ancho ────────────────────────
print("[6] Hero 1200 px ancho (imagen completa con texto)…")
hero_w = 1200
hero_h = int(H * hero_w / W)
# Upscale: la imagen es solo 543 ancho, vamos a 1200 → factor 2.21x
# Para upscale usar BICUBIC (LANCZOS también vale pero BICUBIC suele dar
# resultado más suave en imágenes con gradientes IA)
hero = master.resize((hero_w, hero_h), Image.BICUBIC)
save_png(hero, 'queens-hero-1200.png')

# ── Bonus · versión apilable mini 32×32 para favicon SVG fallback ─────────────
print("[bonus] 32×32 para favicon raster fallback…")
fav32 = isotipo.resize((32, 32), Image.LANCZOS)
save_png(fav32, 'queens-isotipo-32.png')

print("\n✓ Pipeline completado. 7 archivos en branding/master/")
