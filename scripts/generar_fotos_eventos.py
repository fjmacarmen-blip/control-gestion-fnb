#!/usr/bin/env python3
"""
Control Gestión F&B - Generador de fotos para tipos de evento.

Genera fotografías premium hiperrealistas para los 13 tipos de evento
del cotizador (6 celebraciones + 7 empresa), con estilo coherente y
elegante (5★ Costa del Sol, paleta navy gold).

Uso:
    python scripts/generar_fotos_eventos.py --test       # 1 (boda)
    python scripts/generar_fotos_eventos.py --all        # los 13
    python scripts/generar_fotos_eventos.py --pendientes # solo nuevos
"""

import argparse
import hashlib
import sys
import time
import urllib.parse
from pathlib import Path
from io import BytesIO

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR  = Path(__file__).parent.parent
IMG_BASE  = BASE_DIR / 'imagenes' / 'eventos' / 'eventos'
POLLINATIONS_URL = 'https://image.pollinations.ai/prompt/{prompt}?model=flux&width=1024&height=768&seed={seed}&nologo=true&enhance=true'

# Estilo común: hotel 5★, Mediterráneo, premium, navy
STYLE_BASE = ('premium luxury 5-star hotel Mediterranean coast atmosphere, '
              'elegant warm lighting, gold and navy accents, '
              'editorial photography style, sophisticated and aspirational, '
              'shallow depth of field, rich colors, no text, no watermark, no logos')

EVENTOS = [
    # ── Celebraciones privadas ──
    ('boda.jpg',
     'Elegant outdoor wedding banquet at sunset on a Mediterranean terrace overlooking the sea, '
     'long table with white linen, golden chairs, candles, white peonies and roses centerpieces, '
     'champagne glasses, soft golden hour light'),
    ('comunion.jpg',
     'Elegant communion reception table with white linens, fresh white flowers, gold cutlery, '
     'champagne glasses, a beautiful tiered communion cake with white frosting and gold details '
     'in the background, soft daylight from window'),
    ('bautizo.jpg',
     'Intimate baptism celebration table setting with soft pastels, vintage silver baby spoons '
     'and rattle, small floral arrangements with baby breath, christening cake with delicate '
     'sugar flowers, ivory cloth napkins, soft natural light'),
    ('cumpleanos.jpg',
     'Elegant birthday celebration scene: chocolate layer cake with thin tall candles glowing, '
     'champagne flutes raised in toast, golden balloons in the background, festive but '
     'sophisticated mood, warm lighting'),
    ('aniversario.jpg',
     'Romantic anniversary dinner for two on a private terrace at sunset overlooking the Mediterranean, '
     'two crystal flutes of champagne being clinked, red roses on white linen, candle lit, '
     'golden hour atmosphere'),
    ('galeria.jpg',
     'Elegant private celebration in luxurious hotel ballroom: round tables with white linens, '
     'gold Chiavari chairs, large floral arrangements, crystal chandeliers above, soft '
     'ambient lighting, elegant glasswork'),
    # ── Empresa ──
    ('convencion.jpg',
     'Professional corporate convention setting: large modern conference room with rows of '
     'sleek chairs, large LED presentation screen, well-dressed executives in business attire '
     'attentive, soft daylight from windows, premium business atmosphere'),
    ('team_building.jpg',
     'Corporate team building event in elegant hotel garden: diverse group of professionals '
     'laughing and high-fiving around a outdoor activity table, Mediterranean garden setting, '
     'casual yet polished business casual attire, warm afternoon light, sense of camaraderie'),
    ('reunion_directiva.jpg',
     'Executive boardroom meeting at premium hotel: long dark wood polished conference table, '
     'leather executive chairs, water carafes and notepads, large windows with sea view, '
     'small flower arrangement centerpiece, sophisticated and serious atmosphere'),
    ('lanzamiento.jpg',
     'Premium product launch event: modern stage with bright but warm spotlights, sleek presentation '
     'screens displaying abstract gold graphics, audience silhouettes raising glasses in foreground, '
     'cocktail standing tables, contemporary luxury vibe'),
    ('coctel.jpg',
     'Elegant cocktail and networking event in luxury hotel rooftop terrace: well-dressed '
     'professionals mingling holding cocktail glasses, signature golden cocktail in foreground '
     'with twist of orange, ambient string lights overhead, sea view in background, twilight'),
    ('formacion.jpg',
     'Professional training workshop in elegant hotel conference room: U-shaped table setup '
     'with notepads and water glasses, large flipchart and projector screen, modern leather chairs, '
     'warm daylight, focused but comfortable atmosphere, premium hospitality'),
    ('gala_corporativa.jpg',
     'Elegant corporate gala dinner: long banquet table with white tablecloth, gold-rimmed '
     'china, crystal glasses, tall floral arrangements, candelabras with lit candles, men in '
     'tuxedos and women in evening dresses in soft focus background, golden warm lighting'),
]


