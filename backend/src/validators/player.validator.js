const mongoose = require('mongoose');
const { isDateKey, isMonthKey } = require('../utils/date');
const { METRICS } = require('../utils/metrics');

const MAX_PHOTO_CHARS = 1_500_000; // ~1 MB de imagen
const PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

function checkName(name) {
  if (typeof name !== 'string' || name.trim().length < 2) return 'Escribí el nombre (mínimo 2 letras).';
  if (name.trim().length > 60) return 'El nombre puede tener hasta 60 caracteres.';
  return null;
}

function checkPhoto(photo) {
  if (photo === '') return null; // vacío = sin foto
  if (typeof photo !== 'string' || !PHOTO_RE.test(photo)) return 'Formato de foto inválido.';
  if (photo.length > MAX_PHOTO_CHARS) return 'La foto es demasiado pesada. Probá con otra.';
  return null;
}

const checkValue = (v) => (Number.isInteger(v) && v >= 1 && v <= 5 ? null : 'Cada valor tiene que ser un número del 1 al 5.');
const checkMetric = (m) => (METRICS.includes(m) ? null : 'Medición inválida.');

function idCheck(req) {
  return mongoose.isValidObjectId(req.params.id) ? null : 'Jugador inválido.';
}

function createCheck(req) {
  const body = req.body || {};
  const nameOrPhoto = checkName(body.name) || (body.photo !== undefined ? checkPhoto(body.photo) : null);
  if (nameOrPhoto) return nameOrPhoto;
  for (const m of METRICS) {
    if (body[m] !== undefined && body[m] !== null) {
      const err = checkValue(body[m]);
      if (err) return err;
    }
  }
  return null;
}

function updateCheck(req) {
  const { name, photo } = req.body || {};
  if (name === undefined && photo === undefined) return 'No hay nada para cambiar.';
  return idCheck(req)
    || (name !== undefined ? checkName(name) : null)
    || (photo !== undefined ? checkPhoto(photo) : null);
}

function setValueCheck(req) {
  return idCheck(req) || checkMetric(req.body?.metric) || checkValue(req.body?.value);
}

function clearValueCheck(req) {
  return idCheck(req) || checkMetric(req.params.metric);
}

function dateQueryCheck(req) {
  if (req.query.date === undefined) return null; // sin fecha = hoy
  return isDateKey(req.query.date) ? null : 'Fecha inválida. Formato esperado: AAAA-MM-DD.';
}

function monthQueryCheck(req) {
  return isMonthKey(req.query.month) ? null : 'Mes inválido. Formato esperado: AAAA-MM.';
}

module.exports = { monthQueryCheck, idCheck, createCheck, updateCheck, setValueCheck, clearValueCheck, dateQueryCheck };
