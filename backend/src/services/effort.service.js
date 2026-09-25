const Effort = require('../model/Effort');
const User = require('../model/User');
const AppError = require('../utils/AppError');
const { todayInUruguay } = require('../utils/date');
const { listPlayers } = require('./user.service');

// Registro del jugador para hoy (o null si todavía no cargó)
async function getToday(playerId) {
  const date = todayInUruguay();
  const entry = await Effort.findOne({ player: playerId, date });
  return { date, value: entry ? entry.value : null };
}

// Crea o reemplaza el valor de hoy. Se puede cambiar hasta las 00:00 de Uruguay,
// porque a partir de esa hora "hoy" pasa a ser otro día y el anterior queda cerrado.
async function setToday(playerId, value) {
  const date = todayInUruguay();
  const entry = await Effort.findOneAndUpdate(
    { player: playerId, date },
    { $set: { value } },
    { upsert: true, new: true, runValidators: true }
  );
  return { date, value: entry.value };
}

// Todos los jugadores con su valor en una fecha
async function getDay(date) {
  const [players, entries] = await Promise.all([listPlayers(), Effort.find({ date })]);
  const byPlayer = new Map(entries.map((e) => [e.player.toString(), e.value]));
  const rows = players.map((p) => ({ ...p, value: byPlayer.get(p.id.toString()) ?? null }));

  const values = rows.map((r) => r.value).filter((v) => v !== null);
  const average = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;

  return { date, total: rows.length, registered: values.length, average, players: rows };
}

// Valores de un jugador en un mes (AAAA-MM)
async function getPlayerMonth(playerId, month) {
  const player = await User.findOne({ _id: playerId, role: 'player' });
  if (!player) throw new AppError('No se encontró el jugador.', 404);

  const entries = await Effort.find({ player: playerId, date: { $regex: `^${month}-` } }).sort({ date: 1 });
  const days = {};
  entries.forEach((e) => { days[e.date] = e.value; });

  const values = Object.values(days);
  const average = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;

  return {
    player: { id: player._id, name: player.name, photo: player.photo },
    month,
    days,
    registered: values.length,
    average,
  };
}

module.exports = { getToday, setToday, getDay, getPlayerMonth };
