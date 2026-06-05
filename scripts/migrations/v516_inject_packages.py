"""
v5.16 - Inyecta los 8 paquetes de MENÚS ESPECIALES en menus.json
filtrando recetas por dieta. Cada paquete tiene composición real con
3 opciones por curso (a elegir 1) + cóctel bienvenida + bodega adaptada.
"""
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

RECETAS = 'projects/miramar/recetas.json'
MENUS = 'projects/miramar/menus.json'


# Mapping clave dieta JSON → clave usada en `dietas` de cada receta
KEY_MAP = {
    "celiaco": "sin_gluten",
    "sinLactosa": "sin_lactosa",
    "sinFrutos": "sin_frutos",
}


FRUTOS_SECOS_PALABRAS = ['frutos secos', 'almendra', 'nuez', 'nueces', 'avellana',
                          'pistacho', 'anacardo', 'pacana', 'macadamia', 'piñones',
                          'piñon', 'cacahuete']


def receta_sin_frutos_secos(rec):
    """True si la receta NO contiene frutos secos en alergen ni en ingredientes."""
    alergen = (rec.get('alergen', '') or '').lower()
    if any(p in alergen for p in FRUTOS_SECOS_PALABRAS):
        return False
    ings = rec.get('ing', [])
    for ing in ings:
        txt = ' '.join(str(x) for x in ing).lower() if isinstance(ing, list) else str(ing).lower()
        if any(p in txt for p in FRUTOS_SECOS_PALABRAS):
            return False
    return True


def get_recetas_dieta(recetas, dieta, categoria, max_n=5):
    """Devuelve nombres de recetas de una categoría compatibles con la dieta."""
    tag = KEY_MAP.get(dieta, dieta)
    arr = recetas.get('categorias', {}).get(categoria, [])
    if dieta == 'sin_frutos':
        # Cualquier receta sin frutos secos en alergen/ingredientes vale
        matches = [r['n'] for r in arr if receta_sin_frutos_secos(r)]
    else:
        matches = [r['n'] for r in arr if tag in r.get('dietas', [])]
    return matches[:max_n] if max_n else matches


def calc_ppax(recetas, plato_names):
    """Estima coste mp/pax sumando los promedios de los platos."""
    mp_map = {}
    for cat, arr in recetas.get('categorias', {}).items():
        for r in arr:
            mp_map[r['n']] = r.get('mp', 0)
    total = sum(mp_map.get(n, 1.5) for n in plato_names)
    # Markup x 3 para llegar a precio venta razonable
    return round(total * 3)


# Cargar recetas
with open(RECETAS, 'r', encoding='utf-8') as f:
    recetas = json.load(f)


