const { isDateKey, isMonthKey } = require('../utils/date');
const mongoose = require('mongoose');

function valueCheck(req) {
  const v = req.body?.value;
  if (!Number.isInteger(v) || v < 1 || v > 5) return 'El valor tiene que ser un número del 1 al 5.';
  return null;
}

function dayQueryCheck(req) {
  if (!isDateKey(req.query.date)) return 'Fecha inválida. Formato esperado: AAAA-MM-DD.';
  return null;
}

function playerMonthCheck(req) {
  if (!mongoose.isValidObjectId(req.params.id)) return 'Jugador inválido.';
  if (!isMonthKey(req.query.month)) return 'Mes inválido. Formato esperado: AAAA-MM.';
  return null;
}

module.exports = { valueCheck, dayQueryCheck, playerMonthCheck };
