-- ============================================================
-- DATOS INICIALES - CONTROL GESTIÓN F&B
-- Precios de referencia: Makro Málaga + Bedoya Hostelería
-- Fecha: Mayo 2026 | Actualizar con scraper periódicamente
-- ============================================================

-- ============================================================
-- PROVEEDORES
-- ============================================================
INSERT INTO proveedores (nombre, tipo, ciudad, telefono, web, url_catalogo, notas) VALUES
('Makro Málaga',        'mayorista',       'Málaga', '952177070', 'https://www.makro.es', 'https://tienda.makro.es', 'Avd Velázquez 288, Ctra Nal 340 km 238,4. Abierto clientes profesionales.'),
('Bedoya Hostelería',   'distribuidor',    'Málaga', '951981562', 'https://www.bedoyahosteleria.es', 'https://tienda.bedoyahosteleria.es', 'C/ Fernández de Oviedo 8. +3000 referencias. Reparto diario gratuito.'),
('Mercamálaga',         'central_compras', 'Málaga', '952177100', 'https://www.mercamalaga.es', NULL, 'Mercado mayorista de Málaga. Frescos y pescados.'),
('Camarero10 Horeca',   'central_compras', 'Nacional', NULL, 'https://www.camarero10.com', NULL, 'Central de compras nacional para hostelería.'),
('Proveedor local',     'local',           'Costa del Sol', NULL, NULL, NULL, 'Proveedor local/mercado. Precios estimados.');

-- ============================================================
-- UNIDADES DE MEDIDA
-- ============================================================
INSERT INTO unidades_medida (nombre, abreviatura, tipo) VALUES
('kilogramo',   'kg',   'peso'),
('gramo',       'g',    'peso'),
('litro',       'l',    'volumen'),
('mililitro',   'ml',   'volumen'),
('centilitro',  'cl',   'volumen'),
('unidad',      'ud',   'unidad'),
('docena',      'doc',  'unidad'),
('caja',        'caja', 'unidad'),
('botella',     'bot',  'unidad'),
('lata',        'lata', 'unidad'),
('bote',        'bote', 'unidad'),
('sobre',       'sob',  'unidad'),
('bolsa',       'bol',  'unidad');

-- ============================================================
-- CATEGORÍAS
-- ============================================================
INSERT INTO categorias (nombre, nombre_corto, orden) VALUES
('Carnes y Aves',           'Carnes',       1),
('Pescados y Mariscos',     'Pescados',     2),
('Verduras y Hortalizas',   'Verduras',     3),
('Frutas',                  'Frutas',       4),
('Lácteos y Huevos',        'Lácteos',      5),
('Charcutería y Embutidos', 'Charcutería',  6),
('Aceites y Grasas',        'Aceites',      7),
('Salsas y Condimentos',    'Condimentos',  8),
('Conservas',               'Conservas',    9),
('Pasta, Arroz y Legumbres','Pastas',       10),
('Harinas y Panadería',     'Harinas',      11),
('Bebidas Sin Alcohol',     'Bebidas NA',   12),
('Vinos y Cavas',           'Vinos',        13),
('Cervezas',                'Cervezas',     14),
('Destilados y Licores',    'Destilados',   15),
('Congelados',              'Congelados',   16),
('Especias y Hierbas',      'Especias',     17),
('Azúcar y Repostería',     'Repostería',   18),
('Cafés e Infusiones',      'Cafés',        19),
('Otros',                   'Otros',        20);

