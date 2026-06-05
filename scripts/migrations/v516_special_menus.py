"""
v5.16 - Generar recetas especiales (vegano, vegetariano, sin gluten,
sin lactosa, sin frutos, halal, kosher, infantil) con escandallo Makro 2026
+ los 8 paquetes de menús especiales en menus.json.
"""
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

RECETAS = 'projects/miramar/recetas.json'
MENUS = 'projects/miramar/menus.json'


def r(n, e, g, sub, mp, dietas, prep=15, coc=10, rac=10, dif="Media",
      alergen="-", ing=None, pasos=None):
    """Crea una receta con campo `dietas` (lista) para reutilización."""
    return {
        "n": n, "e": e, "g": g, "sub": sub,
        "prep": prep, "coc": coc, "rac": rac, "dif": dif,
        "mp": mp, "alergen": alergen,
        "dietas": dietas,
        "ing": ing or [], "pasos": pasos or []
    }


# ═══════════════════════════════════════════════════════════════════
# ENTREMESES NUEVOS (cócteles de bienvenida adaptados)
# ═══════════════════════════════════════════════════════════════════
NEW_ENTREMESES = [
    r("Hummus de garbanzo con crudités",
      "🥕", "g3",
      "Crema clásica de garbanzo + tahini + zanahoria, pepino y apio",
      0.55,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=15, coc=20, rac=10, dif="Baja",
      alergen="Sésamo",
      ing=[
          ["200g","Garbanzo cocido","(3€/kg lata)"],
          ["20g","Tahini puro","(15€/kg)"],
          ["1 ud","Limón","zumo (1.50€/kg)"],
          ["1 diente","Ajo","(3€/kg)"],
          ["30ml","AOVE Hojiblanca","(7€/L)"],
          ["c/n","Comino y pimentón","(20€/kg)"],
          ["100g","Zanahoria","baby (2€/kg)"],
          ["100g","Pepino","(1.50€/kg)"],
          ["100g","Apio","(2€/kg)"],
      ],
      pasos=[
          "Triturar garbanzos cocidos con tahini, limón y ajo 2 min vel max.",
          "Emulsionar con AOVE en hilo hasta crema sedosa.",
          "Salpimentar y reservar en frigo 1 h para integrar sabores.",
          "Cortar crudités en bastones de 7 cm.",
          "Servir hummus en cuenco con comino + pimentón espolvoreado encima y crudités alrededor."
      ]),

    r("Falafel mini con salsa tahini",
      "🟢", "g5",
      "Croqueta tradicional de Oriente Medio · garbanzo + cilantro + comino",
      0.70,
      ["vegano","vegetariano","halal","kosher"],
      prep=30, coc=8, rac=10, dif="Media",
      alergen="Sésamo, sulfitos",
      ing=[
          ["250g","Garbanzo seco remojado 12h","(2.50€/kg)"],
          ["20g","Cilantro fresco","(2€/manojo)"],
          ["20g","Perejil fresco","(1.50€/manojo)"],
          ["1 ud","Cebolla pequeña","(1€/kg)"],
          ["2 dientes","Ajo","(3€/kg)"],
          ["10g","Comino + cilantro molido","(20€/kg)"],
          ["c/n","Aceite girasol","fritura (2€/L)"],
          ["20g","Salsa tahini casera","(15€/kg)"],
      ],
      pasos=[
          "Triturar garbanzos crudos remojados con hierbas, ajo y especias (NUNCA cocidos previamente).",
          "Reposar la masa 30 min en frigo.",
          "Formar bolitas de 20g, ligeramente aplanadas.",
          "Freír a 175 ºC durante 3-4 min hasta dorado oscuro.",
          "Servir caliente con salsa tahini-limón en cuenquito."
      ]),

    r("Rollito vietnamita vegano",
      "🌯", "g4",
      "Papel de arroz + verduras crujientes + hierbas frescas + salsa hoisin",
      0.95,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=25, coc=0, rac=10, dif="Media",
      alergen="Soja, cacahuete (salsa)",
      ing=[
          ["10 ud","Papel arroz redondo 22cm","(0.30€/ud)"],
          ["100g","Fideos arroz cocidos","(4€/kg)"],
          ["100g","Zanahoria juliana fina","(2€/kg)"],
          ["50g","Pepino juliana","(1.50€/kg)"],
          ["50g","Col morada juliana","(2.50€/kg)"],
          ["10g","Hojas menta","(1.50€/manojo)"],
          ["10g","Hojas cilantro","(2€/manojo)"],
          ["50g","Salsa hoisin","(8€/L) o tamari para sin gluten"],
      ],
      pasos=[
          "Hidratar el papel arroz 8 seg en agua tibia (no más).",
          "Disponer hierbas en el centro, encima fideos y verduras juliana.",
          "Doblar laterales y enrollar firme como burrito.",
          "Cortar en diagonal por la mitad.",
          "Servir frío con salsa hoisin (sin gluten · usar tamari + arroz)."
      ]),

    r("Bombón de dátil con almendra y coco",
      "🍫", "g8",
      "Bocado dulce-energético · dátil Medjoul + almendra entera + coco rallado",
      0.85,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=15, coc=0, rac=20, dif="Baja",
      alergen="Frutos secos",
      ing=[
          ["1 ud","Dátil Medjoul deshuesado","(20€/kg = 0.50€/ud)"],
          ["1 ud","Almendra Marcona pelada","(18€/kg = 0.10€/ud)"],
          ["3g","Coco rallado","(8€/kg)"],
          ["c/n","Cacao puro","para espolvorear (12€/kg)"],
      ],
      pasos=[
          "Abrir el dátil sin separar las mitades.",
          "Introducir una almendra entera en el centro.",
          "Cerrar y rebozar en coco rallado.",
          "Espolvorear cacao puro al servir para contraste visual.",
          "Conservar a temperatura ambiente · sirve también como petit four post-postre."
      ]),

    r("Brocheta de pollo halal al limón",
      "🍗", "g6",
      "Brocheta marinada en limón, hierbas y aceite oliva · pollo halal certificado",
      1.20,
      ["halal"],
      prep=20, coc=8, rac=10, dif="Media",
      alergen="-",
      ing=[
          ["80g","Pechuga pollo halal certificada","en dados (8€/kg)"],
          ["10ml","Zumo limón fresco","(1.50€/kg)"],
          ["5ml","AOVE","(7€/L)"],
          ["c/n","Comino, cúrcuma, sal","(20€/kg promedio)"],
          ["1 ramita","Orégano fresco","(1€/manojo)"],
          ["1 ud","Brocheta bambú 12cm","(0.02€/ud)"],
      ],
      pasos=[
          "Cortar el pollo halal en dados de 2 cm.",
          "Marinar 30 min con limón, AOVE, comino, cúrcuma y orégano.",
          "Ensartar 4 dados por brocheta.",
          "Plancha o parrilla 4 min por lado hasta dorado.",
          "Servir caliente con salsa de yogur vegetal y menta aparte."
      ]),

    r("Mini hamburguesa infantil",
      "🍔", "g7",
      "Mini-burger sabor familiar · ternera + pan brioche + ketchup + lechuga",
      1.05,
      ["infantil"],
      prep=20, coc=4, rac=10, dif="Baja",
      alergen="Gluten, lácteos, huevo",
      ing=[
          ["40g","Ternera picada limpia","(11€/kg)"],
          ["1 ud","Mini bollo brioche 6cm","(0.35€/ud)"],
          ["1 ud","Loncha queso cheddar","(0.20€/ud)"],
          ["3g","Lechuga iceberg","(2€/kg)"],
          ["c/n","Ketchup natural","(5€/L)"],
          ["c/n","Sal fina","y aceite girasol"],
      ],
      pasos=[
          "Formar mini-burguer de 40g con grosor 1.5 cm.",
          "Plancha caliente con AOVE: 90 seg por lado.",
          "Tostar el brioche partido por la mitad.",
          "Montar: pan + ketchup + lechuga + burguer + queso (deja fundir 30 seg con tapa).",
          "Servir caliente. Cortar en cuartos si es para muy peques."
      ]),

    r("Mini bocadito de pavo y queso (kids)",
      "🥪", "g9",
      "Mini sandwich triangular · pan de molde tostado + pavo + queso suave",
      0.55,
      ["infantil"],
      prep=10, coc=2, rac=10, dif="Baja",
      alergen="Gluten, lácteos",
      ing=[
          ["1 ud","Pan molde tradicional","(1.50€/molde)"],
          ["20g","Pechuga pavo extra","(7€/kg)"],
          ["10g","Queso edam loncha","(8€/kg)"],
          ["c/n","Mantequilla","fina (6€/kg)"],
      ],
      pasos=[
          "Untar pan con mantequilla fina.",
          "Colocar pavo + queso entre dos panes.",
          "Tostar en plancha 2 min por lado hasta dorado.",
          "Cortar en cuartos triangulares.",
          "Servir tibio. Acompañar con palitos zanahoria o uvas peladas."
      ]),
]

