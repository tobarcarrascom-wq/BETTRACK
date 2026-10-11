import { balanceAt, calculateTotals, changeFor, loadFromStorage, makeMovement, monthlyTotals, saveToStorage, todayIso, toCsv, validateBackup } from './core.mjs';

const $ = id => document.getElementById(id);
const formatCurrency = value => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
const today = todayIso();
const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
let data = loadFromStorage(window.localStorage);
let cursor = new Date();
let chosen = today;

function announce(message) {
  $('status').textContent = message;
  if (message) window.setTimeout(() => { if ($('status').textContent === message) $('status').textContent = ''; }, 4500);
}

function persist(nextData) {
  if (!saveToStorage(window.localStorage, nextData)) { announce('No se pudieron guardar los datos. Revisa el almacenamiento del navegador.'); return false; }
  data = nextData;
  return true;
}

function render() {
  const totals = calculateTotals(data);
  $('today').textContent = new Date().toLocaleDateString('es-CL', { dateStyle: 'long' });
  $('balance').textContent = formatCurrency(data.initial + totals.gain - totals.loss);
  $('gain').textContent = formatCurrency(totals.gain);
  $('loss').textContent = formatCurrency(totals.loss);
  $('net').textContent = `Resultado neto: ${formatCurrency(totals.gain - totals.loss)}`;
  $('count').textContent = `${data.items.length} ${data.items.length === 1 ? 'movimiento registrado' : 'movimientos registrados'}`;
  $('initial').value = data.initial;
  renderCalendar(); renderHistory(); drawBalanceChart(); drawMonthlyChart();
}

function renderCalendar() {
  const year = cursor.getFullYear(); const month = cursor.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  $('month').textContent = cursor.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  const root = $('days'); root.replaceChildren();
  for (const weekday of weekdays) { const element = document.createElement('div'); element.className = 'weekday'; element.textContent = weekday; root.append(element); }
  for (let index = 0; index < firstDay; index += 1) root.append(document.createElement('div'));
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayChange = data.items.filter(item => item.date === date).reduce((sum, item) => sum + changeFor(item), 0);
    const button = document.createElement('button'); button.type = 'button'; button.textContent = day;
    button.className = `${chosen === date ? 'active ' : ''}${dayChange > 0 ? 'plus' : dayChange < 0 ? 'minus' : ''}`;
    button.setAttribute('aria-label', `${day} de ${cursor.toLocaleDateString('es-CL', { month: 'long' })}`);
    button.setAttribute('aria-pressed', String(chosen === date));
    button.onclick = () => { chosen = date; renderCalendar(); };
    root.append(button);
  }
  $('chosen').textContent = new Date(`${chosen}T00:00:00`).toLocaleDateString('es-CL');
  $('daybalance').textContent = formatCurrency(balanceAt(data, chosen));
  const dayChange = data.items.filter(item => item.date === chosen).reduce((sum, item) => sum + changeFor(item), 0);
  $('dayinfo').textContent = `Cambio del día: ${formatCurrency(dayChange)}`;
}

function renderHistory() {
  const root = $('entries'); root.replaceChildren();
  const query = $('search').value.trim().toLocaleLowerCase('es'); const kind = $('filtertype').value;
  const filtered = data.items.filter(item => (kind === 'all' || item.type === kind) && (!query || item.date.includes(query) || item.note.toLocaleLowerCase('es').includes(query)));
  const result = filtered.reduce((sum, item) => sum + changeFor(item), 0);
  $('historystats').textContent = `${filtered.length} de ${data.items.length} movimientos · Resultado filtrado: ${formatCurrency(result)}`;
  if (!filtered.length) { root.textContent = data.items.length ? 'No hay resultados con estos filtros.' : 'Todavía no hay movimientos.'; return; }
  for (const item of [...filtered].sort((a, b) => b.date.localeCompare(a.date))) {
    const row = document.createElement('div'); row.className = 'entry';
    const info = document.createElement('div'); const amount = document.createElement('strong'); amount.className = item.type === 'gain' ? 'positive' : 'negative'; amount.textContent = `${item.type === 'gain' ? '+' : '−'}${formatCurrency(item.amount)}`;
    const details = document.createElement('div'); details.className = 'muted'; details.textContent = `${item.date} · ${item.note || 'Sin nota'}${item.odds ? ` · Cuota ${item.odds}` : ''}`;
    info.append(amount, details);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'danger'; remove.textContent = 'Eliminar';
    remove.onclick = () => { if (!window.confirm('¿Eliminar este movimiento?')) return; if (persist({ ...data, items: data.items.filter(current => current.id !== item.id) })) { announce('Movimiento eliminado.'); render(); } };
    row.append(info, remove); root.append(row);
  }
}