-- ============================================================
-- PRODUCTOS - CARNES Y AVES (cat_id=1)
-- Precios ref. Makro Málaga Mayo 2026 (precio/kg)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca, origen, url_referencia) VALUES
('Solomillo de ternera',        1, 1, 1, 28.50, 'kg', 1, 28.50, 'Metro Chef', 'España', 'https://tienda.makro.es/shop/category/frescos/carne'),
('Entrecot de ternera',         1, 1, 1, 19.80, 'kg', 1, 19.80, 'Metro Chef', 'España', 'https://tienda.makro.es/shop/category/frescos/carne'),
('Lomo alto de ternera',        1, 1, 1, 22.40, 'kg', 1, 22.40, 'Metro Chef', 'España', NULL),
('Pechuga de pollo fileteada',  1, 1, 1, 5.20,  'kg', 1, 5.20,  'Aro',        'España', NULL),
('Muslo de pollo',              1, 1, 1, 3.90,  'kg', 1, 3.90,  'Aro',        'España', NULL),
('Pollo entero',                1, 1, 1, 3.20,  'kg', 1, 3.20,  'Aro',        'España', NULL),
('Secreto ibérico',             1, 2, 1, 14.50, 'kg', 1, 14.50, NULL,          'España', NULL),
('Presa ibérica',               1, 2, 1, 16.80, 'kg', 1, 16.80, NULL,          'España', NULL),
('Pluma ibérica',               1, 2, 1, 15.20, 'kg', 1, 15.20, NULL,          'España', NULL),
('Costillas de cerdo',          1, 1, 1, 5.80,  'kg', 1, 5.80,  'Metro Chef', 'España', NULL),
('Magro de cerdo picado',       1, 1, 1, 4.90,  'kg', 1, 4.90,  'Metro Chef', 'España', NULL),
('Carne picada mixta',          1, 1, 1, 5.60,  'kg', 1, 5.60,  'Metro Chef', 'España', NULL),
('Pato confit (muslos)',         1, 1, 1, 12.30, 'kg', 1, 12.30, 'Metro Premium','Francia',NULL),
('Carrillada de cerdo',         1, 1, 1, 7.20,  'kg', 1, 7.20,  'Metro Chef', 'España', NULL),
('Rabo de toro',                1, 5, 1, 8.50,  'kg', 1, 8.50,  NULL,          'España', NULL),
('Cordero lechal (pierna)',      1, 1, 1, 18.90, 'kg', 1, 18.90, 'Metro Chef', 'España', NULL),
('Hígado de ternera',           1, 1, 1, 4.20,  'kg', 1, 4.20,  NULL,          'España', NULL);

-- ============================================================
-- PRODUCTOS - PESCADOS Y MARISCOS (cat_id=2)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca, origen, url_referencia) VALUES
('Lubina entera fresca',        2, 3, 1, 12.80, 'kg', 1, 12.80, NULL, 'España', NULL),
('Dorada entera fresca',        2, 3, 1, 10.50, 'kg', 1, 10.50, NULL, 'España', NULL),
('Salmón filete',               2, 1, 1, 11.20, 'kg', 1, 11.20, 'Metro Chef', 'Noruega', NULL),
('Atún rojo (ventresca)',        2, 3, 1, 45.00, 'kg', 1, 45.00, NULL, 'España', NULL),
('Bacalao desalado lomo',       2, 1, 1, 18.60, 'kg', 1, 18.60, 'Metro Chef', 'Noruega', NULL),
('Bacalao salado en salazón',   2, 1, 1, 8.90,  'kg', 1, 8.90,  NULL,         'Noruega', NULL),
('Gamba blanca mediana',        2, 3, 1, 28.00, 'kg', 1, 28.00, NULL, 'Huelva', NULL),
('Gamba roja Málaga',           2, 3, 1, 65.00, 'kg', 1, 65.00, NULL, 'Málaga', NULL),
('Langostino mediano',          2, 1, 1, 14.50, 'kg', 1, 14.50, 'Metro Chef', 'España', NULL),
('Calamar limpio',              2, 3, 1, 9.80,  'kg', 1, 9.80,  NULL, 'España', NULL),
('Pulpo cocido',                2, 1, 1, 11.20, 'kg', 1, 11.20, 'Metro Chef', 'Marruecos', NULL),
('Mejillón fresco (kilo)',      2, 3, 1, 2.80,  'kg', 1, 2.80,  NULL, 'Galicia', NULL),
('Almeja babosa',               2, 3, 1, 12.50, 'kg', 1, 12.50, NULL, 'España', NULL),
('Sepia fresca',                2, 3, 1, 7.20,  'kg', 1, 7.20,  NULL, 'España', NULL),
('Boquerón fresco',             2, 3, 1, 4.50,  'kg', 1, 4.50,  NULL, 'Málaga', NULL),
('Sardina fresca',              2, 3, 1, 3.20,  'kg', 1, 3.20,  NULL, 'España', NULL),
('Merluza filete fresco',       2, 3, 1, 13.80, 'kg', 1, 13.80, NULL, 'España', NULL),
('Rape limpio',                 2, 3, 1, 16.50, 'kg', 1, 16.50, NULL, 'España', NULL),
('Berberecho al natural (lata)',2, 1, 6, 3.20,  'lata 115g', 1, NULL, 'Metro Chef', 'Galicia', NULL),
('Anchoa en aceite (lata)',     2, 2, 6, 8.50,  'lata 80g', 1, NULL, NULL, 'Cantabria', NULL);

