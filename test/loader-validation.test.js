/**
 * Tests de validación del loader: regex de ID y validateSection.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const VALID_ID_RE = /^[a-z0-9_-]+$/;
const VALID_THEMES = ['navy-boutique', 'mediterraneo', 'tipico-andaluz', 'moderno-minimalista', 'cercano-rustico'];

test('ID válido: miramar', () => assert.ok(VALID_ID_RE.test('miramar')));
test('ID válido: restaurante-casa-lola', () => assert.ok(VALID_ID_RE.test('restaurante-casa-lola')));
test('ID válido con underscore', () => assert.ok(VALID_ID_RE.test('hotel_madrid_01')));

test('ID inválido: path traversal', () => assert.ok(!VALID_ID_RE.test('../foo')));
test('ID inválido: con barra', () => assert.ok(!VALID_ID_RE.test('foo/bar')));
test('ID inválido: mayúsculas', () => assert.ok(!VALID_ID_RE.test('Miramar')));
test('ID inválido: con punto', () => assert.ok(!VALID_ID_RE.test('foo.bar')));
test('ID inválido: con espacios', () => assert.ok(!VALID_ID_RE.test('hotel madrid')));
test('ID inválido: con $', () => assert.ok(!VALID_ID_RE.test('hotel$')));
test('ID inválido: vacío', () => assert.ok(!VALID_ID_RE.test('')));

// validateSection · config tema whitelist
function validateConfigTheme(data) {
  const errors = [];
  if (data.tema != null && !VALID_THEMES.includes(data.tema)) {
    errors.push('tema inválido');
  }
  return errors;
}

test('tema válido: mediterraneo', () => assert.deepEqual(validateConfigTheme({ tema: 'mediterraneo' }), []));
test('tema válido: ausente (null)', () => assert.deepEqual(validateConfigTheme({}), []));
test('tema inválido: random', () => assert.ok(validateConfigTheme({ tema: 'pastel' }).length > 0));
test('tema inválido: XSS attempt', () => assert.ok(validateConfigTheme({ tema: '<script>' }).length > 0));