# ═══════════════════════════════════════════════════════════════════
# ENTRANTES NUEVOS (cremas, ensaladas, sopas)
# ═══════════════════════════════════════════════════════════════════
NEW_ENTRANTES = [
    r("Crema de calabaza y coco vegana",
      "🎃", "g4",
      "Crema sedosa de calabaza asada + leche coco + jengibre · sin lactosa",
      0.85,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=20, coc=30, rac=4, dif="Baja",
      alergen="-",
      ing=[
          ["500g","Calabaza pelada","(1.20€/kg)"],
          ["200ml","Leche de coco","(5€/L)"],
          ["1 ud","Cebolla mediana","(1€/kg)"],
          ["10g","Jengibre fresco","(8€/kg)"],
          ["20ml","AOVE","(7€/L)"],
          ["c/n","Sal, pimienta, nuez moscada","(20€/kg)"],
          ["10g","Semillas calabaza","tostadas garniture (15€/kg)"],
      ],
      pasos=[
          "Asar la calabaza en dados 30 min a 180 ºC con AOVE y sal.",
          "Pochar la cebolla y jengibre rallado en olla.",
          "Añadir calabaza asada y cubrir con caldo vegetal.",
          "Triturar con leche de coco hasta crema lisa.",
          "Servir caliente con semillas calabaza tostadas y un hilo AOVE."
      ]),

    r("Ensalada de quinoa con verduras al horno",
      "🥗", "g3",
      "Quinoa tricolor + calabacín, pimiento y berenjena asados + aliño limón",
      1.10,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=20, coc=25, rac=4, dif="Baja",
      alergen="-",
      ing=[
          ["120g","Quinoa tricolor","(8€/kg)"],
          ["1 ud","Calabacín mediano","(1.50€/kg)"],
          ["1 ud","Pimiento rojo","(2.50€/kg)"],
          ["1/2 ud","Berenjena","(2€/kg)"],
          ["30ml","AOVE","(7€/L)"],
          ["1 ud","Limón","(1.50€/kg)"],
          ["c/n","Comino y sal","(20€/kg)"],
          ["10g","Pipas girasol tostadas","(5€/kg)"],
      ],
      pasos=[
          "Lavar quinoa 3 veces y cocer 15 min en agua 1:2.",
          "Cortar verduras en dados de 1.5 cm y asar 25 min a 200 ºC con AOVE.",
          "Mezclar quinoa cocida con verduras tibias.",
          "Aliñar con AOVE, zumo limón, comino y sal.",
          "Coronar con pipas girasol al servir. Puede servirse frío o templado."
      ]),

    r("Carpaccio de remolacha con rúcula y cítricos",
      "🟣", "g11",
      "Lámina fina de remolacha asada + rúcula + naranja + aceite de avellana",
      0.95,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=15, coc=45, rac=4, dif="Baja",
      alergen="Frutos secos (aceite avellana, opcional)",
      ing=[
          ["300g","Remolacha cruda","(2.50€/kg)"],
          ["40g","Rúcula fresca","(8€/kg)"],
          ["1 ud","Naranja","gajos y zumo (1.80€/kg)"],
          ["20ml","Aceite avellana o AOVE","(20€/L · 7€/L AOVE)"],
          ["c/n","Sal Maldon","(40€/kg)"],
          ["c/n","Pimienta negra","molida"],
      ],
      pasos=[
          "Asar remolachas enteras envueltas en papel aluminio 45 min a 180 ºC.",
          "Pelar y enfriar. Cortar al cortafiambres en láminas finísimas (grosor 1).",
          "Disponer en plato como carpaccio.",
          "Aliñar con aceite + zumo naranja + sal Maldon + pimienta.",
          "Coronar con rúcula y gajos naranja al servir."
      ]),

    r("Tabule de cuscús de coliflor (low carb · sin gluten)",
      "🥦", "g3",
      "Cuscús de coliflor rallada + perejil + menta + tomate + limón",
      0.90,
      ["vegano","vegetariano","sin_gluten","halal","kosher"],
      prep=20, coc=5, rac=4, dif="Baja",
      alergen="-",
      ing=[
          ["1 ud","Coliflor mediana","(2.50€/kg)"],
          ["30g","Perejil fresco picado","(1.50€/manojo)"],
          ["10g","Menta fresca","(1.50€/manojo)"],
          ["2 ud","Tomate maduro pelado","(2€/kg)"],
          ["1 ud","Cebolleta tierna","(2€/kg)"],
          ["30ml","AOVE","(7€/L)"],
          ["1 ud","Limón","(1.50€/kg)"],
      ],
      pasos=[
          "Rallar la coliflor en grueso (textura de cuscús).",
          "Saltear 2 min en sartén con AOVE para perder el crudo.",
          "Mezclar con perejil, menta, tomate concassé y cebolleta picada.",
          "Aliñar con AOVE, zumo limón y sal.",
          "Reposar 15 min para que se integren sabores."
      ]),

    r("Burrata con tomate confitado y albahaca",
      "🧀", "g5",
      "Burrata fresca + tomates cherry confitados al horno + albahaca fresca",
      1.95,
      ["vegetariano","sin_gluten"],
      prep=10, coc=40, rac=4, dif="Baja",
      alergen="Lácteos",
      ing=[
          ["1 ud","Burrata fresca 125g","Apulia (12€/kg)"],
          ["200g","Tomate cherry rama","(3€/kg)"],
          ["1 diente","Ajo","(3€/kg)"],
          ["20ml","AOVE","(7€/L)"],
          ["c/n","Sal Maldon, pimienta","(40€/kg)"],
          ["5g","Albahaca fresca","(2€/manojo)"],
          ["c/n","Vinagre balsámico Modena","reducción (8€/L)"],
      ],
      pasos=[
          "Confitar los cherry partidos por la mitad con AOVE, ajo y sal 40 min a 130 ºC.",
          "Atemperar la burrata 20 min antes de servir (no fría).",
          "Disponer en plato la burrata cortada con cuchara generosa.",
          "Rodear con los tomates confitados y su jugo.",
          "Decorar con albahaca, sal Maldon y reducción de balsámico."
      ]),

    r("Sopa de pollo y fideos finos (infantil)",
      "🍜", "g6",
      "Caldo de pollo clarificado + fideos cabello de ángel + huevo duro",
      0.40,
      ["infantil"],
      prep=10, coc=15, rac=4, dif="Baja",
      alergen="Gluten, huevo, apio",
      ing=[
          ["1L","Caldo pollo casero clarificado","(1€/L)"],
          ["50g","Fideos cabello ángel","(3€/kg)"],
          ["1 ud","Huevo cocido","picado (0.25€/ud)"],
          ["c/n","Perejil fresco","picado fino (1.50€/manojo)"],
      ],
      pasos=[
          "Llevar el caldo a ebullición.",
          "Añadir los fideos cabello ángel y cocer 3 min (rápido).",
          "Servir caliente con huevo duro picado fino encima y perejil.",
          "Para muy peques, cortar el fideo aún más con tijera."
      ]),

    r("Crema de tomate y zanahoria (infantil)",
      "🍅", "g1",
      "Crema dulce naturalmente · tomate maduro + zanahoria + un toque de nata",
      0.35,
      ["infantil","vegetariano"],
      prep=15, coc=25, rac=4, dif="Baja",
      alergen="Lácteos, apio",
      ing=[
          ["500g","Tomate pera maduro","(1.80€/kg)"],
          ["200g","Zanahoria","(2€/kg)"],
          ["1 ud","Cebolla","(1€/kg)"],
          ["50ml","Nata cocinar","(2€/L)"],
          ["20ml","AOVE","(7€/L)"],
          ["c/n","Sal y un pellizco azúcar","(corrige acidez)"],
      ],
      pasos=[
          "Pochar cebolla y zanahoria en dados 10 min.",
          "Añadir tomate pelado en dados, cubrir con agua, hervir 15 min.",
          "Triturar fino, añadir nata, ajustar sal.",
          "Servir tibia (no demasiado caliente para niños).",
          "Acompañar con picatostes pequeños cortados en formas divertidas."
      ]),
]