-- ============================================================
-- PRODUCTOS - VERDURAS Y HORTALIZAS (cat_id=3)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, origen) VALUES
('Tomate ensalada',             3, 3, 1, 1.20,  'kg', 1, 1.20,  'Almería'),
('Tomate cherry',               3, 3, 1, 3.50,  'kg', 1, 3.50,  'Almería'),
('Tomate pera',                 3, 3, 1, 1.80,  'kg', 1, 1.80,  'Almería'),
('Lechuga romana',              3, 3, 6, 0.90,  'unidad', 1, NULL, 'España'),
('Espinacas baby (bolsa 1kg)',  3, 1, 1, 4.50,  'bolsa 1kg', 1, 4.50, 'España'),
('Cebolla blanca',              3, 3, 1, 0.65,  'kg', 1, 0.65,  'España'),
('Cebolla morada',              3, 3, 1, 1.20,  'kg', 1, 1.20,  'España'),
('Ajo (cabeza)',                3, 3, 6, 0.45,  'unidad', 1, NULL, 'España'),
('Ajo en pasta (bote 500g)',    3, 1, 11, 3.20, 'bote 500g', 500, 6.40, 'Metro Chef'),
('Pimiento rojo',               3, 3, 1, 1.80,  'kg', 1, 1.80,  'España'),
('Pimiento verde',              3, 3, 1, 1.20,  'kg', 1, 1.20,  'España'),
('Pimiento amarillo',           3, 3, 1, 2.80,  'kg', 1, 2.80,  'Holanda'),
('Calabacín',                   3, 3, 1, 1.10,  'kg', 1, 1.10,  'España'),
('Berenjena',                   3, 3, 1, 1.30,  'kg', 1, 1.30,  'España'),
('Zanahoria',                   3, 3, 1, 0.75,  'kg', 1, 0.75,  'España'),
('Patata agria (freír)',        3, 1, 1, 0.55,  'kg', 1, 0.55,  'España'),
('Champiñón laminado',          3, 1, 1, 3.20,  'kg', 1, 3.20,  'España'),
('Setas variadas',              3, 5, 1, 8.50,  'kg', 1, 8.50,  'España'),
('Espárragos verdes',           3, 3, 1, 5.20,  'kg', 1, 5.20,  'España'),
('Aguacate Hass',               3, 3, 6, 0.95,  'unidad', 1, NULL, 'España'),
('Rúcula (bolsa 100g)',         3, 1, 13, 1.80, 'bolsa 100g', 100, 18.00, NULL),
('Brócoli',                     3, 3, 1, 2.20,  'kg', 1, 2.20,  'España'),
('Coliflor',                    3, 3, 6, 1.80,  'unidad', 1, NULL, 'España');

-- ============================================================
-- PRODUCTOS - FRUTAS (cat_id=4)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, origen) VALUES
('Limón',                       4, 3, 1, 0.85,  'kg', 1, 0.85,  'Málaga'),
('Naranja de zumo',             4, 3, 1, 0.65,  'kg', 1, 0.65,  'Valencia'),
('Naranja mesa',                4, 3, 1, 0.90,  'kg', 1, 0.90,  'Valencia'),
('Mango',                       4, 3, 6, 1.20,  'unidad', 1, NULL, 'España'),
('Fresas',                      4, 3, 1, 4.50,  'kg', 1, 4.50,  'Huelva'),
('Frambuesa (bandeja 125g)',    4, 1, 6, 2.80,  'bandeja', 1, 22.40, NULL),
('Melón',                       4, 3, 6, 3.50,  'unidad', 1, NULL, 'España'),
('Sandía',                      4, 3, 6, 5.50,  'unidad', 1, NULL, 'España'),
('Melocotón',                   4, 3, 1, 2.20,  'kg', 1, 2.20,  'España'),
('Plátano',                     4, 3, 1, 1.10,  'kg', 1, 1.10,  'Canarias');

