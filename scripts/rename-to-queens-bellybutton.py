"""
v5.9 · Renombrado masivo "Plataforma F&B" / "Control de Gestion F&B" -> Queens Bellybutton.

Aplica sustituciones contextuales en HTMLs (titles + brand-marks) y en docs (markdown).
Sustituye tambien los CSS de .brand-mark con gradient verde por version con <img>.

Cobertura:
  - Tareas 221 (header dashboards) + 223 (rename docs)
  - dashboard/editor.html, dashboard/wizard.html, dashboard/metricas.html
  - Resto HTMLs publicos: carta-publica, disponibilidad-publica, flujo-trabajo, mockups, pitch, sala-movil, test-checklist, core/pages/*
  - docs/*.md: README, RESUMEN-EJECUTIVO, DETALLE-PROYECTO, COMERCIALIZACION, CASE-STUDY, arquitectura-plataforma
  - flujo-trabajo y otros HTMLs informativos
"""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Reglas de sustitucion: (regex, replacement, descripcion)
# Aplico solo titles y meta strings de marca, NO los nombres internos de campos.
RULES_HTML = [
    # Titles
    (r'<title>([^<]*?)Plataforma F&B([^<]*?)</title>',
     r'<title>\1Queens Bellybutton\2</title>',
     'title'),
    ('<title>Dashboard · Plataforma F&B</title>',
     '<title>Dashboard · Queens Bellybutton</title>',
     'title-dashboard'),
    ('<title>([^<]*?)Control de Gestión F&B([^<]*?)</title>',
     r'<title>\1Queens Bellybutton\2</title>',
     'title-control'),
    # Brand-mark con "F&amp;B" -> imagen
    # Para HTMLs en dashboard/ (depth 1)
    (r'<div class="brand-mark">F&amp;B</div>',
     r'<div class="brand-mark"><img src="../branding/favicon/icon-192.png" alt="Queens Bellybutton" width="40" height="40"></div>',
     'brand-mark depth1'),
    # Para HTMLs en raiz (sin ../)
    (r'<div class="brand-mark">F&B</div>',
     r'<div class="brand-mark"><img src="branding/favicon/icon-192.png" alt="Queens Bellybutton" width="40" height="40"></div>',
     'brand-mark depth0'),
    # Brand-mark CSS gradient verde -> overflow:hidden con img
    (r'\.brand-mark \{[^}]*?background: linear-gradient\(135deg, var\(--accent\)[^}]*?\}',
     r'''.brand-mark {
    width: 40px; height: 40px;
    border-radius: 9px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(10,23,51,.4);
  }
  .brand-mark img { width: 100%; height: 100%; display: block; object-fit: cover; }''',
     'brand-mark css'),
    # Strings sueltos
    (r'Plataforma F&amp;B', r'Queens Bellybutton', 'string Plataforma'),
    (r'Plataforma F&B', r'Queens Bellybutton', 'string Plataforma plain'),
]

RULES_MD = [
    (r'Plataforma F&B', r'Queens Bellybutton', 'plataforma md'),
    (r'Plataforma F&amp;B', r'Queens Bellybutton', 'plataforma encoded'),
    ('Control de Gestión F&B', 'Queens Bellybutton', 'control md'),
    (r'plataforma F&B', r'plataforma Queens Bellybutton', 'plataforma lower'),
]

# Archivos a procesar
HTMLS = [
    'dashboard/editor.html',
    'dashboard/wizard.html',
    'dashboard/metricas.html',
    'carta-publica.html',
    'disponibilidad-publica.html',
    'flujo-trabajo.html',
    'mockups.html',
    'pitch.html',
    'sala-movil.html',
    'test-checklist.html',
    'core/pages/presupuesto-evento.html',
    'core/pages/contrato-servicios.html',
    'core/pages/orden-servicio.html',
    'core/pages/recetario.html',
]

MDS = [
    'README.md',
    'docs/arquitectura-plataforma.md',
    'docs/RESUMEN-EJECUTIVO.md',
    'docs/DETALLE-PROYECTO.md',
    'docs/COMERCIALIZACION.md',
    'docs/CASE-STUDY.md',
    'docs/TECH-DEBT-v5.7.md',
    'docs/TECH-DEBT-v5.8.md',
    'docs/CODE-REVIEW-v5.7.md',
]

def apply_rules(path, rules):
    full = ROOT / path
    if not full.exists():
        return (path, 'SKIP-not-found', [])
    src = full.read_text(encoding='utf-8')
    original = src
    applied = []
    for pattern, repl, desc in rules:
        new_src, n = re.subn(pattern, repl, src, flags=re.DOTALL)
        if n:
            applied.append(f"{desc}({n})")
            src = new_src
    if src != original:
        full.write_text(src, encoding='utf-8')
        return (path, 'UPDATED', applied)
    return (path, 'NOOP', [])

def main():
    print("v5.9 · renombrado masivo a Queens Bellybutton")
    print("=" * 70)
    print("\n[HTMLs]")
    for p in HTMLS:
        path, status, applied = apply_rules(p, RULES_HTML)
        if applied:
            print(f"  {status:<10} {path:<48} {' '.join(applied)}")
        else:
            print(f"  {status:<10} {path}")
    print("\n[Markdowns]")
    for p in MDS:
        path, status, applied = apply_rules(p, RULES_MD)
        if applied:
            print(f"  {status:<10} {path:<48} {' '.join(applied)}")
        else:
            print(f"  {status:<10} {path}")
    print("\n[OK]")

if __name__ == '__main__':
    main()