def fetch_one(filename: str, prompt_specific: str):
    import requests
    from PIL import Image
    full_path = IMG_BASE / filename
    full_prompt = f"{prompt_specific}. {STYLE_BASE}"
    seed = int(hashlib.sha1(filename.encode()).hexdigest()[:8], 16) % 1_000_000

    print(f"\n📸 Generando: {filename}")
    print(f"   Seed: {seed} · prompt {len(full_prompt)} chars")

    url = POLLINATIONS_URL.format(prompt=urllib.parse.quote(full_prompt), seed=seed)
    try:
        r = requests.get(url, timeout=120, headers={'Accept':'image/*'})
        r.raise_for_status()
        if 'image' not in r.headers.get('Content-Type',''):
            print(f"   ❌ No es imagen: {r.headers.get('Content-Type')}")
            return False

        img = Image.open(BytesIO(r.content))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        target_w, target_h = 800, 600
        if img.width < target_w or img.height < target_h:
            ratio = max(target_w/img.width, target_h/img.height)
            img = img.resize((int(img.width*ratio), int(img.height*ratio)), Image.Resampling.LANCZOS)
        img.thumbnail((max(target_w,img.width), max(target_h,img.height)), Image.Resampling.LANCZOS)
        left = max(0, (img.width-target_w)//2)
        top  = max(0, (img.height-target_h)//2)
        img  = img.crop((left, top, left+target_w, top+target_h))
        img.save(full_path, 'JPEG', quality=88, optimize=True)
        size_kb = full_path.stat().st_size / 1024
        print(f"   ✅ {filename} ({size_kb:.1f} KB)")
        return True
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--test', action='store_true')
    p.add_argument('--all',  action='store_true')
    p.add_argument('--pendientes', action='store_true', help='solo si no existen o son pequeños')
    p.add_argument('--evento', help='nombre concreto, p.ej. team_building.jpg')
    args = p.parse_args()

    IMG_BASE.mkdir(parents=True, exist_ok=True)

    if args.test:
        tareas = [EVENTOS[0]]
    elif args.evento:
        tareas = [(f,d) for (f,d) in EVENTOS if f == args.evento]
    elif args.pendientes:
        tareas = [(f,d) for (f,d) in EVENTOS
                  if not (IMG_BASE/f).exists() or (IMG_BASE/f).stat().st_size < 40_000]
        print(f"📋 Pendientes: {len(tareas)}")
    elif args.all:
        tareas = EVENTOS
    else:
        p.print_help()
        sys.exit(0)

    print(f"\n🎨 Generando {len(tareas)} foto(s) de eventos")
    ok = ko = 0
    t0 = time.time()
    for i,(f,d) in enumerate(tareas, 1):
        print(f"\n[{i}/{len(tareas)}]", end='')
        if fetch_one(f, d): ok += 1
        else: ko += 1
        if i < len(tareas):
            time.sleep(3)

    print(f"\n{'='*60}")
    print(f"✅ {ok}    ❌ {ko}    ⏱ {time.time()-t0:.1f}s")


if __name__ == '__main__':
    main()
