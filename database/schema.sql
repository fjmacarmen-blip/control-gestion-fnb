-- ============================================================
-- CONTROL GESTIÓN F&B - ESQUEMA DE BASE DE DATOS
-- Version: 1.0 | Fecha: 2026-05-22
-- Motor: SQLite 3
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ============================================================
-- PROVEEDORES
-- ============================================================
CREATE TABLE IF NOT EXISTS proveedores (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL,
    tipo            TEXT NOT NULL CHECK(tipo IN ('central_compras','distribuidor','mayorista','local','online')),
    ciudad          TEXT,
    telefono        TEXT,
    email           TEXT,
    web             TEXT,
    url_catalogo    TEXT,
    activo          INTEGER DEFAULT 1,
    notas           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CATEGORÍAS DE PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL UNIQUE,
    nombre_corto    TEXT,
    parent_id       INTEGER REFERENCES categorias(id),
    icono           TEXT,
    orden           INTEGER DEFAULT 0,
    activa          INTEGER DEFAULT 1
);

-- ============================================================
-- UNIDADES DE MEDIDA
-- ============================================================
CREATE TABLE IF NOT EXISTS unidades_medida (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL UNIQUE,  -- kilogramo, litro, unidad, docena...
    abreviatura     TEXT NOT NULL UNIQUE,  -- kg, l, ud, doc...
    tipo            TEXT CHECK(tipo IN ('peso','volumen','unidad','longitud'))
);

-- ============================================================
-- PRODUCTOS (INGREDIENTES / MATERIAS PRIMAS)
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL,
    nombre_comercial TEXT,
    categoria_id    INTEGER NOT NULL REFERENCES categorias(id),
    proveedor_id    INTEGER REFERENCES proveedores(id),
    unidad_id       INTEGER NOT NULL REFERENCES unidades_medida(id),

    -- Precio actual
    precio_coste    REAL NOT NULL DEFAULT 0,        -- EUR por unidad de compra
    unidad_compra   TEXT,                           -- "caja 5kg", "botella 75cl", etc.
    cantidad_compra REAL DEFAULT 1,                 -- cantidad en la unidad de compra
    precio_kg_l     REAL,                           -- precio normalizado por kg o litro

    -- Metadatos
    codigo_proveedor TEXT,
    ean             TEXT,
    url_referencia  TEXT,                           -- URL en Makro/Bedoya para actualizar

    -- Control calidad
    marca           TEXT,
    origen          TEXT,                           -- España, Italia, etc.
    denominacion    TEXT,                           -- DO Málaga, IGP, etc.
    alergenos       TEXT,                           -- JSON: ["gluten","lactosa"...]
    sin_gluten      INTEGER DEFAULT 0,
    ecologico       INTEGER DEFAULT 0,

    -- Estado
    activo          INTEGER DEFAULT 1,
    temporada       TEXT,                           -- NULL=todo el año, "verano","invierno"
    notas           TEXT,

    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- HISTORIAL DE PRECIOS (AUTOACTUALIZABLE)
-- ============================================================
CREATE TABLE IF NOT EXISTS historial_precios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id     INTEGER NOT NULL REFERENCES productos(id),
    proveedor_id    INTEGER REFERENCES proveedores(id),
    precio          REAL NOT NULL,
    precio_kg_l     REAL,
    fecha           DATE NOT NULL DEFAULT (DATE('now')),
    fuente          TEXT,                           -- 'makro_web','bedoya_web','manual','api'
    notas           TEXT
);

-- ============================================================
-- RECETAS
-- ============================================================
CREATE TABLE IF NOT EXISTS recetas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL,
    descripcion     TEXT,
    categoria       TEXT,                           -- 'entrante','principal','postre','bebida'...
    tipo_cocina     TEXT,                           -- 'española','italiana','fusion'...

    -- Rendimiento
    raciones        INTEGER DEFAULT 1,             -- pax que produce esta receta
    peso_racion_g   REAL,                          -- gramos por ración

    -- Tiempo
    tiempo_prep_min INTEGER,
    tiempo_coccion_min INTEGER,
    dificultad      TEXT CHECK(dificultad IN ('baja','media','alta')),

    -- Control
    activa          INTEGER DEFAULT 1,
    temporada       TEXT,
    notas           TEXT,
    imagen_url      TEXT,

    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INGREDIENTES DE RECETA
