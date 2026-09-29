const Player = require('../model/Player');
const Entry = require('../model/Effort');
const AppError = require('../utils/AppError');
const { todayInUruguay } = require('../utils/date');
const { METRICS } = require('../utils/metrics');

const keyOf = (name) => name.trim().replace(/\s+/g, ' ').toLowerCase();
const cleanName = (name) => name.trim().replace(/\s+/g, ' ');
const round1 = (n) => Math.round(n * 10) / 10;

async function findPlayer(id) {
  const player = await Player.findById(id);
  if (!player) throw new AppError('No se encontró el jugador.', 404);
  return player;
}

async function ensureNameFree(name, exceptId) {
  const other = await Player.findOne({ nameKey: keyOf(name) });
  if (other && String(other._id) !== String(exceptId)) {
    throw new AppError('Ya hay un jugador con ese nombre en la lista.', 409);
  }
}

// Para cada medición: cuántos la cargaron y el promedio
function summarize(rows) {
  const summary = {};
  for (const m of METRICS) {
    const values = rows.map((r) => r[m]).filter((v) => v !== null);
    summary[m] = {
      registered: values.length,
      average: values.length ? round1(values.reduce((a, b) => a + b, 0) / values.length) : null,
    };
  }
  return summary;
}

// Lista completa con las mediciones de cada jugador en la fecha pedida
async function listForDate(date) {
  const today = todayInUruguay();
  const day = date || today;
  if (day > today) throw new AppError('No se pueden ver días que todavía no pasaron.', 400);

  const [players, entries] = await Promise.all([
    Player.find().collation({ locale: 'es' }).sort({ name: 1 }),
    Entry.find({ date: day }),
  ]);
  const byPlayer = new Map(entries.map((e) => [String(e.player), e]));

  const rows = players.map((p) => {
    const e = byPlayer.get(String(p._id));
    const row = { id: p._id, name: p.name, photo: p.photo };
    for (const m of METRICS) row[m] = e?.[m] ?? null;
    return row;
  });

  return {
    date: day,
    today,
    editable: day === today, // solo el día de hoy se puede cambiar
    total: rows.length,
    summary: summarize(rows),
    players: rows,
  };
}

async function create(body) {
  const { name, photo = '' } = body;
  await ensureNameFree(name);
  const player = await Player.create({ name: cleanName(name), nameKey: keyOf(name), photo });

  const values = {};
  for (const m of METRICS) if (body[m]) values[m] = body[m];
  if (Object.keys(values).length) {
    await Entry.create({ player: player._id, date: todayInUruguay(), ...values });
  }

  const row = { id: player._id, name: player.name, photo: player.photo };
  for (const m of METRICS) row[m] = values[m] ?? null;
  return row;
}

async function update(id, { name, photo }) {
  const player = await findPlayer(id);
  if (name !== undefined) {
    await ensureNameFree(name, id);
    player.name = cleanName(name);
    player.nameKey = keyOf(name);
  }
  if (photo !== undefined) player.photo = photo;
  await player.save();
  return { id: player._id, name: player.name, photo: player.photo };
}

// Borra el jugador y todo su historial
async function remove(id) {
  await findPlayer(id);
  await Promise.all([Player.deleteOne({ _id: id }), Entry.deleteMany({ player: id })]);
}

// Guarda o cambia una medición de HOY. Pasada la medianoche de Uruguay, "hoy" es otro día
// y el anterior queda cerrado, porque nunca se escribe sobre otra fecha.
async function setToday(id, metric, value) {
  await findPlayer(id);
  const date = todayInUruguay();
  await Entry.findOneAndUpdate(
    { player: id, date },
    { $set: { [metric]: value } },
    { upsert: true, runValidators: true }
  );
  return { date, metric, value };
}

// Borra una medición de hoy. Si no queda ninguna, se borra el registro del día
async function clearToday(id, metric) {
  await findPlayer(id);
  const date = todayInUruguay();
  const entry = await Entry.findOneAndUpdate({ player: id, date }, { $unset: { [metric]: 1 } }, { new: true });
  if (entry && METRICS.every((m) => entry[m] == null)) await Entry.deleteOne({ _id: entry._id });
  return { date, metric, value: null };
}

// Promedios de un mes (AAAA-MM): del plantel y de cada jugador, por medición.
// En el mes en curso se usa lo cargado hasta ahora.
async function monthSummary(month) {
  const today = todayInUruguay();
  if (month > today.slice(0, 7)) throw new AppError('Ese mes todavía no empezó.', 400);

  const [players, entries] = await Promise.all([
    Player.find().collation({ locale: 'es' }).sort({ name: 1 }),
    Entry.find({ date: { $gte: `${month}-01`, $lte: `${month}-31` } }),
  ]);

  const avgOf = (values) => ({
    count: values.length,
    average: values.length ? round1(values.reduce((a, b) => a + b, 0) / values.length) : null,
  });

  const byPlayer = new Map();
  for (const e of entries) {
    const k = String(e.player);
    if (!byPlayer.has(k)) byPlayer.set(k, []);
    byPlayer.get(k).push(e);
  }

  const rows = players.map((p) => {
    const list = byPlayer.get(String(p._id)) || [];
    const row = { id: p._id, name: p.name, photo: p.photo, days: list.length };
    for (const m of METRICS) row[m] = avgOf(list.map((e) => e[m]).filter((v) => v != null));
    return row;
  });

  // Promedio general: todos los valores cargados en el mes por jugadores que siguen en la lista
  const current = new Set(players.map((p) => String(p._id)));
  const valid = entries.filter((e) => current.has(String(e.player)));
  const team = {};
  for (const m of METRICS) team[m] = avgOf(valid.map((e) => e[m]).filter((v) => v != null));

  const lastDate = valid.reduce((max, e) => (!max || e.date > max ? e.date : max), null);

  return {
    month,
    isCurrent: month === today.slice(0, 7),
    lastDate,
    team,
    players: rows,
  };
}

module.exports = { monthSummary, listForDate, create, update, remove, setToday, clearToday };
