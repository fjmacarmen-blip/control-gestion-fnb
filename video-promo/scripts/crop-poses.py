"""Recorta las viñetas de las láminas de poses generadas por Gemini.

Detecta bandas de filas/columnas que contienen tinta oscura (bordes y dibujo)
separadas por medianiles claros, y guarda cada viñeta como PNG individual.

Uso: python crop-poses.py <lamina.png> <carpeta-salida> <prefijo>
"""
import sys
from PIL import Image

DARK = 100        # luminancia por debajo de la cual un pixel cuenta como tinta
MIN_COUNT = 5     # pixeles oscuros minimos para que una fila/columna sea "panel"
MIN_SPAN = 60     # ancho/alto minimo de un panel en px
GAP_MERGE = 1     # huecos menores se fusionan (tramado de semitonos)


def runs(profile, split=False):
    """Rangos contiguos donde profile[i] >= MIN_COUNT, fusionando huecos cortos."""
    spans, start = [], None
    for i, v in enumerate(profile):
        if v >= MIN_COUNT and start is None:
            start = i
        elif v < MIN_COUNT and start is not None:
            spans.append([start, i])
            start = None
    if start is not None:
        spans.append([start, len(profile)])
    merged = []
    for s in spans:
        if merged and s[0] - merged[-1][1] <= GAP_MERGE:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    out = []
    for a, b in merged:
        if b - a >= MIN_SPAN:
            out.extend(split_wide(profile, a, b) if split else [(a, b)])
    return out


MAX_PANEL = 400   # tramos mas anchos son 2+ viñetas fusionadas por antialiasing


def split_wide(profile, a, b):
    """Divide recursivamente un tramo ancho por su valle central de tinta."""
    if b - a <= MAX_PANEL:
        return [(a, b)]
    lo = a + int((b - a) * 0.3)
    hi = a + int((b - a) * 0.7)
    cut = min(range(lo, hi), key=lambda i: profile[i])
    return split_wide(profile, a, cut) + split_wide(profile, cut + 1, b)


def main(sheet_path, out_dir, prefix):
    im = Image.open(sheet_path).convert("RGB")
    g = im.convert("L")
    w, h = g.size
    px = g.load()

    row_profile = [sum(1 for x in range(w) if px[x, y] < DARK) for y in range(h)]
    bands = runs(row_profile)
    n = 0
    for (y0, y1) in bands:
        col_profile = [sum(1 for y in range(y0, y1) if px[x, y] < DARK)
                       for x in range(w)]
        for (x0, x1) in runs(col_profile, split=True):
            n += 1
            crop = im.crop((x0, y0, x1, y1))
            out = f"{out_dir}\\{prefix}-{n:02d}.png"
            crop.save(out)
            print(f"{out}  {x1-x0}x{y1-y0}  @({x0},{y0})")
    print(f"{n} viñetas extraidas de {sheet_path}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
