-- ============================================================
-- CONTROL GESTIÓN F&B — SEED RECETAS
-- 40 recetas de ejemplo para el recetario MVP
-- Ejecutar DESPUÉS de seed_data.sql
-- ============================================================

PRAGMA foreign_keys=ON;

-- ============================================================
-- RECETAS — ENTRANTES
-- ============================================================
INSERT OR IGNORE INTO recetas (nombre, descripcion, categoria, tipo_cocina, raciones, peso_racion_g, tiempo_prep_min, tiempo_coccion_min, dificultad, activa) VALUES
('Gazpacho Andaluz',                    'Sopa fría de tomate tradicional andaluza con AOVE y vinagre de Jerez',                    'entrante', 'española',  1, 250, 15,  0,  'baja',  1),
('Salmorejo Cordobés',                  'Crema espesa de tomate con jamón ibérico y huevo cocido rallado',                          'entrante', 'española',  1, 220, 10,  0,  'baja',  1),
('Pulpo a la Gallega',                  'Pulpo cocido con pimentón de la Vera, sal gruesa y AOVE sobre patata cachelo',              'entrante', 'española',  1, 280, 10,  50, 'media', 1),
('Gambas al Ajillo',                    'Gambas salteadas en aceite con ajo laminado, guindilla y vino blanco',                     'entrante', 'española',  1, 200, 8,   5,  'baja',  1),
('Croquetas de Jamón Ibérico',          'Bechamel densa con jamón ibérico de bellota, crujiente empanado, 3 unidades',              'entrante', 'española',  3, 90,  30,  20, 'alta',  1),
('Ensalada Gamba Roja y Aguacate',      'Gamba roja de Málaga con aguacate, escarola y vinagreta cítrica de lima',                  'entrante', 'mediterránea', 1, 200, 12, 3, 'baja',  1),
('Tataki de Atún Rojo',                 'Lomo de atún rojo marcado con sésamo, salsa de soja, mirin y jengibre',                   'entrante', 'fusión',    1, 160, 15,  2,  'media', 1),
('Carpaccio de Ternera',                'Láminas finas de solomillo con rúcula, parmesano 24 meses y alcaparras',                   'entrante', 'italiana',  1, 180, 20,  0,  'media', 1),
('Tostas de Foie con Higos',            'Mi-cuit de pato sobre pan brioche tostado con reducción de Oporto',                      'entrante', 'francesa',  1, 120, 10,  5,  'baja',  1),
('Pimientos del Piquillo con Bacalao',  'Brandada de bacalao en piquillos del norte con velouté de piquillos',                    'entrante', 'española',  1, 200, 20,  15, 'media', 1);

-- ============================================================
-- RECETAS — PRIMEROS PLATOS
-- ============================================================
INSERT OR IGNORE INTO recetas (nombre, descripcion, categoria, tipo_cocina, raciones, peso_racion_g, tiempo_prep_min, tiempo_coccion_min, dificultad, activa) VALUES
('Paella Valenciana',                   'Arroz seco con pollo, conejo, judía verde ferraura, garrofón y azafrán',                   'primero',  'española',  2, 380, 20,  40, 'alta',  1),
('Arroz Negro con Sepia',               'Arroz meloso con tinta de calamar, sepia y alioli casero',                                 'primero',  'mediterránea', 2, 360, 20, 35,'media', 1),
('Risotto de Setas y Trufa',            'Arroz carnaroli cremoso con setas de temporada, parmesano y trufa negra rallada',           'primero',  'italiana',  2, 380, 15,  25, 'alta',  1),
('Espaguetis con Almejas',              'Pasta al dente con almejas gallegas, ajo, guindilla y Albariño',                           'primero',  'italiana',  1, 350, 10,  15, 'baja',  1),
('Fideuà de Marisco',                   'Fideos nº 4 con gambas, mejillones, sepia y fumet concentrado de pescado',                 'primero',  'valenciana', 2, 380, 20, 30,'media', 1),
('Gazpachuelo Malagueño',               'Caldo de merluza emulsionado con mayonesa, patata en dados y colas de gamba',              'primero',  'española',  1, 350, 15,  20, 'media', 1),
('Lentejas con Chorizo',                'Guiso tradicional de lentejas pardinas con chorizo, morcilla y verduras',                   'primero',  'española',  2, 380, 15,  50, 'baja',  1),
('Arroz con Bogavante',                 'Arroz caldoso con bogavante, sofrito malagueño y azafrán. Flameado con brandy',             'primero',  'mediterránea', 2, 420, 25, 35,'alta',  1),
('Crema de Calabaza y Coco',            'Crema aterciopelada de calabaza butternut asada, leche de coco y jengibre fresco',         'primero',  'fusión',    1, 280, 10,  40, 'baja',  1),
('Sopa de Pescado Malagueña',           'Caldo de rape y mejillón con fideos cabello de ángel, pimentón y azafrán',                 'primero',  'española',  1, 320, 20,  30, 'media', 1);

