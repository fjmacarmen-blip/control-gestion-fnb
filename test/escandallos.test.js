/**
 * Tests del módulo escandallos. Réplica local de las funciones pure
 * (sin DOM) para correr en Node.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

function parseQuantity(str) {
  if (!str) return { qty: 0, unit: 'ud' };
  const s = String(str).trim().toLowerCase().replace(',', '.');
  const m = s.match(/^([\d.]+)\s*([a-zA-Záéíóú]+)?/);
  if (!m) return { qty: 0, unit: 'ud' };
  const qty = parseFloat(m[1]) || 0;
  let unit = (m[2] || 'ud').replace(/[^a-z]/g, '');
  const map = {
    g: 'g', gr: 'g', gramo: 'g', gramos: 'g',
    kg: 'kg', kilo: 'kg', kilos: 'kg',
    ml: 'ml', mililitro: 'ml', mililitros: 'ml',
    l: 'l', litro: 'l', litros: 'l',
    ud: 'ud', uds: 'ud', unidad: 'ud', unidades: 'ud', u: 'ud', pza: 'ud', pieza: 'ud',
    cucharada: 'cda', cda: 'cda', diente: 'ud', dientes: 'ud',
    rama: 'ud', ramas: 'ud', hoja: 'ud', hojas: 'ud', rebanada: 'ud', rebanadas: 'ud',
  };
  if (unit === 'cl') return { qty: qty * 10, unit: 'ml' };
  unit = map[unit] || unit;
  return { qty, unit };
}

function normalizeToBase(qty, unit, prodUnit) {
  if (!unit || !prodUnit) return null;
  const u = unit.toLowerCase();
  const p = prodUnit.toLowerCase();
  if (u === p) return qty;
  if (u === 'g' && p === 'kg') return qty / 1000;
  if (u === 'kg' && p === 'g') return qty * 1000;
  if (u === 'ml' && p === 'l') return qty / 1000;
  if (u === 'l' && p === 'ml') return qty * 1000;
  if (u === 'ud' && p === 'ud') return qty;
  return null;
}

function suggestPVP(cost, targetPct) {
  if (!cost || !targetPct) return 0;
  return Math.round((cost / (targetPct / 100) + Number.EPSILON) * 100) / 100;
}

function escandalloPct(cost, pvp) {
  if (!pvp) return 0;
  return Math.round((cost / pvp) * 100 * 10) / 10;
}

// ── parseQuantity ─────────────────────────────────────────────
test('parseQuantity · 200g', () => {
  const r = parseQuantity('200g');
  assert.equal(r.qty, 200); assert.equal(r.unit, 'g');
});
test('parseQuantity · 1.5 kg con espacio', () => {
  const r = parseQuantity('1.5 kg');
  assert.equal(r.qty, 1.5); assert.equal(r.unit, 'kg');
});
test('parseQuantity · coma decimal española', () => {
  const r = parseQuantity('1,5kg');
  assert.equal(r.qty, 1.5); assert.equal(r.unit, 'kg');
});
test('parseQuantity · 2 unidades', () => {
  const r = parseQuantity('2 unidades');
  assert.equal(r.qty, 2); assert.equal(r.unit, 'ud');
});
test('parseQuantity · cl convierte a ml', () => {
  const r = parseQuantity('25cl');
  assert.equal(r.qty, 250); assert.equal(r.unit, 'ml');
});
test('parseQuantity · vacío', () => {
  const r = parseQuantity('');
  assert.equal(r.qty, 0);
});
test('parseQuantity · dientes → ud', () => {
  const r = parseQuantity('3 dientes');
  assert.equal(r.qty, 3); assert.equal(r.unit, 'ud');
});

// ── normalizeToBase ───────────────────────────────────────────
test('normalize · g a kg', () => assert.equal(normalizeToBase(500, 'g', 'kg'), 0.5));
test('normalize · kg a g', () => assert.equal(normalizeToBase(2, 'kg', 'g'), 2000));
test('normalize · ml a l', () => assert.equal(normalizeToBase(750, 'ml', 'l'), 0.75));
test('normalize · misma unidad', () => assert.equal(normalizeToBase(5, 'kg', 'kg'), 5));
test('normalize · incompatible (g vs ml)', () => assert.equal(normalizeToBase(100, 'g', 'ml'), null));
test('normalize · ud a ud', () => assert.equal(normalizeToBase(3, 'ud', 'ud'), 3));

// ── suggestPVP ────────────────────────────────────────────────
test('PVP · coste 5€ · target 25% → 20€', () => {
  assert.equal(suggestPVP(5, 25), 20);
});
test('PVP · coste 12€ · target 30% → 40€', () => {
  assert.equal(suggestPVP(12, 30), 40);
});
test('PVP · cost 0 → 0', () => assert.equal(suggestPVP(0, 30), 0));

// ── escandalloPct ─────────────────────────────────────────────
test('escandallo % · cost 5 PVP 25 = 20%', () => {
  assert.equal(escandalloPct(5, 25), 20);
});
test('escandallo % · PVP 0 → 0', () => {
  assert.equal(escandalloPct(5, 0), 0);
});
