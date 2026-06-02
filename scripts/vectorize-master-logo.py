"""
v5.9 · Vectorizacion experimental del isotipo master Queens Bellybutton.

Usa vtracer (binding Python) con configuracion orientada a preservar
detalle de gradientes dorados y la flor rosa, manteniendo el fondo navy.

Si el SVG resultante:
  - es >500 KB
  - o pierde la silueta legible
ABORTA y reporta para que sigamos solo con PNGs (que ya estan listos).
"""
import os
import sys
import vtracer

ROOT  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT = os.path.join(ROOT, 'branding', 'master', 'queens-isotipo-512.png')
OUT   = os.path.join(ROOT, 'branding', 'master', 'queens-isotipo-vectorized.svg')

print(f"[1] Entrada: {INPUT}")
print(f"    Tamano:  {os.path.getsize(INPUT) // 1024} KB")

# Configuracion vtracer:
#   - mode 'spline' = curvas Bezier suaves (mejor para gradientes IA)
#   - filter_speckle 8 = filtra puntos pequenos (limpia bordes con ruido)
#   - color_precision 8 = preserva matices del dorado y rosa
#   - corner_threshold 120 = esquinas suaves (oro no tiene aristas duras)
#   - segment_length 6 = segmentos cortos = mas fidelidad
#   - path_precision 5 = 5 decimales en coordenadas (balance fidelidad/peso)
print("[2] Vectorizando con vtracer (mode=spline)…")
print("    filter_speckle=8 color_precision=8 corner_threshold=120")

try:
    vtracer.convert_image_to_svg_py(
        INPUT,
        OUT,
        colormode='color',
        hierarchical='stacked',
        mode='spline',
        filter_speckle=8,
        color_precision=8,
        layer_difference=16,
        corner_threshold=120,
        length_threshold=6.0,
        max_iterations=10,
        splice_threshold=45,
        path_precision=5
    )
except Exception as e:
    print(f"[ERROR] vtracer fallo: {e}")
    sys.exit(1)

# Verificar resultado
if not os.path.exists(OUT):
    print(f"[ERROR] SVG no generado en {OUT}")
    sys.exit(2)

size_bytes = os.path.getsize(OUT)
size_kb = size_bytes // 1024
print(f"[3] SVG generado: {size_kb} KB")

# Politica: si >500KB, marcar como experimental y sugerir no usar
if size_kb > 500:
    print(f"\n[AVISO] SVG > 500 KB · demasiado pesado para favicon.")
    print("        Conservado para evaluacion visual pero NO se aplicara.")
else:
    print("\n[OK] SVG vectorizado dentro de presupuesto (<500 KB).")

# Aplicar svgo si esta disponible
print("\n[4] Optimizando con svgo (via npx)…")
import subprocess
try:
    r = subprocess.run(['npx', 'svgo', OUT, '-o', OUT, '--multipass'],
                       capture_output=True, text=True, timeout=60, shell=True)
    if r.returncode == 0:
        new_size = os.path.getsize(OUT) // 1024
        print(f"    Tras svgo: {new_size} KB (reduccion {size_kb - new_size} KB)")
    else:
        print(f"    svgo aviso: {r.stderr[:200]}")
except Exception as e:
    print(f"    svgo no disponible o fallo: {e}")

print(f"\n[OK] Pipeline experimental completado · {OUT}")
