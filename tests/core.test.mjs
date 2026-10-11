import test from 'node:test';
import assert from 'node:assert/strict';
import { balanceAt, calculateTotals, isValidIsoDate, makeMovement, normalizeStoredData, toCsv, validateBackup } from '../core.mjs';

const today = '2026-10-11';
const sample = {
  initial: 10000,
  items: [
    { id: 'a', date: '2026-10-01', type: 'gain', amount: 2500, odds: '', note: 'Venta' },
    { id: 'b', date: '2026-10-05', type: 'loss', amount: 700, odds: '1.5', note: 'Comisión' },
  ],
};

test('Valida fechas reales y bloquea fechas futuras de entradas nuevas', () => {
  assert.equal(isValidIsoDate('2024-02-29'), true);
  assert.equal(isValidIsoDate('2025-02-29'), false);
  assert.equal(isValidIsoDate('2026-10-12', { today, allowFuture: false }), false);
  assert.equal(isValidIsoDate('2026-10-12', { today, allowFuture: true }), true);
});

test('Calcula totales y saldo al cierre de un día', () => {
  assert.deepEqual(calculateTotals(sample), { gain: 2500, loss: 700 });
  assert.equal(balanceAt(sample, '2026-10-01'), 12500);
  assert.equal(balanceAt(sample, '2026-10-04'), 12500);
  assert.equal(balanceAt(sample, '2026-10-11'), 11800);
});

test('Valida movimientos nuevos, incluyendo cuota, monto y nota', () => {
  const valid = makeMovement({ date: today, type: 'gain', amount: 1000, odds: '2.25', note: '  Registro  ' });
  assert.ok(valid.data);
  assert.equal(valid.data.note, 'Registro');
  assert.equal(makeMovement({ date: '2026-02-30', type: 'gain', amount: 1000 }).errors.length > 0, true);
  assert.equal(makeMovement({ date: today, type: 'loss', amount: 0 }).errors.length > 0, true);
  assert.equal(makeMovement({ date: today, type: 'gain', amount: 1000, odds: '0.5' }).errors.length > 0, true);
  assert.equal(makeMovement({ date: today, type: 'gain', amount: 1000, note: 'x'.repeat(101) }).errors.length > 0, true);
});

test('Rechaza respaldos inválidos sin aceptar datos futuros o cuota inválida', () => {
  const valid = validateBackup({ initial: 0, items: [{ id: 'one', date: today, type: 'gain', amount: 1, odds: '', note: '' }] }, { today });
  assert.ok(valid.data);
  assert.ok(validateBackup({ initial: 0, items: [{ id: 'two', date: '2026-10-12', type: 'gain', amount: 1, odds: '', note: '' }] }, { today }).errors);
  assert.ok(validateBackup({ initial: 0, items: [{ id: 'three', date: today, type: 'gain', amount: 1, odds: 'x', note: '' }] }, { today }).errors);
  assert.ok(validateBackup({ initial: 0, items: [{ id: 'four', date: today, type: 'gain', amount: 1, odds: '', note: 'x'.repeat(101) }] }, { today }).errors);
});

test('Recupera registros válidos de almacenamiento dañado sin romper la app', () => {
  const normalized = normalizeStoredData({ initial: 500, items: [sample.items[0], { id: 'bad', date: 'not-a-date', type: 'gain', amount: 2 }, sample.items[0]] });
  assert.deepEqual(normalized, { initial: 500, items: [sample.items[0]] });
});

test('Genera CSV con protección frente a fórmulas de hoja de cálculo', () => {
  const csv = toCsv({ initial: 0, items: [{ id: 'csv', date: today, type: 'gain', amount: 10, odds: '', note: '=HYPERLINK("x")' }] });
  assert.match(csv, /'=HYPERLINK/);
  assert.match(csv, /Fecha.*Tipo.*Monto CLP/);
});