-- ============================================================
-- RECETAS — SEGUNDOS PLATOS
-- ============================================================
INSERT OR IGNORE INTO recetas (nombre, descripcion, categoria, tipo_cocina, raciones, peso_racion_g, tiempo_prep_min, tiempo_coccion_min, dificultad, activa) VALUES
('Solomillo con Reducción de Rioja',    'Medallones de ternera a la plancha con reducción de vino tinto y patata paja',             'segundo',  'española',  1, 280, 15,  15, 'media', 1),
('Lubina al Horno',                     'Lubina entera al horno sobre patatas panadera, limón, hierbas y Albariño',                 'segundo',  'mediterránea', 2, 350, 15, 30,'baja',  1),
('Dorada a la Sal',                     'Dorada entera en costra de sal gruesa. Servicio en sala con apertura en mesa',             'segundo',  'española',  2, 340, 10,  25, 'baja',  1),
('Secreto Ibérico con Patatas Bravas',  'Secreto de cerdo ibérico a la brasa con salsa brava casera y alioli',                     'segundo',  'española',  1, 320, 10,  12, 'baja',  1),
('Carrillada en Vino Tinto',            'Carrillada ibérica estofada 3 horas con Ribera del Duero y puré de patata',               'segundo',  'española',  1, 300, 20, 180, 'alta',  1),
('Gamba Roja a la Plancha',             'Gamba roja de Málaga a la plancha. Mínimo proceso, máxima calidad del producto',           'segundo',  'mediterránea', 1, 300, 5,  3, 'baja',  1),
('Pulpo a la Brasa con Parmentier',     'Tentáculos de pulpo a la brasa sobre parmentier ahumado de patata y pimentón',             'segundo',  'española',  1, 300, 20,  60, 'alta',  1),
('Bacalao al Pil-Pil',                  'Lomo de bacalao confitado en AOVE de ajo con emulsión de gelatina natural',               'segundo',  'vasca',     1, 280, 30,  25, 'alta',  1),
('Pato Confit con Naranja',             'Muslo de pato confitado en su grasa con salsa bigarade de naranja y especias',             'segundo',  'francesa',  1, 280, 20, 150, 'alta',  1),
('Fritura Malagueña',                   'Surtido de pescaíto frito malagueño: boquerones, calamares, gambas y puntillitas',         'segundo',  'española',  1, 350, 15,  10, 'baja',  1);