-- ============================================================
CREATE TABLE IF NOT EXISTS ingredientes_receta (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    receta_id       INTEGER NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
    producto_id     INTEGER NOT NULL REFERENCES productos(id),

    cantidad        REAL NOT NULL,                 -- cantidad en unidad_id del producto
    unidad_id       INTEGER NOT NULL REFERENCES unidades_medida(id),

    -- Mermas
    merma_pct       REAL DEFAULT 0 CHECK(merma_pct >= 0 AND merma_pct < 100),
    cantidad_bruta  REAL GENERATED ALWAYS AS     -- cantidad antes de merma
                    (cantidad / (1 - merma_pct/100.0)) STORED,

    -- Opcional
    opcional        INTEGER DEFAULT 0,
    notas           TEXT,                          -- "brunoise", "al punto", "a temperatura ambiente"
    orden           INTEGER DEFAULT 0
);

-- ============================================================
-- ESCANDALLOS (COSTE TOTAL POR PLATO)
-- ============================================================
CREATE TABLE IF NOT EXISTS escandallos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    receta_id       INTEGER NOT NULL REFERENCES recetas(id),
    nombre          TEXT,                          -- puede ser diferente a la receta

    -- Costes materia prima (calculados)
    coste_mp        REAL,                          -- coste ingredientes por ración

    -- Costes adicionales
    coste_personal  REAL DEFAULT 0,               -- EUR por ración (tiempo x coste/hora)
    coste_energia   REAL DEFAULT 0,               -- EUR por ración (gas, luz)
    coste_mermas    REAL DEFAULT 0,               -- % mermas adicionales globales
    coste_indirecto REAL DEFAULT 0,               -- % costes indirectos
    otros_costes    REAL DEFAULT 0,

    -- Costes totales
    coste_total     REAL,                          -- suma de todos
    food_cost_pct   REAL,                          -- % food cost objetivo (ej: 28)

    -- PVP
    pvp_calculado   REAL,                          -- coste_mp / (food_cost_pct/100)
    pvp_sugerido    REAL,                          -- pvp_calculado redondeado
    pvp_real        REAL,                          -- el que finalmente se pone en carta

    -- Márgenes
    margen_bruto    REAL,                          -- pvp_real - coste_total
    margen_pct      REAL,                          -- (pvp_real - coste_total) / pvp_real * 100

    -- Control
    fecha_calculo   DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo          INTEGER DEFAULT 1,
    notas           TEXT
);

-- ============================================================
-- MENÚS (AGRUPACIÓN DE PLATOS)
-- ============================================================
CREATE TABLE IF NOT EXISTS menus (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL,
    descripcion     TEXT,
    tipo            TEXT,                          -- 'diario','degustacion','evento','carta'
    temporada       TEXT,
    activo          INTEGER DEFAULT 1,
    notas           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_platos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_id         INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    receta_id       INTEGER NOT NULL REFERENCES recetas(id),
    seccion         TEXT,                          -- 'entrantes','principales','postres'
    pvp_menu        REAL,                          -- precio en este menú (puede diferir del escandallo)
    orden           INTEGER DEFAULT 0
);

