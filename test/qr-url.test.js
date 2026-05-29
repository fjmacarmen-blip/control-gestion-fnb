/**
 * Tests de la construcción de URL pública del QR.
 * No testeamos el SVG (requiere lib CDN) — solo la construcción de URL.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

// Réplica de buildPublicMenuUrl con location mock
function buildPublicMenuUrl(projectId, opts, location) {
  opts = opts || {};
  const origin = location.origin;
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isGhPages = location.host.endsWith('.github.io');
  const basePath = isGhPages && pathParts[0] ? '/' + pathParts[0] + '/' : '/';
  const targetPage = opts.page || 'carta-publica.html';
  return origin + basePath + targetPage + '?proyecto=' + encodeURIComponent(projectId);
}

test('QR URL · localhost raíz', () => {
  const loc = { origin: 'http://localhost:8000', host: 'localhost:8000', pathname: '/dashboard/editor.html' };
  const url = buildPublicMenuUrl('miramar', {}, loc);
  assert.equal(url, 'http://localhost:8000/carta-publica.html?proyecto=miramar');
});

test('QR URL · GitHub Pages bajo /<repo>/', () => {
  const loc = { origin: 'https://fjmacarmen-blip.github.io', host: 'fjmacarmen-blip.github.io', pathname: '/control-gestion-fnb/dashboard/' };
  const url = buildPublicMenuUrl('restaurante-casa-lola', {}, loc);
  assert.equal(url, 'https://fjmacarmen-blip.github.io/control-gestion-fnb/carta-publica.html?proyecto=restaurante-casa-lola');
});

test('QR URL · GitHub Pages user site (sin repo en path)', () => {
  const loc = { origin: 'https://example.github.io', host: 'example.github.io', pathname: '/' };
  const url = buildPublicMenuUrl('demo', {}, loc);
  // No hay primer path part → basePath '/'
  assert.equal(url, 'https://example.github.io/carta-publica.html?proyecto=demo');
});

test('QR URL · proyecto con caracteres que requieren encoding', () => {
  const loc = { origin: 'http://localhost', host: 'localhost', pathname: '/' };
  const url = buildPublicMenuUrl('hotel-rural', {}, loc);
  assert.ok(url.endsWith('?proyecto=hotel-rural'));
});

test('QR URL · custom page', () => {
  const loc = { origin: 'http://localhost', host: 'localhost', pathname: '/' };
  const url = buildPublicMenuUrl('miramar', { page: 'sala-movil.html' }, loc);
  assert.ok(url.includes('sala-movil.html?proyecto=miramar'));
});
