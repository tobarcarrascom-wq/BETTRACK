// Comprobaciones de integridad de la aplicación estática.
// Ejecutar: node --test tests/smoke.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

test('El HTML contiene un script JavaScript válido', () => {
  assert.ok(script, 'No se encontró el script principal');
  assert.doesNotThrow(() => new vm.Script(script));
});

test('Incluye secciones principales y elementos clave', () => {
  for (const id of ['home','calendar','history','settings','balance','gain','loss','monthlychart','monthlysummary','entries','export','import','csv']) {
    assert.ok(html.includes('id="'+id+'"'), 'Falta el elemento '+id);
  }
});

test('Incluye protección básica de exportación y confirmación al borrar', () => {
  assert.match(script, /escapeCsv/);
  assert.match(script, /confirm\('¿Borrar todos los datos\?'\)/);
  assert.match(script, /localStorage\.setItem/);
});

test('La aplicación no depende de bibliotecas externas', () => {
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:/i);
});