-- ============================================================
-- PRESUPUESTOS PARA CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS presupuestos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    referencia      TEXT UNIQUE,                   -- 'PRES-2026-001'
    cliente_nombre  TEXT,
    cliente_email   TEXT,
    cliente_tel     TEXT,
    evento          TEXT,                          -- 'boda','comunion','empresa'...
    fecha_evento    DATE,
    num_pax         INTEGER,

    -- Totales
    subtotal        REAL,
    iva_pct         REAL DEFAULT 10,
    iva_importe     REAL,
    total           REAL,

    -- Estado
    estado          TEXT DEFAULT 'borrador' CHECK(estado IN ('borrador','enviado','aceptado','rechazado','facturado')),
    notas           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS presupuesto_lineas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    presupuesto_id  INTEGER NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
    receta_id       INTEGER REFERENCES recetas(id),
    descripcion     TEXT NOT NULL,
    cantidad        INTEGER DEFAULT 1,
    precio_unitario REAL NOT NULL,
    descuento_pct   REAL DEFAULT 0,
    subtotal        REAL GENERATED ALWAYS AS
                    (cantidad * precio_unitario * (1 - descuento_pct/100.0)) STORED,
    orden           INTEGER DEFAULT 0
);

-- ============================================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_proveedor ON productos(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_historial_producto ON historial_precios(producto_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ingredientes_receta ON ingredientes_receta(receta_id);
CREATE INDEX IF NOT EXISTS idx_ingredientes_producto ON ingredientes_receta(producto_id);
CREATE INDEX IF NOT EXISTS idx_escandallos_receta ON escandallos(receta_id);

-- ============================================================
-- TRIGGERS: actualizar updated_at automáticamente
-- ============================================================
CREATE TRIGGER IF NOT EXISTS trg_productos_updated
    AFTER UPDATE ON productos
    BEGIN UPDATE productos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_recetas_updated
    AFTER UPDATE ON recetas
    BEGIN UPDATE recetas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

-- ============================================================
-- TRIGGER: registrar historial al cambiar precio
-- ============================================================
CREATE TRIGGER IF NOT EXISTS trg_precio_changed
    AFTER UPDATE OF precio_coste ON productos
    WHEN OLD.precio_coste != NEW.precio_coste
    BEGIN
        INSERT INTO historial_precios (producto_id, proveedor_id, precio, precio_kg_l, fuente)
        VALUES (NEW.id, NEW.proveedor_id, NEW.precio_coste, NEW.precio_kg_l, 'actualizacion_auto');
    END;

-- ============================================================
-- VISTA: COSTE ACTUAL DE RECETAS
-- ============================================================
CREATE VIEW IF NOT EXISTS v_coste_recetas AS
SELECT
    r.id AS receta_id,
    r.nombre AS receta,
    r.raciones,
    ROUND(SUM(
        (ir.cantidad_bruta / (
            SELECT cantidad_compra FROM productos WHERE id = ir.producto_id
        )) * (
            SELECT precio_coste FROM productos WHERE id = ir.producto_id
        )
    ), 4) AS coste_mp_total,
    ROUND(SUM(
        (ir.cantidad_bruta / (
            SELECT cantidad_compra FROM productos WHERE id = ir.producto_id
        )) * (
            SELECT precio_coste FROM productos WHERE id = ir.producto_id
        )
    ) / r.raciones, 4) AS coste_mp_racion
FROM recetas r
JOIN ingredientes_receta ir ON ir.receta_id = r.id
GROUP BY r.id, r.nombre, r.raciones;

-- ============================================================
-- VISTA: ESCANDALLO COMPLETO
-- ============================================================
CREATE VIEW IF NOT EXISTS v_escandallo_completo AS
SELECT
    e.id AS escandallo_id,
    r.nombre AS plato,
    e.coste_mp,
    e.coste_personal,
    e.coste_energia,
    e.coste_indirecto,
    e.otros_costes,
    e.coste_total,
    e.food_cost_pct AS 'food_cost_%',
    e.pvp_calculado,
    e.pvp_sugerido,
    e.pvp_real,
    ROUND(e.margen_bruto, 2) AS margen_eur,
    ROUND(e.margen_pct, 1) AS 'margen_%',
    e.fecha_calculo
FROM escandallos e
JOIN recetas r ON r.id = e.receta_id
WHERE e.activo = 1;
