#!/usr/bin/env node
/**
 * Smoke check de la cobertura de seguridad de los HTMLs del dashboard:
 *   - CSP meta presente
 *   - SRI + crossorigin en cada <script src="https://cdn.jsdelivr...">
 *
 * Bloquea regresiones del cierre v4.15 (auditoría C1 + C2).
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const HTML_FILES = [
  'dashboard/index.html',
  'dashboard/editor.html',
  'dashboard/wizard.html',
  'dashboard/metricas.html',
  'index.html',
];

let errors = 0;
function fail(msg) { console.error('  ✗', msg); errors++; }
function ok(msg) { console.log('  ✓', msg); }

console.log('1) Meta CSP presente en HTMLs principales:');
for (const rel of HTML_FILES) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (!/http-equiv="Content-Security-Policy"/i.test(html)) {
    fail(rel + ' · sin meta CSP');
  } else if (!/frame-ancestors/.test(html)) {
    fail(rel + ' · CSP sin frame-ancestors');
  } else {
    ok(rel);
  }
}

console.log('\n2) Meta description + Open Graph en index.html:');
const landing = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const REQUIRED_META = ['name="description"', 'og:title', 'og:description', 'twitter:card'];
for (const tag of REQUIRED_META) {
  if (landing.includes(tag)) ok(tag);
  else fail('falta ' + tag);
}

console.log('\n3) Scripts CDN con integrity + crossorigin:');
const SCRIPT_HTML_FILES = [
  ...HTML_FILES,
  'scripts/change-password.html',
];
const CDN_RE = /<script[^>]+src="(https:\/\/cdn\.jsdelivr\.net\/[^"]+)"([^>]*)>/g;
for (const rel of SCRIPT_HTML_FILES) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  let m;
  CDN_RE.lastIndex = 0;
  while ((m = CDN_RE.exec(html)) !== null) {
    const src = m[1];
    const attrs = m[2];
    if (!/\bintegrity=/.test(attrs)) fail(rel + ' · script sin integrity: ' + src);
    else if (!/\bcrossorigin=/.test(attrs)) fail(rel + ' · script sin crossorigin: ' + src);
    else ok(rel + ' · ' + src.split('/').slice(-2).join('/'));
  }
}

if (errors > 0) {
  console.error('\n' + errors + ' error(es) · falla el CI');
  process.exit(1);
}
console.log('\n✓ Todos los chequeos de seguridad OK');