-- ============================================================
-- RECETAS — POSTRES
-- ============================================================
INSERT OR IGNORE INTO recetas (nombre, descripcion, categoria, tipo_cocina, raciones, peso_racion_g, tiempo_prep_min, tiempo_coccion_min, dificultad, activa) VALUES
('Crema Catalana',                      'Natilla de vainilla y canela con costra de azúcar quemado con soplete',                   'postre',   'española',  1, 180, 15,  15, 'media', 1),
('Tiramisú Clásico',                    'Bizcochos de soletilla en espresso con crema de mascarpone y cacao en polvo',              'postre',   'italiana',  2, 200, 30,  0,  'media', 1),
('Coulant de Chocolate',                'Bizcocho caliente de chocolate negro 70% con interior fundente y helado de vainilla',      'postre',   'francesa',  1, 120, 20,  12, 'alta',  1),
('Tarta de Queso La Viña',              'Tarta de queso cremosa, dorada por fuera y fundente por dentro. Estilo San Sebastián',     'postre',   'española',  6, 160, 15,  45, 'baja',  1),
('Panna Cotta con Frutos Rojos',        'Crema italiana de nata con gelatina de vainilla y coulis de frutos del bosque',            'postre',   'italiana',  1, 180, 15,  10, 'baja',  1),
('Torrijas Caramelizadas',              'Pan brioche empapado en leche de canela, frito y caramelizado con soplete',                'postre',   'española',  1, 160, 20,  10, 'media', 1),
('Bienmesabe Malagueño',               'Crema almendrada tradicional de Málaga con azúcar y yemas. Helado de mantecado',           'postre',   'española',  1, 150, 10,  15, 'baja',  1),
('Mousse de Chocolate Blanco',          'Mousse etérea de chocolate blanco con frambuesas frescas y coulis de frambuesa',           'postre',   'francesa',  2, 140, 20,  5,  'media', 1),
('Flan de Huevo Casero',                'Flan clásico al baño maría con caramelo oscuro. Servicio desmoldado en mesa',              'postre',   'española',  4, 160, 15,  45, 'media', 1),
('Sorbete de Mango y Lima',             'Sorbete artesanal de mango alphonso con ralladura de lima y menta fresca',                 'postre',   'mediterránea', 2, 120, 20, 10, 'media', 1);

-- ============================================================
-- ESCANDALLOS BASE (datos de referencia para los 40 platos)
-- food_cost_pct = 30% como objetivo, costes fijos ~7.49 €/plato
-- ============================================================
WITH mp(nombre_r, coste_mp) AS (VALUES
    ('Gazpacho Andaluz',                        1.20),
    ('Salmorejo Cordobés',                       1.80),
    ('Pulpo a la Gallega',                       5.80),
    ('Gambas al Ajillo',                         4.20),
    ('Croquetas de Jamón Ibérico',               2.60),
    ('Ensalada Gamba Roja y Aguacate',           6.80),
    ('Tataki de Atún Rojo',                      7.50),
    ('Carpaccio de Ternera',                     5.20),
    ('Tostas de Foie con Higos',                 5.80),
    ('Pimientos del Piquillo con Bacalao',       3.80),
    ('Paella Valenciana',                        3.80),
    ('Arroz Negro con Sepia',                    4.20),
    ('Risotto de Setas y Trufa',                 5.80),
    ('Espaguetis con Almejas',                   4.50),
    ('Fideuà de Marisco',                        5.20),
    ('Gazpachuelo Malagueño',                    3.40),
    ('Lentejas con Chorizo',                     1.80),
    ('Arroz con Bogavante',                     14.50),
    ('Crema de Calabaza y Coco',                 1.60),
    ('Sopa de Pescado Malagueña',                3.20),
    ('Solomillo con Reducción de Rioja',         9.80),
    ('Lubina al Horno',                          7.20),
    ('Dorada a la Sal',                          6.50),
    ('Secreto Ibérico con Patatas Bravas',       5.60),
    ('Carrillada en Vino Tinto',                 4.80),
    ('Gamba Roja a la Plancha',                 12.50),
    ('Pulpo a la Brasa con Parmentier',          8.20),
    ('Bacalao al Pil-Pil',                       6.80),
    ('Pato Confit con Naranja',                  7.20),
    ('Fritura Malagueña',                        5.80),
    ('Crema Catalana',                           1.20),
    ('Tiramisú Clásico',                         2.20),
    ('Coulant de Chocolate',                     1.80),
    ('Tarta de Queso La Viña',                   1.60),
    ('Panna Cotta con Frutos Rojos',             1.40),
    ('Torrijas Caramelizadas',                   1.30),
    ('Bienmesabe Malagueño',                     1.50),
    ('Mousse de Chocolate Blanco',               1.80),
    ('Flan de Huevo Casero',                     0.90),
    ('Sorbete de Mango y Lima',                  1.60)
)
INSERT OR IGNORE INTO escandallos (receta_id, nombre, coste_mp, coste_personal, coste_energia, coste_mermas, coste_indirecto, otros_costes, coste_total, food_cost_pct, pvp_calculado, pvp_sugerido, pvp_real, margen_bruto, margen_pct, notas)
SELECT
    r.id,
    r.nombre,
    mp.coste_mp,
    4.00,
    0.55,
    0.35,
    1.50,
    1.09,
    ROUND(mp.coste_mp + 4.00 + 0.55 + 0.35 + 1.50 + 1.09, 2),
    30.0,
    ROUND(mp.coste_mp / 0.30, 2),
    ROUND(ROUND(mp.coste_mp / 0.30, 0) + 0.5 - (ROUND(mp.coste_mp / 0.30, 0) % 1), 2),
    NULL,
    NULL,
    NULL,
    'Escandallo base generado automáticamente. Ajustar pvp_real tras validación.'