-- ============================================================
-- PRODUCTOS - LÁCTEOS Y HUEVOS (cat_id=5)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca, origen) VALUES
('Huevo L (docena)',            5, 1, 7, 3.20,  'docena', 12, NULL, 'Metro Chef', 'España'),
('Huevo campero M (30 uds)',    5, 1, 6, 7.80,  'caja 30ud', 30, NULL, 'Metro Chef', 'España'),
('Leche entera (litro)',        5, 1, 3, 0.78,  'litro', 1, 0.78, 'Aro', 'España'),
('Nata líquida 35% (litro)',    5, 1, 3, 2.90,  'litro', 1, 2.90, 'Metro Chef', 'España'),
('Nata montar (litro)',         5, 1, 3, 3.20,  'litro', 1, 3.20, 'Metro Chef', 'España'),
('Mantequilla sin sal (250g)',  5, 1, 1, 1.95,  'paquete 250g', 250, 7.80, 'Metro Chef', 'España'),
('Mantequilla clarificada kg',  5, 1, 1, 12.80, 'kg', 1, 12.80, NULL, 'Francia'),
('Yogur natural (125g)',        5, 1, 6, 0.28,  'unidad', 1, NULL, 'Metro Chef', 'España'),
('Queso crema tipo Philadelphia',5, 1, 1, 8.50, 'kg', 1, 8.50, 'Metro Chef', 'España'),
('Mozarella fresca (125g bola)',5, 1, 6, 1.20,  'unidad', 1, NULL, NULL, 'Italia'),
('Parmesano rallado (kg)',      5, 1, 1, 14.50, 'kg', 1, 14.50, NULL, 'Italia'),
('Queso manchego curado',       5, 2, 1, 11.20, 'kg', 1, 11.20, NULL, 'La Mancha'),
('Queso Roncal',                5, 2, 1, 13.80, 'kg', 1, 13.80, NULL, 'Navarra'),
('Queso de cabra rulo (150g)',  5, 2, 6, 2.80,  'unidad', 1, NULL, NULL, 'España'),
('Ricotta (500g)',              5, 1, 1, 3.50,  '500g', 500, 7.00, NULL, 'Italia'),
('Queso brie (kg)',             5, 1, 1, 12.40, 'kg', 1, 12.40, NULL, 'Francia');

-- ============================================================
-- PRODUCTOS - CHARCUTERÍA Y EMBUTIDOS (cat_id=6)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca, origen) VALUES
('Jamón ibérico bellota (loncheado 100g)', 6, 2, 1, 89.00, 'kg', 1, 89.00, NULL, 'España'),
('Jamón serrano bodega (pieza)', 6, 1, 1, 14.50, 'kg', 1, 14.50, 'Metro Chef', 'España'),
('Lomo ibérico curado',         6, 2, 1, 32.00, 'kg', 1, 32.00, NULL, 'España'),
('Salchichón ibérico',          6, 2, 1, 18.50, 'kg', 1, 18.50, NULL, 'España'),
('Chorizo ibérico curado',      6, 2, 1, 17.80, 'kg', 1, 17.80, NULL, 'España'),
('Morcilla de Burgos',          6, 2, 6, 2.80,  'unidad 300g', 1, NULL, NULL, 'Burgos'),
('Foie gras de pato (bloc)',    6, 1, 1, 38.50, 'kg', 1, 38.50, 'Metro Premium','Francia'),
('Panceta fresca (kg)',         6, 1, 1, 5.20,  'kg', 1, 5.20,  'Metro Chef', 'España'),
('Bacon ahumado (kg)',          6, 1, 1, 6.80,  'kg', 1, 6.80,  'Metro Chef', 'España'),
('Cecina de León',              6, 2, 1, 28.00, 'kg', 1, 28.00, NULL, 'León');

