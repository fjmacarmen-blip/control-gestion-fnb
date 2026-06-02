"""
v5.9 · Inyecta el bloque de favicon + manifest + theme-color en todos los HTMLs.

Calcula el prefijo relativo segun la profundidad del archivo:
  raiz/        -> ./
  dashboard/   -> ../
  core/pages/  -> ../../

Idempotente: si el HTML ya tiene un <link rel="icon"> de v5.9, no se duplica.
Tambien actualiza theme-color de #0d1117 (viejo) a #0a1733 (Queens Bellybutton navy).
"""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Inventario de HTMLs y profundidad (cuantos `..` necesitan)
# (path_relative_to_root, depth)
HTMLS = [
    ('index.html', 0),
    ('carta-publica.html', 0),
    ('disponibilidad-publica.html', 0),
    ('flujo-trabajo.html', 0),
    ('mockups.html', 0),
    ('pitch.html', 0),
    ('sala-movil.html', 0),
    ('test-checklist.html', 0),
    ('dashboard/index.html', 1),
    ('dashboard/editor.html', 1),
    ('dashboard/wizard.html', 1),
    ('dashboard/metricas.html', 1),
    ('core/pages/presupuesto-evento.html', 2),
    ('core/pages/contrato-servicios.html', 2),
    ('core/pages/orden-servicio.html', 2),
    ('core/pages/recetario.html', 2),
]

NEW_THEME = '#0a1733'
OLD_THEME_PATTERNS = ('#0d1117', '#0e1c3f', '#172950')

MARKER_START = '<!-- Queens Bellybutton favicon block v5.9 -->'
MARKER_END   = '<!-- /Queens Bellybutton favicon block -->'

def prefix_for(depth):
    return '../' * depth if depth else ''

def build_block(depth):
    p = prefix_for(depth)
    return f'''{MARKER_START}
<link rel="icon" type="image/svg+xml" href="{p}branding/favicon/favicon.svg">
<link rel="icon" type="image/x-icon" href="{p}branding/favicon/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="{p}branding/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="{p}branding/favicon/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="{p}branding/favicon/apple-touch-icon.png">
<meta name="theme-color" content="{NEW_THEME}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Queens Bellybutton">
{MARKER_END}'''

def process_html(rel_path, depth):
    full_path = ROOT / rel_path
    if not full_path.exists():
        return (rel_path, 'SKIP·not-found')
    src = full_path.read_text(encoding='utf-8')
    original = src

    # 1) Si ya tiene el bloque QBB (re-run idempotente), reemplazarlo
    pattern_existing = re.compile(re.escape(MARKER_START) + r'.*?' + re.escape(MARKER_END),
                                  re.DOTALL)
    new_block = build_block(depth)

    if pattern_existing.search(src):
        src = pattern_existing.sub(new_block, src)
        action = 'UPDATED'
    else:
        # 2) Insertar tras <title>...</title> o antes de </head>
        m = re.search(r'(</title>\s*)', src)
        if m:
            src = src[:m.end()] + '\n' + new_block + '\n' + src[m.end():]
            action = 'INSERTED·after-title'
        else:
            m = re.search(r'(\s*</head>)', src)
            if m:
                src = src[:m.start()] + '\n' + new_block + '\n' + src[m.start():]
                action = 'INSERTED·before-head-close'
            else:
                return (rel_path, 'FAIL·no-head')

    # 3) Limpiar theme-color viejos que queden FUERA del bloque QBB
    #    (si hay un <meta name="theme-color" content="#0d1117"> antiguo, lo quitamos)
    def strip_old_theme(html_text):
        # Eliminar SOLO los meta theme-color que no estan dentro de nuestro bloque
        # Como el bloque QBB ya contiene su propio theme-color, quitamos duplicados antiguos
        # Estrategia: quitar todos los `<meta name="theme-color" content="#XXX">` SALVO el del bloque
        # Como nuestro bloque queda marcado, buscamos los OTROS
        # Implementacion simple: extraer bloque QBB, eliminar todos los theme-color del resto, restaurar bloque
        before, our_block, after = html_text.partition(MARKER_START)
        if not our_block:  # no se inyecto, no hay nada que limpiar
            return html_text
        # Localizar fin del bloque
        block_full, sep_end, post = after.partition(MARKER_END)
        # before = HTML antes del bloque  ;  block_full = contenido entre marker_start y marker_end
        # post = HTML despues del bloque
        # Quitamos cualquier theme-color de 'before' y 'post' pero NO del bloque
        theme_re = re.compile(r'\s*<meta\s+name=["\']theme-color["\']\s+content=["\'][^"\']+["\']\s*/?>\s*',
                              re.IGNORECASE)
        before_clean = theme_re.sub('\n', before)
        post_clean = theme_re.sub('\n', post)
        # Reconstruir
        return before_clean + MARKER_START + block_full + MARKER_END + post_clean

    src = strip_old_theme(src)

    if src != original:
        full_path.write_text(src, encoding='utf-8')
        return (rel_path, action)
    return (rel_path, 'NOOP')

def main():
    print("v5.9 · inyeccion de bloque favicon en HTMLs")
    print("=" * 60)
    results = []
    for rel, depth in HTMLS:
        result = process_html(rel, depth)
        results.append(result)
        print(f"  {result[1]:<28}  {result[0]}")
    print("=" * 60)
    counts = {}
    for _, action in results:
        key = action.split('·')[0]
        counts[key] = counts.get(key, 0) + 1
    print(f"Resumen: {counts}")

if __name__ == '__main__':
    main()
