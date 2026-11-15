#!/usr/bin/env node
/**
 * Verifica que manifest.json no amplíe la superficie de la extensión más allá
 * de .github/security/manifest-allowlist.json.
 *
 * Uso: node check-manifest.mjs <directorio-de-la-extension> <allowlist.json>
 *
 * Solo lee archivos como datos: no ejecuta nada del directorio revisado.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const [srcDir, allowlistPath] = process.argv.slice(2);
if (!srcDir || !allowlistPath) {
  console.error('Uso: node check-manifest.mjs <dir> <allowlist.json>');
  process.exit(2);
}

const allow = JSON.parse(readFileSync(allowlistPath, 'utf8'));
let manifest;
try {
  manifest = JSON.parse(readFileSync(join(srcDir, 'manifest.json'), 'utf8'));
} catch (e) {
  console.error(`::error file=manifest.json::No se pudo leer manifest.json: ${e.message}`);
  process.exit(1);
}

const problems = [];
const fail = (msg) => problems.push(msg);
const asArray = (v) => (Array.isArray(v) ? v : v === undefined ? [] : [v]);
const extra = (list, allowed) => asArray(list).filter((x) => !allowed.includes(x));

/* Archivo local de la extensión: ruta relativa, sin "..", fuera de .github */
const LOCAL_FILE = /^(?!\.github\/)(?!.*\.\.)[\w-][\w./-]*$/;
function checkLocalFile(path, ext, where) {
  if (typeof path !== 'string' || !LOCAL_FILE.test(path) || !path.endsWith(ext)) {
    fail(`${where}: "${path}" debe ser un archivo ${ext} local de la extensión.`);
  }
}

// 1. Versión del manifest (MV2 permite código remoto)
if (manifest.manifest_version !== allow.manifest_version) {
  fail(`manifest_version debe ser ${allow.manifest_version} (es ${manifest.manifest_version}).`);
}

// 2. Claves de primer nivel: cualquier clave nueva (background, externally_connectable,
//    content_security_policy, optional_permissions, sandbox, ...) requiere revisión.
for (const key of Object.keys(manifest)) {
  if (!allow.allowed_keys.includes(key)) {
    fail(`Clave "${key}" no permitida en manifest.json.`);
  }
}

// 3. Permisos
for (const p of extra(manifest.permissions, allow.permissions)) {
  fail(`Permiso nuevo: "${p}".`);
}
for (const h of extra(manifest.host_permissions, allow.host_permissions)) {
  fail(`Host nuevo en host_permissions: "${h}".`);
}

// 4. Content scripts
asArray(manifest.content_scripts).forEach((cs, i) => {
  const where = `content_scripts[${i}]`;
  for (const m of extra(cs.matches, allow.content_script_matches)) {
    fail(`${where}: match nuevo "${m}".`);
  }
  for (const flag of ['all_frames', 'match_about_blank', 'match_origin_as_fallback']) {
    if (cs[flag]) fail(`${where}: "${flag}" no permitido.`);
  }
  if (cs.world !== undefined && cs.world !== 'ISOLATED') {
    fail(`${where}: world "${cs.world}" no permitido (solo ISOLATED).`);
  }
  asArray(cs.js).forEach((f) => checkLocalFile(f, '.js', `${where}.js`));
  asArray(cs.css).forEach((f) => checkLocalFile(f, '.css', `${where}.css`));
});

// 5. Recursos accesibles desde la página
asArray(manifest.web_accessible_resources).forEach((war, i) => {
  const where = `web_accessible_resources[${i}]`;
  for (const r of extra(war.resources, allow.web_accessible_resources.resources)) {
    fail(`${where}: recurso nuevo "${r}".`);
  }
  for (const m of extra(war.matches, allow.web_accessible_resources.matches)) {
    fail(`${where}: match nuevo "${m}".`);
  }
  if (war.extension_ids !== undefined) fail(`${where}: "extension_ids" no permitido.`);
  if (war.use_dynamic_url !== undefined) fail(`${where}: "use_dynamic_url" no permitido.`);
});

// 6. Popup: HTML local
if (manifest.action && manifest.action.default_popup !== undefined) {
  checkLocalFile(manifest.action.default_popup, '.html', 'action.default_popup');
}

// 7. Firefox: declaración de recolección de datos
const dcp = manifest.browser_specific_settings?.gecko?.data_collection_permissions;
if (manifest.browser_specific_settings?.gecko) {
  const required = asArray(dcp?.required);
  if (JSON.stringify(required) !== JSON.stringify(allow.gecko_data_collection_required)) {
    fail(`gecko.data_collection_permissions.required debe ser ${JSON.stringify(allow.gecko_data_collection_required)}.`);
  }
  if (dcp?.optional !== undefined) fail('gecko.data_collection_permissions.optional no permitido.');
}

if (problems.length) {
  for (const p of problems) console.log(`::error file=manifest.json::${p}`);
  console.log(`\n${problems.length} problema(s) en manifest.json. Si el cambio es legítimo, ` +
    'actualizar .github/security/manifest-allowlist.json en un PR aparte.');
  process.exit(1);
}
console.log('manifest.json dentro de la superficie permitida.');
