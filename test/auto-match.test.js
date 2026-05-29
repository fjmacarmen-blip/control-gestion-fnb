/**
 * Test del auto-match por nombre de archivo de importer-images.js.
 * Replicamos la función localmente (mismo código, sin DOM) para correr
 * en Node sin navegador.
 *
 * Bug histórico: el normalize destruía dashes ANTES de tokenizar, así
 * que "tarta-queso.jpg" no matcheaba con "Tarta de Queso La Viña".
 * Este test bloquea regresiones.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

function autoMatchByFilename(filename, items, getNameFn) {
  const normalizeKeepSep = s => (s || '').toString().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s_-]/g, '');
  const tokensOf = s => normalizeKeepSep(s).split(/[\s_-]+/).filter(t => t.length > 0);
  const flatten = s => normalizeKeepSep(s).replace(/[\s_-]/g, '');

  const targetTokens = tokensOf(filename.replace(/\.[^.]+$/, ''));
  const targetFlat = flatten(filename.replace(/\.[^.]+$/, ''));
  if (!targetFlat) return null;
  const STOP = new Set(['de', 'la', 'el', 'los', 'las', 'al', 'a', 'y', 'o', 'en', 'con', 'del']);

  let best = null;
  let bestScore = 0;
  items.forEach((it, idx) => {
    const name = getNameFn ? getNameFn(it) : (it.n || it.nombre || it.name || '');
    const nameFlat = flatten(name);
    const nameTokens = tokensOf(name).filter(t => !STOP.has(t));
    if (!nameFlat) return;
    let score = 0;
    if (targetFlat === nameFlat) score = 100;
    else if (targetFlat.includes(nameFlat) || nameFlat.includes(targetFlat)) score = 80;
    else {
      const tTokens = targetTokens.filter(t => !STOP.has(t) && t.length > 2);
      const nSet = new Set(nameTokens.filter(t => t.length > 2));
      const overlap = tTokens.filter(t => nSet.has(t));
      if (overlap.length) score = Math.min(80, overlap.length * 25);
    }
    if (score > bestScore) { bestScore = score; best = { item: it, idx, score }; }
  });
  if (bestScore < 30) return null;
  return best;
}

const ITEMS = [
  { n: 'Tarta de Queso La Viña' },
  { n: 'Salmorejo Cordobés' },
  { n: 'Solomillo a la Rioja' },
  { n: 'Gazpacho Andaluz' },
  { n: 'Paella Valenciana' },
  { n: 'Coulant de Chocolate' },
];

test('match exacto plano', () => {
  const r = autoMatchByFilename('tartadequeso.jpg', ITEMS);
  assert.equal(r.item.n, 'Tarta de Queso La Viña');
  assert.ok(r.score >= 80);
});

test('match con dashes (regresión bug v4.13)', () => {
  const r = autoMatchByFilename('tarta-queso.jpg', ITEMS);
  assert.equal(r.item.n, 'Tarta de Queso La Viña');
});

test('match con underscores', () => {
  const r = autoMatchByFilename('salmorejo_cordobes.jpg', ITEMS);
  assert.equal(r.item.n, 'Salmorejo Cordobés');
});

test('match con espacios', () => {
  const r = autoMatchByFilename('paella valenciana.jpeg', ITEMS);
  assert.equal(r.item.n, 'Paella Valenciana');
});

test('match con acentos en el filename', () => {
  const r = autoMatchByFilename('salmorejo-cordobés.jpg', ITEMS);
  assert.equal(r.item.n, 'Salmorejo Cordobés');
});

test('match con stopwords ignoradas', () => {
  const r = autoMatchByFilename('coulant-de-chocolate.jpg', ITEMS);
  assert.equal(r.item.n, 'Coulant de Chocolate');
});

test('no-match con score insuficiente', () => {
  const r = autoMatchByFilename('xyz-random.jpg', ITEMS);
  assert.equal(r, null);
});

test('match parcial con varios tokens compartidos', () => {
  // 'tarta' + 'queso' coinciden con "Tarta de Queso La Viña" → score 50
  const r = autoMatchByFilename('tarta-queso-clasica.jpg', ITEMS);
  assert.equal(r.item.n, 'Tarta de Queso La Viña');
});

test('no-match cuando solo 1 token corto coincide', () => {
  // 1 token solo → score 25 < threshold 30 → null
  const r = autoMatchByFilename('paella-frita-ferraura.jpg',
    [{ n: 'Otra cosa sin paella en absoluto' }]);
  assert.equal(r, null);
});
