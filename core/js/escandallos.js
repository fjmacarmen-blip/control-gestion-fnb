/**
 * Calculadora de escandallos · v5.0 plataforma F&B
 * --------------------------------------------------
 * Cruza recetas con catálogo de productos para calcular el coste real
 * de materia prima (MP) de cada plato, el escandallo (% coste / PVP),
 * el margen y el precio de venta recomendado.
 *
 * En hostelería el escandallo objetivo varía por categoría:
 *   Entrantes / Tapas         28-32%
 *   Principales (pescado)     30-35%
 *   Principales (carne)       32-38%
 *   Postres                   18-25%
 *   Cócteles / Coffee         15-22%
 *
 * Para que el cálculo funcione, las recetas necesitan:
 *   - ing: [['200g', 'Tomate pera', '...']] o similar
 *   - rac: nº de raciones (default 1)
 *
 * Y el catálogo productos.items necesita:
 *   - nombre, unidad, precio (precio por unidad base)
 *
 * El matching ingrediente → producto se hace por similitud de nombre,
 * con un score parecido al de autoMatchByFilename.
 *
 * API window.fnbEscandallos:
 *   parseQuantity(str)              "200g" → { qty: 200, unit: 'g' }
 *   normalizeToBase(qty, unit, prodUnit)  convierte g/kg, ml/L
 *   matchProducto(nombreIng, items) → { item, score } o null
 *   costRecipe(receta, items)       → { totalCost, perRation, items: [...], unmatched: [...] }
 *   suggestPVP(cost, targetPct)     → precio venta recomendado (sin IVA)
 *   ESCANDALLO_TARGET (constante de referencia)
 */