-- ============================================================
-- PRODUCTOS - ACEITES Y GRASAS (cat_id=7)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca, origen, denominacion) VALUES
('AOVE virgen extra (5 litros)', 7, 2, 3, 32.50, 'garrafa 5l', 5, 6.50, NULL, 'Málaga', 'DO Málaga'),
('AOVE virgen extra (litro)',    7, 1, 3, 7.80,  'botella 1l', 1, 7.80, 'Metro Chef','España', NULL),
('Aceite de oliva 0.4° (5l)',   7, 1, 3, 22.00, 'garrafa 5l', 5, 4.40, 'Aro', 'España', NULL),
('Aceite de girasol (5 litros)',7, 1, 3, 9.50,  'garrafa 5l', 5, 1.90, 'Aro', 'España', NULL),
('Aceite de trufa (100ml)',     7, 2, 4, 8.90,  'botella 100ml', 0.1, 89.00, NULL, 'Italia', NULL),
('Mantequilla sin sal (kg)',    7, 1, 1, 7.80,  'kg', 1, 7.80,  'Metro Chef', 'España', NULL);

-- ============================================================
-- PRODUCTOS - SALSAS Y CONDIMENTOS (cat_id=8)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca) VALUES
('Sal fina (kg)',                8, 1, 1, 0.48,  'kg', 1, 0.48,  'Aro'),
('Sal maldon (125g)',            8, 1, 1, 3.20,  'caja 125g', 0.125, 25.60,'Metro Premium'),
('Pimienta negra grano (kg)',   8, 1, 1, 18.50, 'kg', 1, 18.50, 'Metro Chef'),
('Pimienta negra molida (kg)',  8, 1, 1, 16.80, 'kg', 1, 16.80, 'Metro Chef'),
('Pimentón dulce de La Vera',   8, 2, 1, 12.50, 'kg', 1, 12.50, NULL),
('Pimentón picante',            8, 2, 1, 12.50, 'kg', 1, 12.50, NULL),
('Azafrán (1g sobre)',          8, 1, 6, 2.80,  'sobre 1g', 1, NULL, NULL),
('Comino molido (kg)',          8, 1, 1, 8.50,  'kg', 1, 8.50,  'Metro Chef'),
('Curry en polvo (kg)',         8, 1, 1, 9.80,  'kg', 1, 9.80,  'Metro Chef'),
('Salsa de soja (litro)',       8, 1, 3, 3.80,  'litro', 1, 3.80, 'Metro Chef'),
('Salsa Worcestershire (150ml)',8, 1, 4, 2.20,  'botella 150ml', 0.15, 14.67,NULL),
('Tabasco (60ml)',              8, 1, 4, 2.80,  'botella 60ml', 0.06, 46.67,NULL),
('Mostaza Dijon (kg)',          8, 1, 1, 4.50,  'kg', 1, 4.50,  'Metro Chef'),
('Tomate frito (kg)',           8, 1, 1, 2.80,  'kg', 1, 2.80,  'Aro'),
('Vinagre de Jerez (litro)',    8, 2, 3, 4.80,  'litro', 1, 4.80, NULL),
('Vinagre módena (litro)',      8, 1, 3, 3.20,  'litro', 1, 3.20, 'Metro Chef'),
('Miel de flores (kg)',         8, 2, 1, 7.80,  'kg', 1, 7.80,  NULL);

-- ============================================================
-- PRODUCTOS - CONSERVAS (cat_id=9)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca, origen) VALUES
('Tomate triturado (bote 2.5kg)',9, 1, 11, 3.80, 'bote 2.5kg', 2.5, 1.52, 'Aro', 'España'),
('Tomate entero pelado (lata 2.5kg)',9,1,10,3.20,'lata 2.5kg',2.5,1.28,'Aro','Italia'),
('Atún en aceite (lata 1kg)',   9, 1, 10, 8.50, 'lata 1kg', 1, 8.50, 'Metro Chef', 'España'),
('Pimiento del piquillo (bote kg)',9,2,11,5.20,'bote 1kg',1,5.20,NULL,'Navarra'),
('Espárragos blancos (lata)',   9, 2, 10, 4.80, 'lata 800g', 0.8, 6.00, NULL, 'Navarra'),
('Garbanzos cocidos (bote 570g)',9,1,11,1.20,'bote 570g',0.57,2.11,'Aro','España'),
('Alubias blancas cocidas',     9, 1, 11, 1.10, 'bote 570g', 0.57, 1.93,'Aro','España'),
('Lentejas cocidas',            9, 1, 11, 0.95, 'bote 570g', 0.57, 1.67,'Aro','España'),
('Aceitunas negras (kg)',        9, 2, 11, 4.20, 'bote 1kg', 1, 4.20, NULL, 'España'),
('Aceitunas manzanilla (kg)',   9, 2, 11, 3.80, 'bote 1kg', 1, 3.80, NULL, 'España'),
('Alcaparras (100g)',           9, 1, 11, 1.50, 'bote 100g', 0.1, 15.00,'Metro Chef','Italia');