# Definición de las 8 dietas con metadatos visuales
DIETAS = [
    {
        "key": "vegano",
        "id": "paq_vegano",
        "icon": "🌱",
        "name": "Menú Vegano",
        "badge": "vegano",
        "color": "#22c55e",
        "g": "g3",
        "desc": "Menú 100% vegetal · sin productos animales · proteína vegetal y verduras de temporada",
        "garantias": [
            "Cocina sin productos animales (carne, pescado, lácteos, huevo, miel)",
            "Aceites y mantequillas exclusivamente vegetales",
            "Vinos sin filtración con caseína o clara (consultar bodega)",
            "Etiquetado en mesa de cada plato",
            "Pulseras verdes identificativas en mesa"
        ]
    },
    {
        "key": "vegetariano",
        "id": "paq_vegetariano",
        "icon": "🥗",
        "name": "Menú Vegetariano",
        "badge": "vegetariano",
        "color": "#84cc16",
        "g": "g5",
        "desc": "Sin carne ni pescado · permitidos lácteos, huevo y miel · proteína de calidad",
        "garantias": [
            "Sin carne ni pescado en ningún plato",
            "Queso curado vegetariano (sin cuajo animal)",
            "Caldo de verduras puro · sin caldo de pollo",
            "Pulseras verde claro identificativas",
            "Servicio normal con menú adaptado"
        ]
    },
    {
        "key": "sin_gluten",   # snake_case alineado con tag de receta
        "id": "paq_sin_gluten",
        "icon": "🌾",
        "name": "Menú Sin Gluten · CELÍACOS",
        "badge": "sin-gluten",
        "color": "#ef4444",
        "g": "g4",
        "desc": "⚠️ Zona dedicada APPCC · cero contaminación cruzada · utensilios separados · pan SG artesano",
        "garantias": [
            "ZONA DE COCINA DEDICADA · protocolo APPCC riguroso",
            "Cero contaminación cruzada · utensilios y tablas separadas",
            "Aceite de fritura exclusivo sin gluten",
            "Pan sin gluten artesano (encargo 48h antes)",
            "Cerveza sin gluten Daura · vinos OK",
            "Pulseras AMARILLAS · vajilla separada",
            "Personal formado en alergias FACE"
        ]
    },
    {
        "key": "sin_lactosa",
        "id": "paq_sin_lactosa",
        "icon": "🥛",
        "name": "Menú Sin Lactosa",
        "badge": "sin-lactosa",
        "color": "#3b82f6",
        "g": "g9",
        "desc": "Sustitución de lácteos por alternativas vegetales · margarina, leche y nata vegetales",
        "garantias": [
            "Mantequilla sustituida por margarina vegetal",
            "Nata sustituida por nata coco o soja",
            "Leche sustituida por leche vegetal en cocina y café",
            "Quesos sin lactosa o sustitutos vegetales",
            "Pulseras AZULES · informar de salsas/postres con lácteos"
        ]
    },
    {
        "key": "sin_frutos",
        "id": "paq_sin_frutos",
        "icon": "🌰",
        "name": "Menú Sin Frutos Secos",
        "badge": "sin-frutos",
        "color": "#f97316",
        "g": "g6",
        "desc": "⚠️ Riesgo anafiláctico · eliminar TODO contacto con frutos secos y cacahuetes",
        "garantias": [
            "Eliminar TODO contacto con frutos secos en cocina",
            "Atención especial con cacahuetes (suelen estar ocultos)",
            "Revisar bases: romesco, pesto, picada catalana",
            "Sin licores con almendra (Amaretto, Disaronno)",
            "Pulseras NARANJAS · informar antes de cada plato",
            "Adrenalina autoinyectable en botiquín de sala"
        ]
    },
    {
        "key": "halal",
        "id": "paq_halal",
        "icon": "🕌",
        "name": "Menú Halal",
        "badge": "halal",
        "color": "#8b5cf6",
        "g": "g8",
        "desc": "Carne de proveedor halal certificado · sin cerdo · sin alcohol en cocción",
        "garantias": [
            "Carne de proveedor HALAL CERTIFICADO (pollo, cordero, ternera)",
            "Sin cerdo en cocina ni en mesa",
            "Sin alcohol en cocción ni en salsas",
            "Utensilios separados del resto de cocina",
            "Sin alcohol en mesa por defecto · oferta mocktails",
            "Pulseras MORADAS"
        ]
    },
    {
        "key": "kosher",
        "id": "paq_kosher",
        "icon": "🕎",
        "name": "Menú Kosher",
        "badge": "kosher",
        "color": "#facc15",
        "g": "g11",
        "desc": "Cumplimiento Kashrut · sin lácteos+carne juntos · pescados con aletas y escamas · supervisión rabínica",
        "garantias": [
            "Cumplimiento KASHRUT con supervisión rabínica externa si requerido",
            "Sin mezcla de lácteos y carne en la misma comida",
            "Solo pescado con aletas y escamas (NO marisco)",
            "Vajilla y utensilios kosher exclusivos",
            "Vino kosher certificado de producción supervisada",
            "Coordinación previa 1 mes para certificación"
        ]
    },
    {
        "key": "infantil",
        "id": "paq_infantil",
        "icon": "👶",
        "name": "Menú Infantil",
        "badge": "infantil",
        "color": "#ec4899",
        "g": "g4",
        "desc": "Porciones reducidas · sabores familiares · presentación divertida · pequeño regalo final",
        "garantias": [
            "Porciones reducidas al 60% del adulto",
            "Sabores familiares sin picante",
            "Cortes pequeños sin huesos ni espinas",
            "Presentación divertida con dibujos",
            "Sillas elevadoras y vajilla irrompible (<6 años)",
            "Mantel individual con crayones",
            "Regalo sorpresa al final del servicio",
            "Pulseras ROSAS"
        ]
    },
]


# Cargar menus.json
with open(MENUS, 'r', encoding='utf-8') as f:
    menus = json.load(f)


