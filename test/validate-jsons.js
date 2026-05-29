#!/usr/bin/env node
/**
 * Validador de JSONs del repo. Falla si alguno no parsea o si los
 * proyectos carecen de los archivos mínimos.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_PROJECT_FILES = [
  'config.json', 'establecimiento.json', 'menus.json',
  'recetas.json', 'eventos.json', 'dietas.json', 'productos.json',
  'auth.json', 'bebidas.json', 'extras.json',
];

let errors = 0;
function fail(msg) { console.error('  ✗', msg); errors++; }
function ok(msg) { console.log('  ✓', msg); }

function walkJson(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name === 'node_modules' || f.name === '.git') continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...walkJson(p));
    else if (f.name.endsWith('.json')) out.push(p);
  }
  return out;
}

console.log('1) Todos los .json del repo parsean correctamente:');
const allJsons = walkJson(ROOT);
let parseFail = 0;
for (const file of allJsons) {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail(path.relative(ROOT, file) + ' · ' + e.message);
    parseFail++;
  }
}
if (parseFail === 0) ok(allJsons.length + ' archivos OK');

console.log('\n2) Cada proyecto en projects/ tiene los archivos mínimos:');
const projectsDir = path.join(ROOT, 'projects');
for (const entry of fs.readdirSync(projectsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const projDir = path.join(projectsDir, entry.name);
  const missing = REQUIRED_PROJECT_FILES.filter(f => !fs.existsSync(path.join(projDir, f)));
  if (missing.length) fail(entry.name + ' · falta ' + missing.join(', '));
  else ok(entry.name);
}

console.log('\n3) projects/index.json contiene proyectos válidos:');
const idx = JSON.parse(fs.readFileSync(path.join(projectsDir, 'index.json'), 'utf8'));
for (const p of idx.proyectos || []) {
  if (!/^[a-z0-9_-]+$/.test(p.id)) fail('id "' + p.id + '" no cumple regex');
  else if (!fs.existsSync(path.join(projectsDir, p.id))) fail('id "' + p.id + '" no existe como carpeta');
  else ok(p.id);
}

console.log('\n4) productos.json cumple ADR 012 (source presente):');
for (const entry of fs.readdirSync(projectsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const f = path.join(projectsDir, entry.name, 'productos.json');
  if (!fs.existsSync(f)) continue;
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (!data.source || !data.source.type) fail(entry.name + '/productos.json · sin source.type (ADR 012)');
  else ok(entry.name + ' · source.type=' + data.source.type);
}

if (errors > 0) {
  console.error('\n' + errors + ' error(es) · falla el CI');
  process.exit(1);
}
console.log('\n✓ Todos los chequeos JSON OK');
