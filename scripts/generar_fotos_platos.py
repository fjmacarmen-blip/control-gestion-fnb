#!/usr/bin/env python3
"""
Control Gestión F&B - Generador de fotos hiperrealistas con Pollinations.ai (FLUX).

Genera fotografías gastronómicas premium para los 40 platos del recetario,
manteniendo la MISMA VAJILLA (plato cerámica blanca con borde dorado,
copas cristal, cubertería plata cepillada) para coherencia de marca.

Usa Pollinations.ai — servicio público gratuito basado en FLUX:
  · Sin API key, sin billing
  · Modelo "flux" (realismo hiperrealista)
  · URL directa, descarga JPG/PNG

Uso:
    python scripts/generar_fotos_platos.py --test           # genera 1 foto
    python scripts/generar_fotos_platos.py --plato N        # genera el plato N
    python scripts/generar_fotos_platos.py --all            # genera los 40
    python scripts/generar_fotos_platos.py --pendientes     # solo los que faltan

Requiere:
    pip install pillow requests
"""

import argparse
import hashlib
import os
import sys
import time
import urllib.parse
from pathlib import Path
from io import BytesIO

# Forzar UTF-8 en Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR  = Path(__file__).parent.parent
IMG_BASE  = BASE_DIR / 'imagenes' / 'platos'

# Pollinations FLUX — gratis, sin API key
POLLINATIONS_URL = 'https://image.pollinations.ai/prompt/{prompt}?model=flux&width=1024&height=768&seed={seed}&nologo=true&enhance=true'

# ─── Vajilla y estilo común (todo en una línea) ───────────────────────────────
VAJILLA_BASE = ('white ceramic plate with thin gold rim, silver cutlery, '
                'crystal wine glass, cream linen napkin, dark aged wood table, '
                'editorial food photography, soft side lighting, '
                'hyperrealistic, premium 5-star hotel style, '
                'shallow depth of field, rich colors, no text, no watermark')