# Eliminar TODOS los paquetes con type 'menu_especial' o ids en nuestra lista
# (idempotente: cada ejecución limpia los previos antes de inyectar)
NEW_IDS = {f"paq_{d['key']}" for d in [
    {"key": "vegano"}, {"key": "vegetariano"}, {"key": "sin_gluten"},
    {"key": "sin_lactosa"}, {"key": "sin_frutos"}, {"key": "halal"},
    {"key": "kosher"}, {"key": "infantil"}
]}
old_count = len(menus['paquetes'])
menus['paquetes'] = [p for p in menus['paquetes']
                     if p.get('type') != 'menu_especial'
                     and p.get('id') not in NEW_IDS
                     and p.get('id') not in ['paq_celiaco', 'paq_celíaco', 'paq_sinLactosa', 'paq_sinFrutos']
                     and 'sin gluten' not in p.get('name', '').lower()
                     and 'celíaco' not in p.get('name', '').lower()]
removed = old_count - len(menus['paquetes'])
print(f"Eliminados {removed} paquetes anteriores para re-inyectar limpio")


# Función para construir composición de cada paquete
def build_composition(dieta_key, dieta_meta):
    """Construye composición con 3 opciones a elegir por curso."""
    e_cock = get_recetas_dieta(recetas, dieta_key, 'entremeses', 4)
    e_entr = get_recetas_dieta(recetas, dieta_key, 'entrantes', 3)
    e_prim = get_recetas_dieta(recetas, dieta_key, 'primeros', 3)
    e_segu = get_recetas_dieta(recetas, dieta_key, 'segundos', 3)
    e_post = get_recetas_dieta(recetas, dieta_key, 'postres', 3)

    # Bodega adaptada por dieta
    if dieta_key == 'halal':
        bodega = ["Sin alcohol · Mocktails de autor", "Zumos naturales premium", "Té marroquí menta", "Agua premium Lanjarón"]
    elif dieta_key == 'kosher':
        bodega = ["Vino kosher certificado tinto", "Vino kosher blanco", "Zumos naturales", "Agua mineral"]
    elif dieta_key == 'infantil':
        bodega = ["Zumos naturales (naranja, piña, manzana)", "Bricks individuales", "Agua sin gas", "Refresco sin cafeína"]
    elif dieta_key == 'vegano':
        bodega = ["Vino tinto vegano (sin clarificantes animales)", "Vino blanco vegano DO", "Mocktails frescos", "Agua premium"]
    else:
        bodega = ["Vino tinto Rioja", "Albariño DO", "Cava brut", "Agua · Refrescos · Café"]

    return {
        "Cóctel de bienvenida (1 pieza por pax)": e_cock,
        "Entrantes (1 a elegir)": e_entr,
        "Primero (1 a elegir)": e_prim,
        "Segundo (1 a elegir)": e_segu,
        "Postre (1 a elegir)": e_post,
        "Bodega adaptada": bodega,
        "Garantías y protocolos": dieta_meta['garantias']
    }


# Construir e inyectar los 8 paquetes
new_packages = []
for d in DIETAS:
    composition = build_composition(d['key'], d)
    # Recoger todos los platos para calcular ppax (cogemos 1 de cada curso)
    sample_platos = []
    for sec, items in composition.items():
        if isinstance(items, list) and sec not in ['Bodega adaptada', 'Garantías y protocolos']:
            if items:
                sample_platos.append(items[0])
    ppax_base = calc_ppax(recetas, sample_platos)
    # Mínimo 45 €/pax para que sea realista
    ppax = max(45, ppax_base + 20)  # +20 por servicio/bodega/decoración

    pkg = {
        "id": d['id'],
        "type": "menu_especial",
        "scope": "especial",
        "badge": d['badge'],
        "g": d['g'],
        "icon": d['icon'],
        "name": d['name'],
        "ppax": ppax,
        "color": d['color'],
        "desc": d['desc'],
        "incl": f"Pan adaptado · Bebidas seleccionadas · {d['name']} completo",
        "dieta_key": d['key'],
        "img": "",
        "composition": composition
    }
    new_packages.append(pkg)
    print(f"  ✓ {d['icon']} {d['name']} · {ppax}€/pax · {len([x for x in sum([v for k,v in composition.items() if isinstance(v,list) and k not in ['Bodega adaptada','Garantías y protocolos']], []) if x])} platos")

# Añadir al menus.json
menus['paquetes'].extend(new_packages)

with open(MENUS, 'w', encoding='utf-8') as f:
    json.dump(menus, f, ensure_ascii=False, indent=2)

print(f"\nOK · Total paquetes en menus.json: {len(menus['paquetes'])}")
print(f"  · {len(new_packages)} menús especiales nuevos")
