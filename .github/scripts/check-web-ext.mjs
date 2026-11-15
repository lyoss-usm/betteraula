#!/usr/bin/env node
/**
 * Compara la salida JSON de `web-ext lint` con la línea base de
 * .github/security/web-ext-baseline.json.
 *
 * Falla con cualquier error, o si algún (archivo, código) tiene más warnings
 * que los registrados en la línea base.
 *
 * Uso: node check-web-ext.mjs <lint.json> <baseline.json>
 */
import { readFileSync } from 'node:fs';

const [lintPath, baselinePath] = process.argv.slice(2);
if (!lintPath || !baselinePath) {
  console.error('Uso: node check-web-ext.mjs <lint.json> <baseline.json>');
  process.exit(2);
}

const lint = JSON.parse(readFileSync(lintPath, 'utf8'));
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')).warnings || {};

const annotate = (level, m) =>
  console.log(`::${level} file=${m.file || 'manifest.json'}${m.line ? `,line=${m.line}` : ''}::${m.code}: ${m.message}`);

let failed = false;

for (const e of lint.errors || []) {
  annotate('error', e);
  failed = true;
}

const counts = {};
for (const w of lint.warnings || []) {
  const file = w.file || 'manifest.json';
  counts[file] = counts[file] || {};
  counts[file][w.code] = (counts[file][w.code] || 0) + 1;
}

for (const w of lint.warnings || []) {
  const file = w.file || 'manifest.json';
  const allowed = (baseline[file] && baseline[file][w.code]) || 0;
  annotate(counts[file][w.code] > allowed ? 'error' : 'warning', w);
}

for (const [file, codes] of Object.entries(counts)) {
  for (const [code, n] of Object.entries(codes)) {
    const allowed = (baseline[file] && baseline[file][code]) || 0;
    if (n > allowed) {
      console.log(`${file}: ${code} aparece ${n} vez/veces (línea base: ${allowed}).`);
      failed = true;
    }
  }
}

const s = lint.summary || {};
console.log(`\nweb-ext lint: ${s.errors || 0} errores, ${s.warnings || 0} warnings, ${s.notices || 0} avisos.`);
if (failed) {
  console.log('Hay errores o warnings nuevos respecto de la línea base.');
  process.exit(1);
}
console.log('Sin warnings nuevos respecto de la línea base.');