# ─── Catálogo de 40 platos con prompts específicos ────────────────────────────
PLATOS = [
    # ── ENTREMESES (v3.3) ──
    ('entremeses/tabla_ibericos.jpg',
     'Iberian ham platter — slices of jamón ibérico de bellota, lomo, chorizo and salchichón '
     'arranged in a fan on a dark wooden tabla, with rustic toasted bread slices and a small bowl '
     'of grated tomato.'),
    ('entremeses/tabla_quesos.jpg',
     'Artisan cheese board — six Spanish cheeses (Manchego, Brie, goat cheese rulo, Roncal, '
     'smoked Idiazábal, Cabrales blue) arranged on slate, with quince paste, honey drizzle, '
     'walnuts and dried apricots.'),
    ('entremeses/aceitunas_aliñadas.jpg',
     'Premium marinated Spanish olives — mix of green manzanilla, gordal and kalamata olives '
     'in small ceramic bowls, garnished with lemon and orange peel strips, fresh thyme sprigs '
     'and a drizzle of olive oil.'),
    ('entremeses/almendras_marcona.jpg',
     'Toasted Marcona almonds — pile of golden Spanish marcona almonds in a small ceramic bowl, '
     'sprinkled with sea salt flakes and a tiny dusting of smoked paprika.'),
    ('entremeses/boquerones_vinagre.jpg',
     'Boquerones en vinagre — white marinated Spanish anchovies arranged in concentric circles '
     'on a white plate, with chopped garlic and fresh parsley, drizzled with golden olive oil.'),
    ('entremeses/anchoas_cantabrico.jpg',
     'Cantabrian anchovies on toast — dark salt-cured anchovy fillets on toasted rustic bread '
     'with creamy artisan butter and a sprig of chive, on a white plate with gold rim.'),
    ('entremeses/coca_cristal.jpg',
     'Spanish coca de cristal — crispy thin flatbread rectangle topped with fresh grated tomato, '
     'olive oil and a slice of Iberian ham draped on top, served on a white plate with gold rim.'),
    ('entremeses/montadito_bonito.jpg',
     'Mini tuna canapé — small toast topped with flaked white tuna in olive oil, half a green '
     'piparra pepper and half a cherry tomato, secured with a wooden pick.'),
    ('entremeses/bombon_foie.jpg',
     'Foie gras truffle — small ball of mi-cuit foie gras coated in red freeze-dried berries '
     'and pistachio, served on a degustation spoon with a sea salt flake.'),
    ('entremeses/empanadilla_gallega.jpg',
     'Golden Spanish tuna empanadilla — half-moon shaped fried pastry with a flaky golden crust, '
     'tuna and tomato filling visible at the broken edge, lemon wedge garnish.'),
    ('entremeses/pan_tumaca.jpg',
     'Catalan pan tumaca with serrano ham — rustic toasted bread slices rubbed with ripe tomato, '
     'drizzled with olive oil and topped with thin slices of serrano ham, sea salt flakes.'),
    ('entremeses/mini_quiche.jpg',
     'Mini quiche Lorraine — three individual round mini quiches with golden tops, visible '
     'bacon bits and melted cheese, on a white plate with gold rim.'),
    # ── ENTRANTES ──
    ('entrantes/gazpacho_andaluz.jpg',
     'Andalusian gazpacho — chilled raw tomato cream soup, vibrant red color, '
     'topped with diced cucumber, croutons, and a drizzle of green Spanish olive oil. '
     'Served in a small white ceramic bowl with gold rim.'),
    ('entrantes/salmorejo_cordobes.jpg',
     'Cordoban salmorejo — thick tomato-bread cream, orange-red color, '
     'topped with finely grated hard-boiled egg yolk and Spanish Iberian ham strips. '
     'Drizzle of olive oil on top. White ceramic bowl with gold rim.'),
    ('entrantes/pulpo_gallega.jpg',
     'Galician octopus — boiled octopus slices arranged in a circle on top of '
     'cachelo potato discs, dusted with sweet smoked paprika de la Vera, '
     'coarse sea salt and golden olive oil. Wooden tabla or white plate with gold rim.'),
    ('entrantes/gambas_ajillo.jpg',
     'Garlic prawns sizzling in a small brown earthen casserole (cazuela de barro). '
     'Pink shrimp tails, golden olive oil, thinly sliced garlic, one whole red guindilla chili, '
     'fresh parsley. Steam rising. Rustic mood. The cazuela sits on a small white plate with gold rim.'),
    ('entrantes/croquetas_jamon.jpg',
     'Three golden-brown Spanish Iberian ham croquettes, crispy crumb crust, '
     'soft creamy bechamel interior visible in one half-cut croquette. '
     'White ceramic plate with gold rim. Parsley garnish. Lemon wedge.'),
    ('entrantes/ensalada_gamba_roja.jpg',
     'Salad with bright red Mediterranean red prawn tails, sliced avocado, '
     'frisée and escarole, cherry tomato halves, citrus vinaigrette. '
     'Modern plating on white plate with gold rim, microgreens on top.'),
    ('entrantes/tataki_atun_rojo.jpg',
     'Red tuna tataki — seared bluefin tuna loin, dark red interior, sesame seed crust '
     '(black and white sesame), thin slices arranged in fan pattern, drizzled with soy reduction, '
     'pickled ginger and microgreens. White plate with gold rim.'),
    ('entrantes/carpaccio_ternera.jpg',
     'Beef carpaccio — paper-thin raw beef tenderloin slices covering the whole plate, '
     'topped with arugula leaves, Parmesan shavings, capers, lemon zest and olive oil drizzle. '
     'White ceramic plate with gold rim.'),
    ('entrantes/tostas_foie_higos.jpg',
     'Foie gras toasts — three toasted brioche slices topped with thick slabs of mi-cuit '
     'duck foie gras and a generous spoonful of dark fig jam, port reduction drizzle, '
     'fleur de sel flakes. White plate with gold rim.'),
    ('entrantes/piquillos_bacalao.jpg',
     'Two stuffed piquillo red peppers filled with creamy white cod brandada, '
     'glazed with their own red velouté sauce, topped with a few chive sprigs. '
     'White plate with gold rim, dark wood table.'),
    ('entrantes/ensalada_cesar.jpg',
     'Caesar salad with crispy chicken — romaine lettuce, breaded golden chicken strips, '
     'Parmesan shavings, croutons, halved boiled egg and creamy Caesar dressing drizzle. '
     'White plate with gold rim.'),
    ('entrantes/crema_esparragos.jpg',
     'Spanish white asparagus cream soup — pale ivory velvety soup in a white bowl with gold rim, '
     'topped with two crispy white asparagus tips, crumbled Iberian ham flakes and olive oil drops.'),
    ('entrantes/vichyssoise.jpg',
     'Cold vichyssoise with salmon caviar — chilled potato-leek cream in a small white bowl, '
     'topped with a glistening spoonful of orange salmon caviar and finely chopped chives. '
     'Elegant minimalist plating.'),
    ('entrantes/tartar_salmon.jpg',
     'Salmon tartare with avocado — bright orange diced fresh salmon mixed with soy and sesame, '
     'served on a ring mold over diced avocado base, topped with lime zest and chives, '
     'tobiko caviar dots on the side. White plate with gold rim.'),

    # ── PRIMEROS ──
    ('primeros/paella_valenciana.jpg',
     'Authentic Valencian paella in a large black steel paella pan, golden saffron rice, '
     'chicken pieces, rabbit, green ferraura beans, white garrofón beans, '
     'caramelized socarrat visible on the bottom edges. Bright lemon wedge on the side. '
     'The pan rests on a wooden table.'),
    ('primeros/arroz_negro_sepia.jpg',
     'Black rice with squid ink — short grain rice cooked with cuttlefish, glistening black color, '
     'tender squid pieces visible, served in a black ceramic dish with a white dollop '
     'of aioli on the side. Wooden background.'),
    ('primeros/risotto_setas_trufa.jpg',
     'Creamy carnaroli mushroom risotto, golden-beige color, mixed wild mushrooms '
     '(porcini, shiitake) on top, freshly grated black truffle shavings, '
     'parsley, Parmesan curl. White wide plate with gold rim.'),
    ('primeros/espaguetis_almejas.jpg',
     'Spaghetti alle vongole — long pasta strands twirled in nest, with open '
     'Galician clam shells on top, white wine sauce, fresh parsley, garlic slivers, '
     'red chili flakes. White plate with gold rim.'),
    ('primeros/fideua_marisco.jpg',
     'Seafood fideuà — short pasta noodles in golden-orange fish stock with saffron, '
     'pink prawns, black mussels in shell, calamari rings. Served in a small paella pan. '
     'Aioli ramekin on the side. Wooden table.'),
    ('primeros/gazpachuelo_malagueno.jpg',
     'Malaga gazpachuelo — warm creamy emulsified fish broth, ivory color, '
     'with diced potato, pink prawn tails and a few parsley sprigs floating. '
     'Served in a deep white bowl with gold rim. Steam rising.'),
    ('primeros/lentejas_chorizo.jpg',
     'Spanish lentil stew with chorizo — dark brown earthy lentils with red Spanish chorizo slices, '
     'morcilla blood sausage chunks, diced carrot, bay leaf. Hearty rustic look. '
     'White deep bowl with gold rim.'),
    ('primeros/arroz_bogavante.jpg',
     'Lobster rice — Mediterranean soupy rice with a whole split blue lobster on top, '
     'pink-red shell glistening, golden saffron broth, parsley garnish. '
     'Black paella pan or large white deep plate with gold rim.'),
    ('primeros/crema_calabaza_coco.jpg',
     'Butternut pumpkin cream soup, deep orange velvety texture, swirl of coconut milk on top '
     'forming a pattern, toasted pumpkin seeds, fresh chive, tiny olive oil drizzle. '
     'White bowl with gold rim.'),
    ('primeros/sopa_pescado.jpg',
     'Malaga fish soup — orange-red broth with thin fideos noodles, monkfish chunks, '
     'mussel in half-shell, saffron threads. Served in deep white bowl with gold rim. '
     'Lemon wedge on the side.'),
    ('primeros/sopa_castellana.jpg',
     'Castilian garlic soup — rustic terracotta cazuela with reddish-brown bread soup, '
     'a poached egg breaking on top, slices of serrano ham, a dusting of paprika and parsley.'),
    ('primeros/lentejas_foie.jpg',
     'Brown lentil stew with foie gras — dark earthy lentils with roasted chestnuts in a deep '
     'white plate, topped with a seared golden foie gras escalope and a red wine reduction drizzle.'),
    ('primeros/arroz_carabineros.jpg',
     'Creamy carabineros rice — bright red rice studded with two whole grilled red carabinero '
     'prawns on top, glistening saffron sauce, microgreens, served in a white deep plate with '
     'gold rim. Premium presentation.'),

    # ── SEGUNDOS ──
    ('segundos/solomillo_rioja.jpg',
     'Beef tenderloin medallions — two medium-rare seared beef medallions with dark Rioja red wine '
     'reduction glaze, crispy potato straws (patata paja) nest on the side. '
     'Microgreens. White plate with gold rim.'),
    ('segundos/lubina_horno.jpg',
     'Roasted whole sea bass (lubina) — crispy golden skin, served whole on a bed of '
     'panadera potatoes and onion rings, garnished with fresh thyme and lemon slices. '
     'White oval plate with gold rim.'),
    ('segundos/dorada_sal.jpg',
     'Whole roasted gilthead bream baked in coarse salt crust — the salt crust is broken open '
     'revealing the white fish, lemon wedges, fresh rosemary sprig. '
     'White serving platter with gold rim, dramatic dark wood background.'),
    ('segundos/secreto_iberico.jpg',
     'Iberian pork secreto — perfectly sliced grilled Iberian pork "secreto" cut with '
     'crispy charred edges, pink interior, served with patatas bravas (small fried potato cubes) '
     'topped with red brava sauce and white aioli zigzag. White plate with gold rim.'),
    ('segundos/carrillada_vino_tinto.jpg',
     'Iberian pork cheek stew — fork-tender braised pork cheek glistening in dark red wine sauce, '
     'served over a smooth potato purée swirl. Microgreens. Dark mood. White plate with gold rim.'),
    ('segundos/gamba_roja_plancha.jpg',
     'Malaga red prawns grilled on the plancha — six bright red whole prawns with heads '
     'arranged in a row on coarse sea salt crystals, lemon wedge, parsley sprig. '
     'White plate with gold rim. Pure ingredient showcase.'),
    ('segundos/pulpo_brasa_parmentier.jpg',
     'Grilled octopus tentacles, charred edges, served on top of smoked potato parmentier '
     '(creamy mashed potato swirl), dusted with smoked paprika, drizzled with olive oil, '
     'microgreens. White plate with gold rim.'),
    ('segundos/bacalao_pilpil.jpg',
     'Bacalao al pil-pil — confit cod loin with thick yellow emulsified pil-pil sauce, '
     'topped with golden fried garlic slices and one dried red guindilla chili. '
     'Small cazuela de barro on a white plate with gold rim.'),
    ('segundos/pato_confit_naranja.jpg',
     'Confit duck leg — crispy skin, served with orange bigarade sauce, fresh orange segments, '
     'caramelized endive leaves and a sprig of thyme. Dark luxurious mood. White plate with gold rim.'),
    ('segundos/fritura_malaguena.jpg',
     'Malaga-style fried seafood — assortment of crispy golden battered anchovies, '
     'calamari rings, small whole prawns and baby squid (puntillitas), '
     'served on parchment-lined plate with lemon wedge. White plate with gold rim.'),
    ('segundos/rabo_toro.jpg',
     'Oxtail stew in red wine — dark, fork-tender braised oxtail pieces in a glossy deep red '
     'Ribera del Duero wine sauce, served alongside a swirl of creamy potato purée with truffle. '
     'White plate with gold rim. Dramatic dark mood.'),
    ('segundos/lubina_limon.jpg',
     'Sea bass with lemon champagne sauce — golden-skinned roasted sea bass fillet on a pool '
     'of creamy ivory champagne sauce with lemon supremes around it, dill and chive garnish. '
     'White plate with gold rim.'),
    ('segundos/cordero_lechal.jpg',
     'Roasted lamb shoulder — tender Spanish lechal lamb shoulder with golden crispy skin, '
     'served on a bed of roasted baby potatoes with whole garlic cloves and fresh rosemary sprigs. '
     'White serving plate with gold rim.'),
    ('segundos/cochinillo_asado.jpg',
     'Segovian-style roasted suckling pig — quarter of golden roasted cochinillo with crackling '
     'skin, traditionally served on a white ceramic plate with gold rim, with roasted apple '
     'and a sprig of thyme.'),

    # ── POSTRES ──
    ('postres/crema_catalana.jpg',
     'Crema catalana — creamy custard topped with dark caramelized brown sugar crust, '
     'cracked with a spoon revealing the cream below, served in a small terracotta cazuela '
     'placed on a white plate with gold rim. Cinnamon stick garnish.'),
    ('postres/tiramisu_clasico.jpg',
     'Classic tiramisu — square portion with visible layers of mascarpone cream and '
     'espresso-soaked ladyfingers, dusted generously with dark cocoa powder. '
     'Served on white plate with gold rim. Chocolate curl on top.'),
    ('postres/coulant_chocolate.jpg',
     'Dark chocolate molten cake (coulant) — cake cut open, dark molten chocolate flowing out, '
     'served with one perfect quenelle of vanilla ice cream, mint leaf garnish, '
     'cocoa powder dusting. White plate with gold rim.'),
    ('postres/tarta_queso_vina.jpg',
     'Basque burnt cheesecake (tarta de queso La Viña) — single slice with caramelized '
     'dark golden top, creamy interior visible, served on white plate with gold rim. '
     'Optional small dollop of fruit compote on the side.'),
    ('postres/panna_cotta_rojos.jpg',
     'Italian panna cotta — creamy white pudding domed shape on plate, topped with '
     'vibrant red berry coulis cascading down, fresh raspberries and blueberries, mint leaf. '
     'White plate with gold rim.'),
    ('postres/torrijas_caramelizadas.jpg',
     'Spanish torrijas — golden caramelized brioche slices soaked in cinnamon milk, '
     'topped with a quenelle of vanilla ice cream, dusted with cinnamon, '
     'orange peel zest. White plate with gold rim.'),
    ('postres/bienmesabe_malagueno.jpg',
     'Bienmesabe malagueño — pale golden almond cream dessert in a small glass cup or bowl, '
     'topped with toasted slivered almonds and a scoop of vanilla ice cream, '
     'cinnamon dust. White plate with gold rim.'),
    ('postres/mousse_choco_blanco.jpg',
     'White chocolate mousse — elegant quenelle of white chocolate mousse on plate, '
     'fresh raspberries, raspberry coulis dots, white chocolate curls, mint leaf. '
     'White plate with gold rim.'),
    ('postres/flan_huevo_casero.jpg',
     'Spanish egg flan — yellow custard dessert unmolded showing dark caramel sauce, '
     'whipped cream piped on the side, mint leaf. White plate with gold rim. Classic look.'),
    ('postres/sorbete_mango_lima.jpg',
     'Mango lime sorbet — vibrant orange-yellow sorbet scoop in a small glass coupe, '
     'lime zest grated on top, fresh mint leaves, slice of fresh mango on the side. '
     'White plate with gold rim. Refreshing.'),
    ('postres/souffle_grand_marnier.jpg',
     'Grand Marnier soufflé — tall golden risen soufflé in a small white ramekin, '
     'dusted with icing sugar, served immediately with candied orange peel garnish and '
     'a small ramekin of orange sauce on the side. White plate with gold rim.'),
    ('postres/profiteroles.jpg',
     'Profiteroles with hot chocolate — three golden choux pastry profiteroles filled with '
     'whipped cream, drizzled generously with hot dark melted chocolate sauce. Served in a '
     'shallow glass cup or white plate with gold rim.'),
    ('postres/tarta_sacher.jpg',
     'Sacher cake slice — dark chocolate Austrian cake slice showing visible apricot jam layer '
     'in the middle, glossy chocolate ganache top with "Sacher" written in white chocolate, '
     'served on a white plate with gold rim with a small dollop of whipped cream.'),
]


