export const STORAGE_KEY = 'bettrack_public_v1';
export const MAX_ITEMS = 100000;
export const MAX_NOTE_LENGTH = 100;

export function todayIso(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function isValidIsoDate(value, { today = todayIso(), allowFuture = true } = {}) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return false;
  return allowFuture || value <= today;
}

function normalizeOdds(value) {
  if (value === '' || value === null || typeof value === 'undefined') return '';
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number >= 1 ? String(value) : null;
}

export function movementErrors(movement, { today = todayIso(), allowFuture = false } = {}) {
  const errors = [];
  if (!movement || typeof movement !== 'object') return ['El movimiento no es válido.'];
  if (typeof movement.id !== 'string' || movement.id.length === 0) errors.push('Falta un identificador.');
  if (!isValidIsoDate(movement.date, { today, allowFuture })) errors.push('La fecha no es válida.');
  if (!['gain', 'loss'].includes(movement.type)) errors.push('El tipo no es válido.');
  if (!Number.isSafeInteger(movement.amount) || movement.amount <= 0) errors.push('El monto debe ser un entero positivo.');
  if (typeof movement.note !== 'string' || movement.note.length > MAX_NOTE_LENGTH) errors.push('La nota supera el límite permitido.');
  if (normalizeOdds(movement.odds) === null) errors.push('La cuota debe ser un número igual o mayor que 1.');
  return errors;
}

export function normalizeMovement(movement, { today = todayIso(), allowFuture = true } = {}) {
  if (movementErrors(movement, { today, allowFuture }).length) return null;
  return { id: movement.id, date: movement.date, type: movement.type, amount: movement.amount, odds: normalizeOdds(movement.odds), note: movement.note };
}

export function normalizeStoredData(value) {
  if (!value || typeof value !== 'object') return { initial: 0, items: [] };
  const initial = Number.isSafeInteger(value.initial) && value.initial >= 0 ? value.initial : 0;
  const items = [];
  const ids = new Set();
  if (Array.isArray(value.items)) {
    for (const item of value.items.slice(0, MAX_ITEMS)) {
      const normalized = normalizeMovement({ ...item, note: typeof item.note === 'string' ? item.note : '' });
      if (normalized && !ids.has(normalized.id)) { ids.add(normalized.id); items.push(normalized); }
    }
  }
  return { initial, items };
}

export function validateBackup(value, { today = todayIso() } = {}) {
  const errors = [];
  if (!value || typeof value !== 'object') return { errors: ['El respaldo debe ser un objeto JSON.'] };
  if (!Number.isSafeInteger(value.initial) || value.initial < 0) errors.push('El saldo inicial no es válido.');
  if (!Array.isArray(value.items) || value.items.length > MAX_ITEMS) errors.push('La lista de movimientos no es válida.');
  if (errors.length) return { errors };
  const normalized = [];
  const ids = new Set();
  value.items.forEach((item, index) => {
    const itemErrors = movementErrors(item, { today, allowFuture: false });
    if (ids.has(item?.id)) itemErrors.push('El identificador está repetido.');
    if (itemErrors.length) errors.push(`Movimiento ${index + 1}: ${itemErrors.join(' ')}`);
    else { ids.add(item.id); normalized.push(normalizeMovement(item, { today, allowFuture: false })); }
  });
  return errors.length ? { errors } : { data: { initial: value.initial, items: normalized } };
}

export function makeMovement({ date, type, amount, odds = '', note = '' }) {
  const movement = { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`, date, type, amount, odds, note: note.trim() };
  const errors = movementErrors(movement, { allowFuture: false });
  return errors.length ? { errors } : { data: normalizeMovement(movement, { allowFuture: false }) };
}

export function loadFromStorage(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return normalizeStoredData(raw ? JSON.parse(raw) : null);
  } catch { return { initial: 0, items: [] }; }
}

export function saveToStorage(storage, data) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
  catch { return false; }
}

export function changeFor(movement) { return movement.type === 'gain' ? movement.amount : -movement.amount; }

export function calculateTotals(data) {
  return data.items.reduce((totals, movement) => {
    if (movement.type === 'gain') totals.gain += movement.amount;
    else totals.loss += movement.amount;
    return totals;
  }, { gain: 0, loss: 0 });
}

export function balanceAt(data, date) {
  return data.initial + data.items.filter(item => item.date <= date).reduce((sum, item) => sum + changeFor(item), 0);
}

export function monthlyTotals(data, baseDate = new Date()) {
  const months = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - offset, 1);
    const key = todayIso(date).slice(0, 7);
    const totals = data.items.reduce((result, item) => {
      if (item.date.slice(0, 7) === key) result[item.type] += item.amount;
      return result;
    }, { gain: 0, loss: 0 });
    months.push({ key, year: date.getFullYear(), month: date.getMonth(), ...totals });
  }
  return months;
}

function csvCell(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function toCsv(data) {
  const rows = [
    ['Fecha', 'Tipo', 'Monto CLP', 'Nota', 'Cuota'],
    ...[...data.items].sort((a, b) => a.date.localeCompare(b.date)).map(item => [item.date, item.type === 'gain' ? 'Ganancia' : 'Pérdida', item.amount, item.note, item.odds]),
  ];
  return `\uFEFF${rows.map(row => row.map(csvCell).join(';')).join('\r\n')}`;
}
