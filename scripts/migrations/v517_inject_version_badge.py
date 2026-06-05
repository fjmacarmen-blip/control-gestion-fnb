"""
v5.17 - Inyecta <script src="<base>/core/js/version-badge.js" defer></script>
en todos los HTMLs principales del proyecto.

La ruta relativa se calcula según la profundidad de cada archivo.
Idempotente: si ya existe la línea, no la duplica.
"""
import os
import sys
import io
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Mapping: archivo HTML → ruta relativa al script desde el archivo
TARGETS = {
    # Raíz del proyecto
    "index.html":                  "core/js/version-badge.js",
    "pitch.html":                  "core/js/version-badge.js",
    "mockups.html":                "core/js/version-badge.js",
    "flujo-trabajo.html":          "core/js/version-badge.js",
    "sala-movil.html":             "core/js/version-badge.js",
    "disponibilidad-publica.html": "core/js/version-badge.js",
    "evento-publica.html":         "core/js/version-badge.js",
    "carta-publica.html":          "core/js/version-badge.js",
    "test-checklist.html":         "core/js/version-badge.js",
    # /dashboard
    "dashboard/index.html":        "../core/js/version-badge.js",
    "dashboard/superadmin.html":   "../core/js/version-badge.js",
    "dashboard/editor.html":       "../core/js/version-badge.js",
    "dashboard/metricas.html":     "../core/js/version-badge.js",
    "dashboard/wizard.html":       "../core/js/version-badge.js",
    # /scripts
    "scripts/change-password.html":"../core/js/version-badge.js",
    # /core/pages
    "core/pages/presupuesto-evento.html": "../../core/js/version-badge.js",
    "core/pages/recetario.html":          "../../core/js/version-badge.js",
}

INJECT_MARKER = "v5.17 · version-badge"

results = {"injected": [], "already": [], "missing": []}

for path, src in TARGETS.items():
    if not os.path.exists(path):
        results["missing"].append(path)
        continue
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    if INJECT_MARKER in html or 'version-badge.js' in html:
        results["already"].append(path)
        continue
    snippet = f'\n<!-- {INJECT_MARKER} · badge versión visible -->\n' \
              f'<script src="{src}" defer></script>\n'
    # Inyectar justo antes de </body>
    if '</body>' in html:
        new_html = html.replace('</body>', snippet + '</body>', 1)
    else:
        # fallback: añadir al final
        new_html = html + snippet
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    results["injected"].append(path)

print(f"OK · Inyectados: {len(results['injected'])}")
for p in results['injected']:
    print(f"  ✓ {p}")
print(f"\nYa existía en: {len(results['already'])}")
for p in results['already']:
    print(f"  · {p}")
if results['missing']:
    print(f"\n⚠️ No encontrados: {len(results['missing'])}")
    for p in results['missing']:
        print(f"  ✗ {p}")
