/**
 * Tests de detección de conflictos de disponibilidad · v5.6
 *
 * Reglas validadas:
 *  - Solo presupuestos con estado="confirmado" bloquean
 *  - Granularidad por día completo
 *  - Mismo espacio + misma fecha + confirmado → conflicto
 *  - Espacio distinto o estado borrador → libre
 */
const test = require('node:test');
const assert = require('node:assert/strict');

// Réplica local de las funciones de metrics.js (sin DOM)
function getBookingsForDateSpace(fechaISO, espacioId, budgets) {
  if (!fechaISO || !espacioId || !Array.isArray(budgets)) return [];
  return budgets.filter(b =>
    b && b.estado === 'confirmado' &&
    b.fechaEvento === fechaISO &&
    b.espacio === espacioId
  );
}
function isDayAvailable(fechaISO, espacioId, budgets) {
  return getBookingsForDateSpace(fechaISO, espacioId, budgets).length === 0;
}
function getOccupiedSpacesOnDate(fechaISO, budgets) {
  if (!fechaISO || !Array.isArray(budgets)) return [];
  const set = new Set();
  budgets.forEach(b => {
    if (b && b.estado === 'confirmado' && b.fechaEvento === fechaISO && b.espacio) set.add(b.espacio);
  });
  return [...set];
}
function getAlternativeSpacesOnDate(fechaISO, espaciosTodos, espacioExcluir, budgets) {
  const ocupados = getOccupiedSpacesOnDate(fechaISO, budgets);
  return espaciosTodos.filter(id => id !== espacioExcluir && !ocupados.includes(id));
}

const BUDGETS = [
  { ref: 'A', fechaEvento: '2026-06-15', espacio: 'salon', estado: 'confirmado' },
  { ref: 'B', fechaEvento: '2026-06-15', espacio: 'terraza', estado: 'confirmado' },
  { ref: 'C', fechaEvento: '2026-06-16', espacio: 'salon', estado: 'borrador' },
  { ref: 'D', fechaEvento: '2026-06-20', espacio: 'salon', estado: 'confirmado' },
];

test('mismo espacio + misma fecha confirmado → no disponible', () => {
  assert.equal(isDayAvailable('2026-06-15', 'salon', BUDGETS), false);
});

test('espacio distinto misma fecha → disponible', () => {
  assert.equal(isDayAvailable('2026-06-15', 'bodega', BUDGETS), true);
});

test('borrador NO bloquea (solo confirmados)', () => {
  assert.equal(isDayAvailable('2026-06-16', 'salon', BUDGETS), true);
});

test('fecha sin eventos → disponible', () => {
  assert.equal(isDayAvailable('2026-07-04', 'salon', BUDGETS), true);
});

test('getOccupiedSpacesOnDate cuenta solo confirmados', () => {
  const ocupados = getOccupiedSpacesOnDate('2026-06-15', BUDGETS);
  assert.deepEqual(ocupados.sort(), ['salon', 'terraza']);
});

test('borrador NO aparece en ocupados', () => {
  const ocupados = getOccupiedSpacesOnDate('2026-06-16', BUDGETS);
  assert.deepEqual(ocupados, []);
});

test('getAlternativeSpacesOnDate excluye el deseado y los ocupados', () => {
  const espacios = ['salon', 'terraza', 'bodega', 'chef_table'];
  const alts = getAlternativeSpacesOnDate('2026-06-15', espacios, 'salon', BUDGETS);
  assert.deepEqual(alts.sort(), ['bodega', 'chef_table']);
});

test('parámetros inválidos no rompen', () => {
  assert.equal(isDayAvailable(null, 'salon', BUDGETS), true);
  assert.equal(isDayAvailable('2026-06-15', null, BUDGETS), true);
  assert.equal(isDayAvailable('2026-06-15', 'salon', null), true);
  assert.deepEqual(getOccupiedSpacesOnDate(null, BUDGETS), []);
});
