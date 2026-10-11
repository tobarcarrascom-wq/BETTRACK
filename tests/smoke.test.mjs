import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const core = fs.readFileSync(new URL('../core.mjs', import.meta.url), 'utf8');

test('El JavaScript principal y el núcleo son sintácticamente válidos', () => {
  assert.doesNotThrow(() => execFileSync(process.execPath, ['--check', fileURLToPath(new URL('../core.mjs', import.meta.url))]));
  assert.doesNotThrow(() => execFileSync(process.execPath, ['--check', fileURLToPath(new URL('../app.js', import.meta.url))]));
});

test('El HTML conserva las secciones y controles principales', () => {
  for (const id of ['home', 'calendar', 'history', 'settings', 'home-tab', 'calendar-tab', 'history-tab', 'settings-tab', 'balance', 'gain', 'loss', 'monthlychart', 'monthlysummary', 'entries', 'export', 'import', 'csv']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `Falta el elemento ${id}`);
  }
  assert.match(html, /<script\s+type="module"\s+src="app\.js"><\/script>/);
  assert.match(html, /href="styles\.css"/);
});

test('La interfaz conserva las protecciones de privacidad y confirmación', () => {
  assert.match(app, /bettrack_public_v1/);
  assert.match(app, /window\.confirm\('¿Borrar todos los datos\?'\)/);
  assert.match(app, /window\.confirm\('¿Reemplazar tus datos actuales\?'\)/);
  assert.match(core, /setItem\(STORAGE_KEY/);
});

test('La aplicación no depende de bibliotecas remotas', () => {
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:/i);
});