-- ============================================================
-- PRODUCTOS - PASTA, ARROZ Y LEGUMBRES (cat_id=10)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca, origen) VALUES
('Arroz bomba (kg)',            10, 1, 1, 3.20, 'kg', 1, 3.20, 'Metro Chef', 'España'),
('Arroz largo (5kg)',           10, 1, 1, 0.95, 'kg', 5, 0.95, 'Aro', 'España'),
('Arroz negro (kg)',            10, 1, 1, 4.80, 'kg', 1, 4.80, NULL, 'España'),
('Pasta espagueti (5kg)',       10, 1, 1, 2.20, 'caja 5kg', 5, 2.20, 'La Molisana', 'Italia'),
('Pasta penne rigate (5kg)',    10, 1, 1, 2.20, 'caja 5kg', 5, 2.20, 'La Molisana', 'Italia'),
('Pasta fettuccine (5kg)',      10, 1, 1, 2.40, 'caja 5kg', 5, 2.40, 'La Molisana', 'Italia'),
('Garbanzos secos (kg)',        10, 1, 1, 2.80, 'kg', 1, 2.80, 'Aro', 'España'),
('Lentejas pardinas (kg)',      10, 1, 1, 2.20, 'kg', 1, 2.20, 'Aro', 'España'),
('Quinoa (kg)',                 10, 1, 1, 5.80, 'kg', 1, 5.80, NULL, NULL),
('Cuscús (kg)',                 10, 1, 1, 3.20, 'kg', 1, 3.20, 'Metro Chef', NULL);

-- ============================================================
-- PRODUCTOS - HARINAS Y PANADERÍA (cat_id=11)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca) VALUES
('Harina de trigo floja (25kg)',11, 1, 1, 0.65, '25kg', 25, 0.65, 'Metro Chef'),
('Harina de fuerza (25kg)',    11, 1, 1, 0.80, '25kg', 25, 0.80, 'Metro Chef'),
('Pan de molde (rebanado)',     11, 1, 13, 1.80, 'bolsa', 1, NULL, 'Metro Chef'),
('Pan rallado (kg)',            11, 1, 1, 1.20, 'kg', 1, 1.20, 'Aro'),
('Panko japonés (kg)',          11, 1, 1, 4.50, 'kg', 1, 4.50, NULL),
('Levadura fresca (kg)',        11, 1, 1, 2.50, 'kg', 1, 2.50, NULL),
('Levadura seca (100g)',        11, 1, 6, 1.20, 'sobre 100g', 0.1, 12.00, NULL);

-- ============================================================
-- PRODUCTOS - BEBIDAS SIN ALCOHOL (cat_id=12)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca) VALUES
('Agua mineral 33cl (caja 24)', 12, 1, 4, 3.60, 'caja 24ud', 24, NULL, 'Metro Chef'),
('Agua mineral 50cl (caja 24)', 12, 1, 4, 4.80, 'caja 24ud', 24, NULL, 'Metro Chef'),
('Agua con gas 1l (caja 12)',   12, 1, 3, 5.20, 'caja 12ud', 12, NULL, 'Metro Chef'),
('Zumo naranja 1l (brik)',      12, 1, 3, 1.80, 'brik 1l', 1, 1.80, 'Rioba'),
('Zumo tomate 1l (brik)',       12, 1, 3, 1.50, 'brik 1l', 1, 1.50, 'Rioba'),
('Coca-Cola 33cl (caja 24)',    12, 1, 4, 14.40,'caja 24ud',24, NULL, 'Coca-Cola'),
('Coca-Cola Zero 33cl (caja 24)',12,1, 4, 14.40,'caja 24ud',24, NULL, 'Coca-Cola'),
('Nestea limón 33cl (caja 24)', 12, 1, 4, 12.00,'caja 24ud',24, NULL, NULL),
('Bitter Kas (caja 24ud 20cl)', 12, 1, 4, 11.50,'caja 24ud',24, NULL, 'Kas'),
('Tónica Schweppes 20cl (24ud)',12, 1, 4, 10.80,'caja 24ud',24, NULL, 'Schweppes');