FROM recetas r
JOIN mp ON r.nombre = mp.nombre_r
WHERE NOT EXISTS (SELECT 1 FROM escandallos e WHERE e.receta_id = r.id);

-- Actualizar márgenes donde pvp_real no está definido (usar pvp_sugerido como base)
UPDATE escandallos
SET
    pvp_real    = pvp_sugerido,
    margen_bruto = ROUND(pvp_sugerido - coste_total, 2),
    margen_pct   = ROUND((pvp_sugerido - coste_total) / pvp_sugerido * 100, 1)
WHERE pvp_real IS NULL AND pvp_sugerido IS NOT NULL;

-- ============================================================
-- MENÚ DE EJEMPLO: "Menú Degustación Costa del Sol"
-- ============================================================
INSERT OR IGNORE INTO menus (nombre, descripcion, tipo, temporada, activo, notas) VALUES
('Menú Degustación Costa del Sol', 'Menú de 5 pasos con lo mejor de la temporada', 'degustacion', 'verano', 1, 'Precio cerrado por pax, incluye agua y pan');

WITH mp(nombre_r, seccion, pvp, orden) AS (VALUES
    ('Gazpacho Andaluz',                 'aperitivo',  3.50, 1),
    ('Tataki de Atún Rojo',              'entrante',  16.00, 2),
    ('Arroz con Bogavante',              'primero',   28.00, 3),
    ('Solomillo con Reducción de Rioja', 'segundo',   26.00, 4),
    ('Bienmesabe Malagueño',             'postre',     8.00, 5)
)
INSERT OR IGNORE INTO menu_platos (menu_id, receta_id, seccion, pvp_menu, orden)
SELECT
    (SELECT id FROM menus WHERE nombre = 'Menú Degustación Costa del Sol'),
    r.id,
    mp.seccion,
    mp.pvp,
    mp.orden
FROM recetas r
JOIN mp ON r.nombre = mp.nombre_r;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT '--- Recetas insertadas ---' AS info;
SELECT categoria, COUNT(*) AS total FROM recetas WHERE activa=1 GROUP BY categoria ORDER BY categoria;
SELECT '--- Escandallos generados ---' AS info;
SELECT COUNT(*) AS total_escandallos FROM escandallos;
SELECT '--- Menús creados ---' AS info;
SELECT m.nombre, COUNT(mp.id) AS platos FROM menus m LEFT JOIN menu_platos mp ON mp.menu_id = m.id GROUP BY m.id;