def build_prompt(plato_desc: str) -> str:
    """Prompt corto + en una línea para que quepa en URL de Pollinations."""
    return f"{plato_desc} {VAJILLA_BASE}"


def ensure_dirs():
    for sub in ('entrantes', 'primeros', 'segundos', 'postres'):
        (IMG_BASE / sub).mkdir(parents=True, exist_ok=True)


def generate_one(plato_path: str, plato_desc: str, dry_run: bool = False):
    """Genera UNA foto vía Pollinations.ai (FLUX). Devuelve True si éxito."""
    import requests
    from PIL import Image

    full_path = IMG_BASE / plato_path
    prompt = build_prompt(plato_desc)
    # seed determinista basada en el nombre del plato → reproducibilidad
    seed = int(hashlib.sha1(plato_path.encode()).hexdigest()[:8], 16) % 1_000_000

    print(f"\n📸 Generando: {plato_path}")
    print(f"   Prompt ({len(prompt)} chars): {plato_desc[:80]}...")
    print(f"   Seed: {seed}")

    if dry_run:
        print("   [DRY-RUN] No se genera nada")
        return True

    url = POLLINATIONS_URL.format(prompt=urllib.parse.quote(prompt), seed=seed)

    try:
        r = requests.get(url, timeout=120, headers={'Accept': 'image/*'})
        r.raise_for_status()
        if 'image' not in r.headers.get('Content-Type', ''):
            print(f"   ❌ Respuesta no es imagen: {r.headers.get('Content-Type')}")
            print(f"   Body (200 chars): {r.text[:200]}")
            return False

        img = Image.open(BytesIO(r.content))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        # Redimensionar a 800x600 manteniendo aspect (crop center)
        target_w, target_h = 800, 600
        # Asegurar que sea al menos 800x600
        if img.width < target_w or img.height < target_h:
            ratio = max(target_w/img.width, target_h/img.height)
            img = img.resize((int(img.width*ratio), int(img.height*ratio)),
                              Image.Resampling.LANCZOS)
        # Si es más grande, reducir manteniendo aspect
        img.thumbnail((max(target_w, img.width), max(target_h, img.height)),
                      Image.Resampling.LANCZOS)
        # Crop center
        left = max(0, (img.width - target_w) // 2)
        top  = max(0, (img.height - target_h) // 2)
        img  = img.crop((left, top, left + target_w, top + target_h))
        img.save(full_path, 'JPEG', quality=88, optimize=True)
        size_kb = full_path.stat().st_size / 1024
        print(f"   ✅ {full_path.name} guardado ({size_kb:.1f} KB, {img.width}×{img.height})")
        return True

    except requests.exceptions.Timeout:
        print(f"   ❌ Timeout (120s) — el servicio puede estar lento")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Generador de fotos de platos con Pollinations FLUX')
    parser.add_argument('--test', action='store_true', help='Genera solo gazpacho (test)')
    parser.add_argument('--plato', type=int, help='Genera el plato con índice N (0-39)')
    parser.add_argument('--all', action='store_true', help='Genera los 40')
    parser.add_argument('--pendientes', action='store_true', help='Genera solo los que no existen')
    parser.add_argument('--dry-run', action='store_true', help='Solo muestra qué generaría')
    args = parser.parse_args()

    ensure_dirs()

    # Elegir qué generar
    if args.test:
        tareas = [PLATOS[0]]  # solo gazpacho
    elif args.plato is not None:
        tareas = [PLATOS[args.plato]]
    elif args.pendientes:
        tareas = [(p, d) for (p, d) in PLATOS if not (IMG_BASE / p).exists() or (IMG_BASE / p).stat().st_size < 50_000]
        # < 50 KB = probablemente placeholder antiguo
        print(f"📋 Encontrados {len(tareas)} platos pendientes (no existen o son placeholder)")
    elif args.all:
        tareas = PLATOS
    else:
        parser.print_help()
        sys.exit(0)

    print(f"\n🎨 Iniciando generación de {len(tareas)} foto(s) con Pollinations FLUX")
    print(f"📁 Output: {IMG_BASE}\n")

    ok = 0
    ko = 0
    t0 = time.time()
    for i, (plato_path, plato_desc) in enumerate(tareas, 1):
        print(f"\n[{i}/{len(tareas)}]", end='')
        if generate_one(plato_path, plato_desc, dry_run=args.dry_run):
            ok += 1
        else:
            ko += 1
        if i < len(tareas) and not args.dry_run:
            time.sleep(3)  # respetar el servicio público — 3s entre requests

    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f"✅ Generados: {ok}     ❌ Errores: {ko}     ⏱  {elapsed:.1f}s")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
