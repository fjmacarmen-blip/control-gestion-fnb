/**
 * Tests del helper escapeText añadido en v4.15 (cierre auditoría C3).
 * Réplica local de la función para verificación en Node.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

function escapeText(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

test('null y undefined → string vacío', () => {
  assert.equal(escapeText(null), '');
  assert.equal(escapeText(undefined), '');
});

test('texto plano sin caracteres especiales', () => {
  assert.equal(escapeText('Hola mundo'), 'Hola mundo');
});

test('escapa < y >', () => {
  assert.equal(escapeText('<script>'), '&lt;script&gt;');
});

test('escapa comillas dobles', () => {
  assert.equal(escapeText('say "hi"'), 'say &quot;hi&quot;');
});

test('escapa comilla simple', () => {
  assert.equal(escapeText("it's"), 'it&#39;s');
});

test('escapa ampersand primero (evita doble escape)', () => {
  assert.equal(escapeText('A & B'), 'A &amp; B');
  assert.equal(escapeText('A &amp; B'), 'A &amp;amp; B');
});

test('XSS payload típico se neutraliza', () => {
  const payload = '<img src=x onerror=alert(1)>';
  const escaped = escapeText(payload);
  assert.ok(!escaped.includes('<img'));
  assert.ok(escaped.startsWith('&lt;img'));
});

test('convierte números a string', () => {
  assert.equal(escapeText(42), '42');
  assert.equal(escapeText(0), '0');
});