-- ============================================================
-- PRODUCTOS - VINOS Y CAVAS (cat_id=13)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, origen, denominacion, notas) VALUES
('Vino tinto Rioja crianza',    13, 2, 9, 5.80,  'botella 75cl', 0.75, 7.73, 'España', 'DO Rioja', 'Precio por botella'),
('Vino tinto Ribera Duero',     13, 2, 9, 7.50,  'botella 75cl', 0.75, 10.00,'España', 'DO Ribera del Duero', NULL),
('Vino blanco Albariño',        13, 2, 9, 8.20,  'botella 75cl', 0.75, 10.93,'España', 'DO Rías Baixas', NULL),
('Vino blanco Rueda',           13, 2, 9, 5.50,  'botella 75cl', 0.75, 7.33, 'España', 'DO Rueda', NULL),
('Vino rosado Málaga',          13, 2, 9, 6.50,  'botella 75cl', 0.75, 8.67, 'Málaga', 'DO Málaga', NULL),
('Cava brut (botella)',         13, 1, 9, 6.20,  'botella 75cl', 0.75, 8.27, 'España', 'DO Cava', NULL),
('Vino tinto gran reserva',     13, 2, 9, 18.00, 'botella 75cl', 0.75, 24.00,'España', NULL, 'Para carta premium'),
('Vino dulce Pedro Ximénez',    13, 2, 9, 9.50,  'botella 75cl', 0.75, 12.67,'España', 'DO Montilla-Moriles',NULL),
('Vino blanco servir copa (litro)',13,1,3,3.20,  'bag-in-box', 1, 3.20, 'España', NULL, 'Para cocina/carta básica');

-- ============================================================
-- PRODUCTOS - CERVEZAS (cat_id=14)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca) VALUES
('Cerveza barril 30l (tiro)',   14, 1, 8, 48.00, 'barril 30l', 30, 1.60, 'Metro Chef'),
('Victoria barril 30l',        14, 5, 8, 58.00, 'barril 30l', 30, 1.93, 'Victoria'),
('Cruzcampo barril 50l',       14, 5, 8, 78.00, 'barril 50l', 50, 1.56, 'Cruzcampo'),
('Cerveza botellín 25cl (24ud)',14, 1, 9, 14.40, 'caja 24ud', 24, NULL, 'Aro'),
('Cerveza sin alcohol 25cl',   14, 1, 9, 9.60,  'caja 24ud', 24, NULL, 'Metro Chef'),
('Cerveza artesana IPA 33cl',  14, 2, 9, 2.80,  'botella 33cl', 1, NULL, NULL);

-- ============================================================
-- PRODUCTOS - DESTILADOS Y LICORES (cat_id=15)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca) VALUES
('Gin Bombay Sapphire (70cl)', 15, 1, 9, 18.50, 'botella 70cl', 0.7, 26.43, 'Bombay'),
('Vodka Absolut (70cl)',       15, 1, 9, 14.80, 'botella 70cl', 0.7, 21.14, 'Absolut'),
('Ron Bacardi blanco (70cl)',  15, 1, 9, 12.50, 'botella 70cl', 0.7, 17.86, 'Bacardi'),
('Whisky J&B (70cl)',          15, 1, 9, 15.80, 'botella 70cl', 0.7, 22.57, 'J&B'),
('Brandy Torres 10 (70cl)',    15, 1, 9, 13.20, 'botella 70cl', 0.7, 18.86, 'Torres'),
('Cointreau (70cl)',           15, 1, 9, 18.50, 'botella 70cl', 0.7, 26.43, 'Cointreau'),
('Amaretto Disaronno (70cl)',  15, 1, 9, 16.80, 'botella 70cl', 0.7, 24.00, 'Disaronno'),
('Vermut Martini rojo (1l)',   15, 1, 9, 9.80,  'botella 1l', 1, 9.80, 'Martini'),
('Licor 43 (70cl)',            15, 1, 9, 12.50, 'botella 70cl', 0.7, 17.86, 'Licor 43');

