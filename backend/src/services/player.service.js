const Player = require('../model/Player');
const Effort = require('../model/Effort');
const AppError = require('../utils/AppError');
const { todayInUruguay } = require('../utils/date');

const keyOf = (name) => name.trim().replace(/\s+/g, ' ').toLowerCase();
const cleanName = (name) => name.trim().replace(/\s+/g, ' ');

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

// Lista completa con el valor de cada jugador en la fecha pedida
async function listForDate(date) {
  const today = todayInUruguay();
  const day = date || today;
  if (day > today) throw new AppError('No se pueden ver días que todavía no pasaron.', 400);

  const [players, entries] = await Promise.all([
    Player.find().collation({ locale: 'es' }).sort({ name: 1 }),
    Effort.find({ date: day }),
  ]);
  const byPlayer = new Map(entries.map((e) => [String(e.player), e.value]));

  const rows = players.map((p) => ({
    id: p._id,
    name: p.name,
    photo: p.photo,
    value: byPlayer.get(String(p._id)) ?? null,
  }));
  const values = rows.map((r) => r.value).filter((v) => v !== null);
  const average = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;

  return {
    date: day,
    today,
    editable: day === today, // solo el día de hoy se puede cambiar
    total: rows.length,
    registered: values.length,
    average,
    players: rows,
  };
}

async function create({ name, photo = '', value = null }) {
  await ensureNameFree(name);
  const player = await Player.create({ name: cleanName(name), nameKey: keyOf(name), photo });
  if (value) await Effort.create({ player: player._id, date: todayInUruguay(), value });
  return { id: player._id, name: player.name, photo: player.photo, value };
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
  await Promise.all([Player.deleteOne({ _id: id }), Effort.deleteMany({ player: id })]);
}

// Guarda o cambia el valor de HOY. Pasada la medianoche de Uruguay, "hoy" es otro día
// y el anterior queda cerrado, porque nunca se escribe sobre otra fecha.
async function setToday(id, value) {
  await findPlayer(id);
  const date = todayInUruguay();
  await Effort.findOneAndUpdate({ player: id, date }, { $set: { value } }, { upsert: true, runValidators: true });
  return { date, value };
}

async function clearToday(id) {
  await findPlayer(id);
  const date = todayInUruguay();
  await Effort.deleteOne({ player: id, date });
  return { date, value: null };
}

module.exports = { listForDate, create, update, remove, setToday, clearToday };