# ═══════════════════════════════════════════════════════════════════
# PRIMEROS NUEVOS
# ═══════════════════════════════════════════════════════════════════
NEW_PRIMEROS = [
    r("Paella valenciana vegana",
      "🥘", "g3",
      "Arroz bomba + alcachofas, garrofó, judía verde y pimiento + azafrán",
      1.40,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=20, coc=25, rac=4, dif="Media",
      alergen="-",
      ing=[
          ["320g","Arroz bomba D.O. Valencia","(3.50€/kg)"],
          ["200g","Alcachofa fresca","limpia (4€/kg)"],
          ["100g","Garrofó (judía blanca grande)","(6€/kg)"],
          ["150g","Judía verde plana","(2.50€/kg)"],
          ["1 ud","Pimiento rojo","(2.50€/kg)"],
          ["1 ud","Tomate maduro rallado","(1.80€/kg)"],
          ["c/n","Azafrán en hebra","(40€/kg)"],
          ["c/n","Pimentón Vera dulce","(15€/kg)"],
          ["50ml","AOVE","(7€/L)"],
          ["1L","Caldo verduras","(0.50€/L)"],
      ],
      pasos=[
          "Sofreír verduras en paellera con AOVE 8 min.",
          "Añadir tomate rallado, pimentón y agua hasta sofrito espeso.",
          "Verter el arroz y mover para nacarar 1 min.",
          "Añadir caldo caliente con azafrán en relación 1:2.5.",
          "Cocer 10 min fuego fuerte + 8 min fuego suave + 5 min reposo.",
          "Buscar el socarrat al final del fuego suave."
      ]),

    r("Curry de garbanzos al coco (vegano · sin gluten)",
      "🍛", "g8",
      "Garbanzos en salsa cremosa de coco + cúrcuma + cilantro + arroz basmati",
      1.25,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=15, coc=25, rac=4, dif="Baja",
      alergen="-",
      ing=[
          ["400g","Garbanzo cocido","(3€/kg lata)"],
          ["400ml","Leche de coco","(5€/L)"],
          ["1 ud","Cebolla mediana","(1€/kg)"],
          ["3 dientes","Ajo","(3€/kg)"],
          ["20g","Jengibre fresco rallado","(8€/kg)"],
          ["10g","Curry en polvo","mix Madras (25€/kg)"],
          ["5g","Cúrcuma","(15€/kg)"],
          ["1 ud","Tomate maduro","(1.80€/kg)"],
          ["20g","Cilantro fresco","(2€/manojo)"],
          ["150g","Arroz basmati","(4€/kg)"],
      ],
      pasos=[
          "Pochar cebolla, ajo y jengibre 5 min hasta dorado.",
          "Añadir curry y cúrcuma, tostar 30 seg.",
          "Incorporar tomate rallado, cocinar 3 min.",
          "Añadir garbanzos escurridos y leche coco, hervir 15 min.",
          "Cocer el basmati aparte 12 min en agua salada.",
          "Servir el curry sobre el arroz, terminar con cilantro picado."
      ]),

    r("Lasaña de calabacín (sin gluten)",
      "🍆", "g5",
      "Versión sin pasta · láminas calabacín + tomate + ricotta + mozzarella",
      1.65,
      ["vegetariano","sin_gluten"],
      prep=30, coc=40, rac=4, dif="Media",
      alergen="Lácteos",
      ing=[
          ["3 ud","Calabacín mediano","cortado láminas (1.50€/kg)"],
          ["400g","Tomate triturado","(2€/kg lata)"],
          ["200g","Ricotta fresca","(8€/kg)"],
          ["150g","Mozzarella","rallada (9€/kg)"],
          ["50g","Parmesano","rallado (24€/kg)"],
          ["c/n","Albahaca, sal, pimienta","(2€/manojo)"],
          ["20ml","AOVE","(7€/L)"],
      ],
      pasos=[
          "Cortar calabacín en láminas longitudinales de 3 mm.",
          "Saltear las láminas 1 min por lado para eliminar agua.",
          "Preparar salsa de tomate con AOVE, ajo y albahaca (15 min).",
          "Montar capas: tomate · calabacín · ricotta · mozzarella. Repetir x3.",
          "Coronar con parmesano y hornear 30 min a 180 ºC.",
          "Reposar 10 min antes de cortar (clave para que mantenga forma)."
      ]),

    r("Risotto de setas y trufa (vegetariano)",
      "🍄", "g11",
      "Arroz arborio + mix setas silvestres + raspadura de trufa negra fresca",
      2.20,
      ["vegetariano","sin_gluten"],
      prep=15, coc=22, rac=4, dif="Alta",
      alergen="Lácteos, sulfitos",
      ing=[
          ["320g","Arroz arborio","(5€/kg)"],
          ["300g","Mix setas silvestres","(boletus, shiitake, portobello 12€/kg)"],
          ["1 ud","Cebolla","picada brunoise (1€/kg)"],
          ["100ml","Vino blanco seco","(4€/L)"],
          ["1L","Caldo setas casero","(1€/L)"],
          ["80g","Parmesano 24m rallado","(24€/kg)"],
          ["50g","Mantequilla","(6€/kg)"],
          ["3g","Trufa negra fresca","rallada (200€/kg = 0.60€)"],
      ],
      pasos=[
          "Saltear setas en sartén caliente con AOVE 5 min, reservar.",
          "Pochar cebolla en mantequilla 5 min.",
          "Añadir arroz y nacar 1 min.",
          "Desglasar con vino blanco hasta evaporar alcohol.",
          "Añadir caldo cazo a cazo, removiendo constantemente 18 min.",
          "Fuera del fuego: mantecar con mantequilla, parmesano y setas.",
          "Servir con raspadura de trufa fresca al momento."
      ]),

    r("Pasta integral con tomate y albahaca (vegana)",
      "🍝", "g1",
      "Penne integral · salsa de tomate San Marzano + albahaca + AOVE",
      0.65,
      ["vegano","vegetariano"],
      prep=10, coc=15, rac=4, dif="Baja",
      alergen="Gluten",
      ing=[
          ["320g","Penne integral","(3€/kg)"],
          ["400g","Tomate San Marzano DOP","(4€/kg lata)"],
          ["3 dientes","Ajo","(3€/kg)"],
          ["30ml","AOVE Hojiblanca","(7€/L)"],
          ["10g","Albahaca fresca","(2€/manojo)"],
          ["c/n","Sal, pimienta, pellizco azúcar","(corrige acidez)"],
      ],
      pasos=[
          "Sofreír ajo laminado en AOVE 1 min sin dorar.",
          "Añadir tomate triturado, sal, pimienta y azúcar. Cocer 12 min.",
          "Cocer pasta al dente según paquete (suele ser 11 min).",
          "Saltear pasta escurrida con la salsa 1 min.",
          "Terminar fuera del fuego con albahaca picada al momento."
      ]),

    r("Macarrones con tomate (infantil)",
      "🍝", "g1",
      "Macarrones cortos · salsa tomate dulce + chorrito nata + queso rallado",
      0.45,
      ["infantil"],
      prep=10, coc=12, rac=4, dif="Baja",
      alergen="Gluten, lácteos",
      ing=[
          ["280g","Macarrones cortos","(2.50€/kg)"],
          ["400g","Tomate frito casero","(3€/kg)"],
          ["50ml","Nata cocinar","(2€/L)"],
          ["40g","Queso emmental rallado","(10€/kg)"],
          ["c/n","Sal","(0.60€/kg)"],
      ],
      pasos=[
          "Cocer los macarrones según paquete (8-9 min).",
          "Calentar tomate frito con la nata para una salsa más suave.",
          "Mezclar pasta escurrida con salsa cremosa.",
          "Servir caliente con queso rallado encima (deja fundir).",
          "Cortar la pasta con tijera si es para niños pequeños."
      ]),

    r("Arroz con verduras kids",
      "🍚", "g3",
      "Arroz blanco con guisantes, zanahoria y maíz · sabor suave para niños",
      0.40,
      ["infantil","vegetariano","vegano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=10, coc=18, rac=4, dif="Baja",
      alergen="-",
      ing=[
          ["250g","Arroz redondo","(2€/kg)"],
          ["80g","Guisantes congelados","(3€/kg)"],
          ["80g","Zanahoria en dados","(2€/kg)"],
          ["50g","Maíz dulce","(4€/kg)"],
          ["20ml","AOVE","(7€/L)"],
          ["c/n","Sal fina","(0.60€/kg)"],
      ],
      pasos=[
          "Saltear las verduras en AOVE 5 min.",
          "Añadir el arroz, nacarar 1 min.",
          "Verter agua hirviendo (1:2) con sal.",
          "Cocer 16 min tapado a fuego suave.",
          "Reposar 5 min fuera del fuego antes de servir."
      ]),
]

# ═══════════════════════════════════════════════════════════════════
# SEGUNDOS NUEVOS
# ═══════════════════════════════════════════════════════════════════
NEW_SEGUNDOS = [
    r("Tofu marinado a la plancha con sésamo",
      "🟦", "g5",
      "Bloque tofu firme marinado en tamari + jengibre + sésamo tostado",
      1.45,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=20, coc=8, rac=4, dif="Baja",
      alergen="Soja, sésamo",
      ing=[
          ["400g","Tofu firme","(8€/kg)"],
          ["30ml","Tamari sin gluten","(12€/L)"],
          ["20g","Jengibre rallado","(8€/kg)"],
          ["2 dientes","Ajo","(3€/kg)"],
          ["10ml","Aceite sésamo","(12€/L)"],
          ["10g","Sésamo tostado mix","(8€/kg)"],
          ["1 ud","Cebolleta","picada fina (2€/kg)"],
      ],
      pasos=[
          "Cortar el tofu en bloques de 2 cm de grosor.",
          "Prensar con peso 30 min para eliminar agua.",
          "Marinar 1 h en tamari + jengibre + ajo + aceite sésamo.",
          "Plancha caliente: 3 min por cara hasta dorado con costra.",
          "Servir con la marinada reducida 2 min en sartén como salsa.",
          "Terminar con sésamo y cebolleta picada."
      ]),

    r("Hamburguesa vegana de remolacha y lentejas",
      "🍔", "g7",
      "Patty vegana 100% · lenteja cocida + remolacha + avena + especias",
      1.20,
      ["vegano","vegetariano","sin_lactosa"],
      prep=30, coc=10, rac=4, dif="Media",
      alergen="Gluten (avena · usar certificada SG)",
      ing=[
          ["200g","Lenteja pardina cocida","(3€/kg lata)"],
          ["100g","Remolacha cocida rallada","(2.50€/kg)"],
          ["60g","Copos avena","(3€/kg)"],
          ["1 ud","Cebolla pochada","(1€/kg)"],
          ["10g","Comino, pimentón, ajo polvo","(20€/kg)"],
          ["20ml","AOVE","(7€/L)"],
          ["c/n","Sal y pimienta","(0.60€/kg)"],
      ],
      pasos=[
          "Triturar lentejas con tenedor (no batidora · queremos textura).",
          "Mezclar con remolacha rallada y cebolla pochada.",
          "Añadir avena y especias. Reposar 20 min para hidratar.",
          "Formar burguers de 130g.",
          "Plancha 4 min por lado hasta costra dorada.",
          "Servir con pan brioche, guacamole y rúcula."
      ]),

    r("Lentejas a la jardinera",
      "🫘", "g6",
      "Estofado clásico de lenteja pardina + verduras de temporada + AOVE",
      0.65,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=15, coc=45, rac=4, dif="Baja",
      alergen="Apio, sulfitos",
      ing=[
          ["250g","Lenteja pardina","(3€/kg)"],
          ["1 ud","Cebolla","(1€/kg)"],
          ["2 dientes","Ajo","(3€/kg)"],
          ["1 ud","Zanahoria","(2€/kg)"],
          ["1 ud","Pimiento rojo","(2.50€/kg)"],
          ["1 ud","Tomate maduro","(1.80€/kg)"],
          ["1 ud","Patata mediana","(0.80€/kg)"],
          ["c/n","Laurel, pimentón Vera","(20€/kg)"],
          ["30ml","AOVE","(7€/L)"],
      ],
      pasos=[
          "Pochar cebolla, ajo, zanahoria y pimiento 10 min.",
          "Añadir tomate rallado y pimentón. Cocinar 3 min.",
          "Incorporar lenteja y patata en dados.",
          "Cubrir con agua + laurel. Hervir 35 min fuego suave.",
          "Ajustar sal al final. Reposar 10 min antes de servir."
      ]),

    r("Berenjena rellena de quinoa y tofu (vegano · sin gluten)",
      "🍆", "g4",
      "Berenjena horneada rellena de quinoa + tofu desmenuzado + tomate + hierbas",
      1.30,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=25, coc=40, rac=4, dif="Media",
      alergen="Soja",
      ing=[
          ["2 ud","Berenjena mediana","(2€/kg)"],
          ["100g","Quinoa","(8€/kg)"],
          ["150g","Tofu firme","desmenuzado (8€/kg)"],
          ["1 ud","Cebolla","(1€/kg)"],
          ["2 ud","Tomate maduro","(1.80€/kg)"],
          ["c/n","Comino, orégano, ajo polvo","(20€/kg)"],
          ["20ml","AOVE","(7€/L)"],
          ["10g","Piñones","(35€/kg, opcional · sin frutos: omitir)"],
      ],
      pasos=[
          "Partir berenjenas por la mitad y hornear 25 min boca abajo.",
          "Vaciar la pulpa dejando 1 cm de pared. Picar la pulpa.",
          "Cocer quinoa 15 min en agua salada (1:2).",
          "Saltear cebolla, pulpa berenjena, tofu desmenuzado, tomate y especias.",
          "Mezclar con quinoa. Rellenar las berenjenas.",
          "Hornear 15 min más con piñones (si dieta lo permite) por encima."
      ]),

    r("Cordero halal asado a la miel y especias",
      "🐑", "g8",
      "Paletilla cordero halal certificada + glaseado miel + comino + cilantro",
      3.80,
      ["halal"],
      prep=20, coc=120, rac=4, dif="Alta",
      alergen="Sulfitos",
      ing=[
          ["1.2kg","Paletilla cordero halal","D.O. proveedor certificado (16€/kg)"],
          ["50g","Miel de azahar","(10€/kg)"],
          ["10g","Comino molido","(20€/kg)"],
          ["10g","Cilantro molido","(20€/kg)"],
          ["c/n","Sal, pimienta","(0.60€/kg)"],
          ["50ml","AOVE","(7€/L)"],
          ["3 dientes","Ajo","(3€/kg)"],
      ],
      pasos=[
          "Hacer cortes superficiales en la grasa de la paletilla.",
          "Marinar 4 h con AOVE, ajo majado, miel, comino, cilantro, sal y pimienta.",
          "Hornear 2 h a 160 ºC en fuente con caldo de cordero en el fondo.",
          "Subir a 200 ºC los últimos 15 min para dorar y caramelizar miel.",
          "Reposar 10 min antes de trinchar.",
          "Servir con cuscús de verduras (sin grano si halal estricto = sin trigo)."
      ]),

    r("Salmón al horno (kosher)",
      "🐟", "g9",
      "Salmón fresco kosher (pescado con escamas) + limón + hierbas mediterráneas",
      2.85,
      ["kosher","sin_gluten","sin_lactosa"],
      prep=10, coc=15, rac=4, dif="Baja",
      alergen="Pescado",
      ing=[
          ["600g","Salmón fresco loma","con piel (16€/kg) · kosher si escamas/aletas"],
          ["1 ud","Limón","en rodajas (1.50€/kg)"],
          ["c/n","Eneldo, perejil, tomillo","(2€/manojo)"],
          ["30ml","AOVE","(7€/L)"],
          ["c/n","Sal Maldon, pimienta","(40€/kg)"],
      ],
      pasos=[
          "Disponer el salmón con piel sobre papel sulfurizado.",
          "Cubrir con rodajas de limón y hierbas frescas.",
          "Aliñar con AOVE, sal Maldon y pimienta.",
          "Hornear 15 min a 180 ºC (interior debe quedar rosa nacarado).",
          "Servir con verduras al vapor (cualquier ingrediente parve · sin lácteos ni carne para mantener kashrut)."
      ]),

    r("Pechuga de pollo a la plancha (infantil)",
      "🍗", "g6",
      "Filete pollo · plancha + limón + AOVE · sabor neutro para niños",
      0.95,
      ["infantil","halal"],
      prep=5, coc=8, rac=4, dif="Baja",
      alergen="-",
      ing=[
          ["400g","Pechuga pollo en filetes","(8€/kg)"],
          ["1 ud","Limón","(1.50€/kg)"],
          ["20ml","AOVE","(7€/L)"],
          ["c/n","Sal fina","(0.60€/kg)"],
          ["c/n","Patatas cocidas","(0.80€/kg) o puré"],
      ],
      pasos=[
          "Aplastar levemente los filetes para grosor uniforme.",
          "Sal por ambas caras y dejar 5 min.",
          "Plancha caliente con AOVE: 3 min por lado.",
          "Terminar con zumo limón al momento.",
          "Servir con patatas cocidas o puré · cortar en tiras para niños pequeños."
      ]),

    r("Nuggets de pollo caseros (infantil)",
      "🐔", "g7",
      "Pollo limpio empanado casero · sabor familiar sin aditivos",
      1.10,
      ["infantil"],
      prep=20, coc=8, rac=4, dif="Media",
      alergen="Gluten, huevo",
      ing=[
          ["400g","Pechuga pollo","(8€/kg)"],
          ["2 ud","Huevo M","(0.25€/ud)"],
          ["100g","Harina trigo","(0.50€/kg)"],
          ["150g","Pan rallado panko","(3€/kg)"],
          ["c/n","Sal","(0.60€/kg)"],
          ["c/n","Aceite girasol","fritura (2€/L)"],
      ],
      pasos=[
          "Cortar pollo en dados de 3 cm.",
          "Pasar por harina, huevo batido y panko (doble rebozado).",
          "Reposar 15 min para fijar el rebozado.",
          "Freír a 175 ºC durante 4 min hasta dorado.",
          "Escurrir en papel. Servir con ketchup natural y patatas paja."
      ]),

    r("Albóndigas en salsa de tomate (infantil)",
      "🍅", "g1",
      "Bolitas de ternera+pollo en salsa de tomate dulce · receta tradicional",
      1.15,
      ["infantil"],
      prep=25, coc=30, rac=4, dif="Media",
      alergen="Gluten, huevo, lácteos",
      ing=[
          ["200g","Ternera picada","(11€/kg)"],
          ["200g","Pollo picado","(7€/kg)"],
          ["1 ud","Huevo","(0.25€/ud)"],
          ["50g","Miga pan remojada en leche","(2€/kg pan)"],
          ["c/n","Ajo y perejil picado","(3€/kg ajo)"],
          ["400g","Tomate frito casero","(3€/kg)"],
          ["50ml","Vino blanco","opcional · omitir si no procede (4€/L)"],
          ["20ml","AOVE","(7€/L)"],
      ],
      pasos=[
          "Mezclar carnes con huevo, miga, ajo, perejil y sal.",
          "Formar albóndigas de 30g, enharinar ligeramente.",
          "Freír en AOVE hasta sellado, reservar.",
          "En la misma sartén añadir tomate y vino, hervir 5 min.",
          "Incorporar albóndigas, cocer 20 min a fuego suave.",
          "Servir con patatas paja o arroz blanco."
      ]),
]

# ═══════════════════════════════════════════════════════════════════
# POSTRES NUEVOS
# ═══════════════════════════════════════════════════════════════════
NEW_POSTRES = [
    r("Sorbete de mango y lima (vegano · universal)",
      "🥭", "g4",
      "Sorbete cremoso sin lácteos · mango maduro + lima + sirope agave",
      0.55,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=10, coc=5, rac=8, dif="Baja",
      alergen="-",
      ing=[
          ["500g","Mango maduro","sin piel (4€/kg)"],
          ["2 ud","Lima","zumo y ralladura (2€/kg)"],
          ["60g","Sirope de agave","(8€/L) o azúcar"],
          ["c/n","Hojas menta","(1.50€/manojo)"],
      ],
      pasos=[
          "Congelar el mango en dados 4 h previas.",
          "Triturar congelado con zumo lima, ralladura y agave hasta cremoso.",
          "Pasar a mantecadora 15 min si se quiere textura más fina (opcional).",
          "Servir en copas con hojita de menta y ralladura lima encima.",
          "Consumir inmediatamente."
      ]),

    r("Mousse de chocolate vegano (aquafaba)",
      "🍫", "g11",
      "Mousse aérea sin huevo · aquafaba montada + chocolate negro 70%",
      0.65,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=20, coc=5, rac=6, dif="Alta",
      alergen="Soja (chocolate)",
      ing=[
          ["200g","Chocolate negro 70% vegano","(15€/kg)"],
          ["240ml","Aquafaba (líquido garbanzos)","gratis · de bote"],
          ["60g","Azúcar","(1€/kg)"],
          ["5ml","Vainilla líquida","(20€/L)"],
          ["c/n","Cacao puro","para decorar (12€/kg)"],
      ],
      pasos=[
          "Montar el aquafaba 8-10 min varillas eléctricas hasta picos firmes.",
          "Añadir azúcar gradualmente como en un merengue.",
          "Fundir chocolate al baño maría y enfriar 5 min.",
          "Plegar el chocolate templado en el aquafaba montada con espátula.",
          "Repartir en copas. Refrigerar 4 h mínimo.",
          "Servir con espolvoreo de cacao puro."
      ]),

    r("Brownie vegano sin gluten",
      "🟫", "g11",
      "Brownie denso de chocolate y nueces · harina de almendra + aceite coco",
      0.95,
      ["vegano","vegetariano","sin_gluten","sin_lactosa"],
      prep=20, coc=30, rac=9, dif="Media",
      alergen="Frutos secos (almendra, nuez)",
      ing=[
          ["200g","Harina almendra","(15€/kg)"],
          ["50g","Cacao puro","(12€/kg)"],
          ["120g","Azúcar moreno","(1.50€/kg)"],
          ["100ml","Aceite coco fundido","(8€/L)"],
          ["100g","Compota manzana","(3€/kg) sustituye huevo"],
          ["80g","Chocolate 70% chips","(15€/kg)"],
          ["50g","Nueces","picadas (12€/kg)"],
          ["5g","Levadura química","(4€/kg)"],
      ],
      pasos=[
          "Mezclar secos: harina almendra, cacao, levadura.",
          "Mezclar húmedos: compota, aceite coco, azúcar.",
          "Unir ambas mezclas, añadir chocolate chips y nueces.",
          "Verter en molde 20x20 cm forrado.",
          "Hornear 28-30 min a 170 ºC (debe quedar húmedo dentro).",
          "Enfriar completamente antes de cortar (es esencial para textura)."
      ]),

    r("Macedonia de frutas frescas (universal)",
      "🍉", "g4",
      "Mezcla colorida fruta temporada · piña, sandía, mango, fresa, kiwi, uva",
      0.85,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher","infantil"],
      prep=20, coc=0, rac=6, dif="Baja",
      alergen="-",
      ing=[
          ["200g","Piña fresca","dados (3€/kg)"],
          ["200g","Sandía","dados (1.50€/kg)"],
          ["150g","Mango","dados (4€/kg)"],
          ["150g","Fresa","cuartos (4€/kg)"],
          ["2 ud","Kiwi","rodajas (4€/kg)"],
          ["200g","Uva sin pepita","(3€/kg)"],
          ["1 ud","Naranja","zumo (1.80€/kg)"],
          ["c/n","Hojas menta","decoración (1.50€/manojo)"],
      ],
      pasos=[
          "Cortar todas las frutas en dados uniformes de 1.5 cm.",
          "Disponer en copas o cuenco grande.",
          "Aliñar con zumo de naranja recién exprimido (evita oxidación).",
          "Refrigerar 30 min para que las frutas suelten jugo.",
          "Servir con hoja de menta encima.",
          "Para niños: añadir un toque de helado vainilla aparte."
      ]),

    r("Helado de coco vegano",
      "🥥", "g3",
      "Helado cremoso 100% vegetal · leche coco + sirope arce + vainilla",
      0.70,
      ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
      prep=15, coc=10, rac=6, dif="Media",
      alergen="-",
      ing=[
          ["400ml","Leche coco entera (lata)","(5€/L)"],
          ["100ml","Crema coco espesa","(8€/L)"],
          ["80ml","Sirope arce","(12€/L)"],
          ["10ml","Vainilla líquida","(20€/L)"],
          ["c/n","Sal","pellizco"],
          ["30g","Coco rallado tostado","decoración (8€/kg)"],
      ],
      pasos=[
          "Calentar leche y crema coco con sirope a 80 ºC, sin hervir.",
          "Añadir vainilla y sal. Enfriar completamente.",
          "Mantecar 25 min o congelar batiendo cada hora x4.",
          "Conservar en congelador. Atemperar 5 min antes de servir.",
          "Servir con coco rallado tostado encima."
      ]),

    r("Tarta de manzana sin gluten",
      "🍎", "g3",
      "Tarta clásica · base almendra molida + manzana laminada + canela",
      0.85,
      ["vegetariano","sin_gluten"],
      prep=30, coc=45, rac=8, dif="Media",
      alergen="Lácteos, huevo, frutos secos",
      ing=[
          ["3 ud","Manzana Reineta","(2€/kg)"],
          ["150g","Harina almendra","(15€/kg)"],
          ["80g","Mantequilla","(6€/kg)"],
          ["80g","Azúcar","(1€/kg)"],
          ["1 ud","Huevo","(0.25€/ud)"],
          ["c/n","Canela molida","(12€/kg)"],
          ["50g","Mermelada albaricoque","brillo (5€/kg)"],
      ],
      pasos=[
          "Mezclar harina almendra + mantequilla pomada + 30g azúcar para base.",
          "Forrar molde redondo 24cm, hornear vacío 10 min a 180 ºC.",
          "Mezclar resto azúcar + huevo + canela. Reservar.",
          "Pelar y laminar manzanas finas, disponer en espiral sobre base.",
          "Verter mezcla huevo encima.",
          "Hornear 35 min a 180 ºC. Pintar con mermelada caliente al sacar."
      ]),

    r("Helado de vainilla con galletas (infantil)",
      "🍦", "g4",
      "Clásico de niños · bola vainilla + galletas troceadas + sirope chocolate",
      0.85,
      ["infantil","vegetariano"],
      prep=5, coc=0, rac=4, dif="Baja",
      alergen="Gluten, lácteos, huevo",
      ing=[
          ["4 bolas","Helado vainilla artesano","(12€/L = 0.60€/bola 50ml)"],
          ["80g","Galletas tipo Maria","trituradas (4€/kg)"],
          ["40ml","Sirope chocolate","(8€/L)"],
          ["c/n","Sprinkles","colores (5€/100g)"],
      ],
      pasos=[
          "Disponer una bola generosa de helado en copa.",
          "Triturar galletas con la mano (no muy fino).",
          "Espolvorear galletas sobre el helado.",
          "Decorar con hilo de sirope chocolate.",
          "Coronar con sprinkles. Servir inmediato."
      ]),

    r("Mini tarta de cumpleaños individual (infantil)",
      "🎂", "g5",
      "Mini bizcocho de vainilla con buttercream y velita · presentación divertida",
      1.20,
      ["infantil","vegetariano"],
      prep=30, coc=15, rac=8, dif="Media",
      alergen="Gluten, lácteos, huevo",
      ing=[
          ["8 ud","Mini molde individual","(4€ pack)"],
          ["150g","Harina bizcochona","(2€/kg)"],
          ["150g","Azúcar","(1€/kg)"],
          ["3 ud","Huevo","(0.25€/ud)"],
          ["100g","Mantequilla","(6€/kg)"],
          ["100g","Buttercream colorido","(3€/kg)"],
          ["c/n","Sprinkles, velitas","(5€/100g + 0.10€/velita)"],
      ],
      pasos=[
          "Batir mantequilla pomada + azúcar 3 min.",
          "Añadir huevos uno a uno integrando bien.",
          "Tamizar harina y plegar suavemente.",
          "Repartir en moldes individuales (relleno 2/3).",
          "Hornear 15 min a 180 ºC.",
          "Decorar con buttercream, sprinkles y velita encendida al servir."
      ]),

    r("Brocheta de fruta con chocolate kids",
      "🍓", "g4",
      "Versión kids del clásico · fresa + plátano + uva mojados en chocolate",
      0.55,
      ["infantil","vegetariano","sin_gluten"],
      prep=15, coc=5, rac=10, dif="Baja",
      alergen="Lácteos (chocolate con leche)",
      ing=[
          ["10 ud","Fresa mediana","(4€/kg)"],
          ["1 ud","Plátano","en rodajas (1.50€/kg)"],
          ["20 ud","Uva blanca sin pepita","(3€/kg)"],
          ["100g","Chocolate con leche","fundido (10€/kg)"],
          ["c/n","Sprinkles","colores (5€/100g)"],
          ["10 ud","Brocheta bambú 15cm","(0.02€/ud)"],
      ],
      pasos=[
          "Lavar y secar bien la fruta.",
          "Ensartar alternando fresa-plátano-uva en cada brocheta.",
          "Fundir chocolate al baño maría a 40 ºC.",
          "Sumergir cada brocheta por un extremo y rebozar en sprinkles.",
          "Reposar 10 min sobre papel sulfurizado en frigo para fijar."
      ]),
]


# ═══════════════════════════════════════════════════════════════════
# CARGAR + INYECTAR
# ═══════════════════════════════════════════════════════════════════
with open(RECETAS, 'r', encoding='utf-8') as f:
    recetas = json.load(f)
cats = recetas.setdefault('categorias', {})

# Set de existentes (caso-insensitive)
existing = {}
for cat, arr in cats.items():
    for rec in arr:
        existing[rec['n'].lower()] = cat

def add(cat, lista):
    cats.setdefault(cat, [])
    added = 0
    for rec in lista:
        if rec['n'].lower() in existing:
            # actualizar dietas en receta existente si no las tiene
            for c, arr in cats.items():
                for r2 in arr:
                    if r2['n'].lower() == rec['n'].lower():
                        if 'dietas' not in r2:
                            r2['dietas'] = rec.get('dietas', [])
            continue
        cats[cat].append(rec)
        existing[rec['n'].lower()] = cat
        added += 1
    return added

# También añadir tag `dietas` a las recetas existentes que aplican
DIETAS_EXISTENTES = {
    # entremeses ya creadas en v5.13 que también aplican a dietas especiales
    "Brocheta de queso manchego con uva moscatel": ["vegetariano","sin_gluten"],
    "Brocheta de tomate cherry y mozzarella": ["vegetariano","sin_gluten"],
    "Brocheta de fresa con chocolate": ["vegetariano","sin_gluten"],
    "Cucharilla de Salmorejo": ["sin_gluten"],
    "Vasito de Gazpacho Andaluz": ["vegano","vegetariano","sin_gluten","sin_lactosa","halal","kosher"],
    "Tartar de atún rojo en cucurucho": [],  # gluten en cucurucho
    # entrantes
    "Salmorejo Cordobés (sin pan)": ["vegetariano","sin_gluten"],
    "Carpaccio de Ternera (sin pan)": ["sin_gluten"],
    "Ensalada Gamba Roja": ["sin_gluten"],
    "Tataki de Atún Rojo con sésamo y yuzu": ["sin_gluten"],
    "Tartar de Atún Rojo sobre maíz tostado (sin gluten)": ["sin_gluten"],
    # postres
    "Sorbete de limón": ["vegetariano","sin_gluten","sin_lactosa"],
    "Mini tarta de queso La Viña": ["vegetariano"],
}

# Recorrer y aplicar dietas a existentes
for cat, arr in cats.items():
    for rec in arr:
        if rec['n'] in DIETAS_EXISTENTES and 'dietas' not in rec:
            rec['dietas'] = DIETAS_EXISTENTES[rec['n']]

a_entr = add('entremeses', NEW_ENTREMESES)
a_ent  = add('entrantes',  NEW_ENTRANTES)
a_pri  = add('primeros',   NEW_PRIMEROS)
a_seg  = add('segundos',   NEW_SEGUNDOS)
a_pos  = add('postres',    NEW_POSTRES)

with open(RECETAS, 'w', encoding='utf-8') as f:
    json.dump(recetas, f, ensure_ascii=False, indent=2)

print(f"OK · Recetas inyectadas")
print(f"  entremeses: +{a_entr} (total {len(cats['entremeses'])})")
print(f"  entrantes:  +{a_ent} (total {len(cats['entrantes'])})")
print(f"  primeros:   +{a_pri} (total {len(cats['primeros'])})")
print(f"  segundos:   +{a_seg} (total {len(cats['segundos'])})")
print(f"  postres:    +{a_pos} (total {len(cats['postres'])})")
print(f"\nTotal recetas: {sum(len(v) for v in cats.values())}")

# Estadística por dieta
print("\n=== Recetas por dieta ===")
dieta_count = {}
for cat, arr in cats.items():
    for rec in arr:
        for d in rec.get('dietas', []):
            dieta_count[d] = dieta_count.get(d, 0) + 1
for d, n in sorted(dieta_count.items(), key=lambda x: -x[1]):
    print(f"  {d}: {n} recetas")