function drawBalanceChart() {
  const canvas = $('chart'); const context = canvas.getContext('2d'); if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  const values = [data.initial];
  for (const item of [...data.items].sort((a, b) => a.date.localeCompare(b.date))) values.push(values[values.length - 1] + changeFor(item));
  let min = Math.min(...values); let max = Math.max(...values); if (min === max) { min -= 1; max += 1; }
  context.strokeStyle = '#294060'; context.lineWidth = 1;
  for (let line = 0; line < 5; line += 1) { const y = 10 + line * 50; context.beginPath(); context.moveTo(10, y); context.lineTo(790, y); context.stroke(); }
  context.strokeStyle = '#64b8ff'; context.lineWidth = 4; context.lineJoin = 'round'; context.lineCap = 'round'; context.beginPath();
  values.forEach((value, index) => { const x = 20 + 760 * index / Math.max(1, values.length - 1); const y = 200 - 180 * (value - min) / (max - min); index ? context.lineTo(x, y) : context.moveTo(x, y); });
  context.stroke();
}

function drawMonthlyChart() {
  const canvas = $('monthlychart'); const context = canvas.getContext('2d'); if (!context) return;
  const months = monthlyTotals(data); context.clearRect(0, 0, canvas.width, canvas.height);
  const max = Math.max(1, ...months.flatMap(month => [month.gain, month.loss]));
  const left = 65; const right = 785; const top = 20; const bottom = 236; const height = bottom - top;
  context.font = '13px system-ui'; context.textBaseline = 'middle'; context.textAlign = 'right';
  for (let line = 0; line <= 4; line += 1) { const value = max * line / 4; const y = bottom - height * line / 4; context.strokeStyle = '#294060'; context.lineWidth = 1; context.beginPath(); context.moveTo(left, y); context.lineTo(right, y); context.stroke(); context.fillStyle = '#9fb2d1'; const short = value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${Math.round(value / 1000)}k` : Math.round(value).toString(); context.fillText(short, left - 8, y); }
  const group = (right - left) / 6; const bar = Math.min(29, group * .25);
  months.forEach((month, index) => { const center = left + group * (index + .5); for (const [position, value, color] of [[0, month.gain, '#4ade80'], [1, month.loss, '#fb7185']]) { const barHeight = height * value / max; context.fillStyle = color; context.fillRect(center + (position === 0 ? -bar - 2 : 2), bottom - barHeight, bar, barHeight); } context.fillStyle = '#c6d7ee'; context.textAlign = 'center'; context.fillText(new Date(month.year, month.month, 1).toLocaleDateString('es-CL', { month: 'short' }).replace('.', ''), center, 260); });
  const totals = months.reduce((result, month) => ({ gain: result.gain + month.gain, loss: result.loss + month.loss }), { gain: 0, loss: 0 });
  $('monthlysummary').textContent = `Últimos 6 meses · Ganancias: ${formatCurrency(totals.gain)} · Pérdidas: ${formatCurrency(totals.loss)} · Resultado: ${formatCurrency(totals.gain - totals.loss)}`;
}

function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$('date').max = today; $('date').value = today;
$('form').onsubmit = event => {
  event.preventDefault(); $('form-error').textContent = '';
  const result = makeMovement({ date: $('date').value, type: $('type').value, amount: Number($('amount').value), odds: $('odds').value, note: $('note').value });
  if (result.errors) { $('form-error').textContent = result.errors.join(' '); return; }
  if (persist({ ...data, items: [...data.items, result.data] })) { event.target.reset(); $('date').value = today; announce('Movimiento guardado.'); render(); }
};

document.querySelectorAll('[data-tab]').forEach(button => button.onclick = () => {
  document.querySelectorAll('[data-tab]').forEach(tab => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
  ['home', 'calendar', 'history', 'settings'].forEach(id => $(id).classList.toggle('hidden', id !== button.dataset.tab));
});
$('search').oninput = renderHistory; $('filtertype').onchange = renderHistory;
$('prev').onclick = () => { cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1); renderCalendar(); };
$('next').onclick = () => { cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); renderCalendar(); };
$('saveinitial').onclick = () => { const initial = Number($('initial').value); if (!Number.isSafeInteger(initial) || initial < 0) { announce('El saldo inicial debe ser un entero igual o mayor que 0.'); return; } if (persist({ ...data, initial })) { announce('Saldo inicial actualizado.'); render(); } };
$('export').onclick = () => download('bettrack-respaldo.json', JSON.stringify(data, null, 2), 'application/json');
$('csv').onclick = () => download('bettrack-informe.csv', toCsv(data), 'text/csv;charset=utf-8');
$('import').onchange = async event => { const file = event.target.files?.[0]; if (!file) return; try { const backup = validateBackup(JSON.parse(await file.text())); if (backup.errors) { announce(`Respaldo no válido: ${backup.errors[0]}`); return; } if (window.confirm('¿Reemplazar tus datos actuales?')) { if (persist(backup.data)) { announce('Respaldo restaurado.'); render(); } } } catch { announce('Respaldo no válido: el archivo no contiene JSON legible.'); } event.target.value = ''; };
$('clear').onclick = () => { if (!window.confirm('¿Borrar todos los datos?')) return; if (persist({ initial: 0, items: [] })) { announce('Todos los registros fueron borrados.'); render(); } };
window.addEventListener('storage', event => { if (event.key === 'bettrack_public_v1') { data = loadFromStorage(window.localStorage); render(); announce('Datos actualizados desde otra pestaña.'); } });
render();