-- ============================================================
-- PRODUCTOS - ESPECIAS Y HIERBAS (cat_id=17)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l) VALUES
('Perejil fresco (manojo)',     17, 3, 6, 0.50, 'manojo', 1, NULL),
('Albahaca fresca (maceta)',    17, 3, 6, 1.80, 'maceta', 1, NULL),
('Romero fresco (kg)',          17, 3, 1, 5.50, 'kg', 1, 5.50),
('Tomillo seco (100g)',         17, 1, 6, 1.20, '100g', 0.1, 12.00),
('Orégano seco (kg)',           17, 1, 1, 8.50, 'kg', 1, 8.50),
('Laurel seco (100g)',          17, 1, 6, 0.80, '100g', 0.1, 8.00),
('Eneldo fresco (manojo)',      17, 3, 6, 1.20, 'manojo', 1, NULL),
('Cebollino fresco (manojo)',   17, 3, 6, 0.80, 'manojo', 1, NULL),
('Estragón seco (50g)',         17, 1, 6, 2.50, '50g', 0.05, 50.00),
('Ras el hanout (100g)',        17, 1, 6, 2.80, '100g', 0.1, 28.00);

-- ============================================================
-- PRODUCTOS - AZÚCAR Y REPOSTERÍA (cat_id=18)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca) VALUES
('Azúcar blanco (5kg)',        18, 1, 1, 4.50, '5kg', 5, 0.90, 'Aro'),
('Azúcar moreno (1kg)',        18, 1, 1, 1.80, 'kg', 1, 1.80, 'Aro'),
('Chocolate negro 70% (kg)',   18, 1, 1, 9.80, 'kg', 1, 9.80, 'Metro Chef'),
('Chocolate blanco (kg)',      18, 1, 1, 8.50, 'kg', 1, 8.50, 'Metro Chef'),
('Cacao en polvo (kg)',        18, 1, 1, 7.20, 'kg', 1, 7.20, 'Metro Chef'),
('Vainilla (vaina)',           18, 1, 6, 1.80, 'unidad', 1, NULL, NULL),
('Maicena almidón maíz (kg)', 18, 1, 1, 2.80, 'kg', 1, 2.80, 'Metro Chef'),
('Gelatina hojas (250g)',      18, 1, 6, 4.50, '250g', 0.25, 18.00, NULL),
('Agar-agar (100g)',           18, 1, 6, 3.80, '100g', 0.1, 38.00, NULL),
('Nata montada spray (250ml)', 18, 1, 4, 2.90, '250ml', 0.25, 11.60, NULL);

-- ============================================================
-- PRODUCTOS - CAFÉS E INFUSIONES (cat_id=19)
-- ============================================================
INSERT INTO productos (nombre, categoria_id, proveedor_id, unidad_id, precio_coste, unidad_compra, cantidad_compra, precio_kg_l, marca) VALUES
('Café molido mezcla (kg)',    19, 1, 1, 8.80, 'kg', 1, 8.80, 'Rioba'),
('Café grano 100% arabica',    19, 1, 1, 14.50, 'kg', 1, 14.50, 'Rioba'),
('Café descafeinado (kg)',     19, 1, 1, 10.80, 'kg', 1, 10.80, 'Rioba'),
('Té negro (caja 100 bolsas)', 19, 1, 8, 4.80, 'caja 100ud', 100, NULL, 'Rioba'),
('Té verde (caja 100 bolsas)', 19, 1, 8, 5.20, 'caja 100ud', 100, NULL, 'Rioba'),
('Infusión menta (caja 25)',   19, 1, 8, 2.80, 'caja 25ud', 25, NULL, NULL),
('Capuchino en polvo (kg)',    19, 1, 1, 12.50, 'kg', 1, 12.50, 'Rioba');

-- ============================================================
-- REGISTRO INICIAL DE PRECIOS (historial)
-- ============================================================
INSERT INTO historial_precios (producto_id, proveedor_id, precio, fuente)
SELECT id, proveedor_id, precio_coste, 'seed_inicial_2026-05' FROM productos;
