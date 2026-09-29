const TZ = 'America/Montevideo';

// Hoy en Uruguay, AAAA-MM-DD
export const todayUY = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export const monthOf = (dateKey) => dateKey.slice(0, 7);

export const toKey = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const parse = (dateKey) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

export const longDate = (dateKey) =>
  new Intl.DateTimeFormat('es-UY', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(parse(dateKey));

export const monthTitle = (monthKey) => {
  const t = new Intl.DateTimeFormat('es-UY', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parse(`${monthKey}-01`));
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// Grilla del mes empezando en lunes. Devuelve semanas con días (null = celda vacía)
export function monthGrid(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7).map((d) => (d ? toKey(y, m, d) : null)));
  return weeks;
}

export const dayMonth = (dateKey) =>
  new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(parse(dateKey));