(function () {
  'use strict';

  // ── Targets por categoría (valores típicos del sector) ──────
  const ESCANDALLO_TARGET = {
    entremeses: 30,
    entrantes:  30,
    primeros:   33,
    segundos:   35,
    postres:    22,
    coctel:     20,
    default:    30,
  };

  // ── Parser de cantidad ─────────────────────────────────────
  /**
   * Convierte strings tipo "200g", "1.5kg", "750 ml", "2 unidades" en
   * { qty: Number, unit: 'g'|'kg'|'ml'|'l'|'ud' }.
   * Tolera coma decimal española y espacios opcionales.
   */
  function parseQuantity(str) {
    if (!str) return { qty: 0, unit: 'ud' };
    const s = String(str).trim().toLowerCase().replace(',', '.');
    const m = s.match(/^([\d.]+)\s*([a-zA-Záéíóú]+)?/);
    if (!m) return { qty: 0, unit: 'ud' };
    const qty = parseFloat(m[1]) || 0;
    let unit = (m[2] || 'ud').replace(/[^a-z]/g, '');
    // Normalizar unidades comunes
    const map = {
      g: 'g', gr: 'g', gramo: 'g', gramos: 'g',
      kg: 'kg', kilo: 'kg', kilos: 'kg',
      ml: 'ml', mililitro: 'ml', mililitros: 'ml', cl: 'ml',
      l: 'l', litro: 'l', litros: 'l',
      ud: 'ud', uds: 'ud', unidad: 'ud', unidades: 'ud', u: 'ud', pza: 'ud', pieza: 'ud',
      cucharada: 'cda', cda: 'cda', cucharadita: 'cdita', cdita: 'cdita',
      diente: 'ud', dientes: 'ud',
      rama: 'ud', ramas: 'ud', hoja: 'ud', hojas: 'ud', rebanada: 'ud', rebanadas: 'ud',
    };
    if (unit === 'cl') return { qty: qty * 10, unit: 'ml' }; // 1cl = 10ml
    unit = map[unit] || unit;
    return { qty, unit };
  }

  /**
   * Convierte (qty, unit) en la unidad del producto. Devuelve la cantidad
   * en unidad-producto o null si la conversión no es posible.
   *   200g → kg = 0.2
   *   1.5kg → kg = 1.5
   *   2L → ml NO mezclable con g/kg
   */
  function normalizeToBase(qty, unit, prodUnit) {
    if (!unit || !prodUnit) return null;
    const u = unit.toLowerCase();
    const p = prodUnit.toLowerCase();
    if (u === p) return qty;
    // Masa
    if (u === 'g' && p === 'kg') return qty / 1000;
    if (u === 'kg' && p === 'g') return qty * 1000;
    // Volumen
    if (u === 'ml' && p === 'l') return qty / 1000;
    if (u === 'l' && p === 'ml') return qty * 1000;
    // Unidades · 1 ud = 1 ud
    if (u === 'ud' && p === 'ud') return qty;
    return null; // No mezclamos masa con volumen, etc.
  }

  // ── Matching ingrediente → producto ────────────────────────
  /**
   * Normaliza un string para comparación (sin acentos, lowercase, sin
   * caracteres especiales pero conservando espacios para tokens).
   */
  function norm(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s_-]/g, '');
  }
  const STOP = new Set(['de', 'la', 'el', 'los', 'las', 'al', 'a', 'y', 'o', 'en', 'con', 'del', 'sin', 'para']);

  function tokensSig(s) {
    return norm(s).split(/[\s_-]+/).filter(t => t.length > 2 && !STOP.has(t));
  }

  function matchProducto(nombreIng, items) {
    if (!nombreIng || !items || !items.length) return null;
    const target = tokensSig(nombreIng);
    if (!target.length) return null;
    const targetFlat = norm(nombreIng).replace(/\s+/g, '');

    let best = null;
    let bestScore = 0;
    items.forEach(it => {
      const name = it.nombre || it.name || '';
      const nameFlat = norm(name).replace(/\s+/g, '');
      const nameTokens = tokensSig(name);
      if (!nameFlat) return;
      let score = 0;
      if (targetFlat === nameFlat) score = 100;
      else if (targetFlat.includes(nameFlat) || nameFlat.includes(targetFlat)) score = 75;
      else {
        const nSet = new Set(nameTokens);
        const overlap = target.filter(t => nSet.has(t));
        if (overlap.length) score = Math.min(70, overlap.length * 30);
      }
      if (score > bestScore) { bestScore = score; best = { item: it, score }; }
    });
    return bestScore >= 30 ? best : null;
  }

  // ── Coste por receta ───────────────────────────────────────
  /**
   * Recibe una receta y el catálogo productos.items.
   * Retorna desglose por ingrediente + total + perRación.
   *
   * Estructura del ing en receta: [cantidad_str, nombre, nota?]
   * O [{qty, unit, nombre}] si está estructurado.
   */
  function costRecipe(receta, items) {
    const raciones = Number(receta.rac) || 1;
    const ingredientes = receta.ing || [];
    const detalle = [];
    const noMatch = [];
    let totalCost = 0;

    ingredientes.forEach((row, idx) => {
      let qtyStr, nombre;
      if (Array.isArray(row)) { [qtyStr, nombre] = row; }
      else if (row && typeof row === 'object') {
        qtyStr = (row.qty != null ? row.qty + (row.unit || '') : '');
        nombre = row.nombre || row.name || '';
      } else {
        return;
      }
      const parsed = parseQuantity(qtyStr);
      const m = matchProducto(nombre, items);
      if (!m) {
        noMatch.push({ idx, nombre, qtyStr });
        detalle.push({ idx, nombre, qtyStr, matched: false, cost: 0 });
        return;
      }
      const prodPrice = Number(m.item.precio) || 0;
      const prodUnit = (m.item.unidad || '').toLowerCase();
      const qtyInProdUnits = normalizeToBase(parsed.qty, parsed.unit, prodUnit);
      if (qtyInProdUnits == null) {
        // Unidades no convertibles, asumimos misma → coste 0
        detalle.push({ idx, nombre, qtyStr, matched: true, product: m.item, cost: 0, error: 'Unidades incompatibles (' + parsed.unit + ' vs ' + prodUnit + ')' });
        return;
      }
      const cost = qtyInProdUnits * prodPrice;
      totalCost += cost;
      detalle.push({
        idx, nombre, qtyStr,
        matched: true,
        product: m.item,
        score: m.score,
        qtyInProdUnits,
        unitPrice: prodPrice,
        cost,
      });
    });

    return {
      totalCost: round2(totalCost),
      perRation: round2(raciones ? totalCost / raciones : totalCost),
      raciones,
      items: detalle,
      unmatched: noMatch,
      coverage: ingredientes.length ? Math.round(((ingredientes.length - noMatch.length) / ingredientes.length) * 100) : 0,
    };
  }

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  // ── PVP recomendado ────────────────────────────────────────
  /**
   * Dado el coste y un % escandallo objetivo, calcula PVP sin IVA.
   *   PVP = coste / (target / 100)
   * @param {number} cost      Coste materia prima del plato
   * @param {number} targetPct % escandallo deseado (25 = 25%)
   */
  function suggestPVP(cost, targetPct) {
    if (!cost || !targetPct) return 0;
    return round2(cost / (targetPct / 100));
  }

  function escandalloPct(cost, pvp) {
    if (!pvp) return 0;
    return Math.round((cost / pvp) * 100 * 10) / 10;
  }

  function targetForCategory(cat) {
    if (!cat) return ESCANDALLO_TARGET.default;
    return ESCANDALLO_TARGET[String(cat).toLowerCase()] || ESCANDALLO_TARGET.default;
  }

  /**
   * Aplica costRecipe a todas las recetas de un proyecto.
   * Resume coste medio, PVP recomendado y % cobertura.
   */
  function summarizeProject(recetasJson, productosItems) {
    const categorias = recetasJson && recetasJson.categorias || {};
    const out = { categorias: {}, total: { recetas: 0, costeTotal: 0, sinMatch: 0 } };
    Object.entries(categorias).forEach(([cat, arr]) => {
      const target = targetForCategory(cat);
      const list = (arr || []).map(r => {
        const c = costRecipe(r, productosItems);
        return {
          n: r.n,
          ...c,
          target,
          pvpSugerido: suggestPVP(c.perRation, target),
          mpDeclarado: r.mp,
        };
      });
      out.categorias[cat] = { target, recetas: list };
      out.total.recetas += list.length;
      out.total.costeTotal += list.reduce((a, r) => a + r.perRation, 0);
      out.total.sinMatch += list.reduce((a, r) => a + r.unmatched.length, 0);
    });
    out.total.costeMedio = out.total.recetas ? round2(out.total.costeTotal / out.total.recetas) : 0;
    return out;
  }

  window.fnbEscandallos = {
    parseQuantity,
    normalizeToBase,
    matchProducto,
    costRecipe,
    summarizeProject,
    suggestPVP,
    escandalloPct,
    targetForCategory,
    ESCANDALLO_TARGET,
  };
})();
