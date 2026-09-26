const mongoose = require('mongoose');
const { isDateKey } = require('../utils/date');

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

const checkValue = (v) => (Number.isInteger(v) && v >= 1 && v <= 5 ? null : 'El valor tiene que ser un número del 1 al 5.');

function idCheck(req) {
  return mongoose.isValidObjectId(req.params.id) ? null : 'Jugador inválido.';
}

function createCheck(req) {
  const { name, photo, value } = req.body || {};
  return checkName(name)
    || (photo !== undefined ? checkPhoto(photo) : null)
    || (value !== undefined && value !== null ? checkValue(value) : null);
}

function updateCheck(req) {
  const { name, photo } = req.body || {};
  if (name === undefined && photo === undefined) return 'No hay nada para cambiar.';
  return idCheck(req)
    || (name !== undefined ? checkName(name) : null)
    || (photo !== undefined ? checkPhoto(photo) : null);
}

function valueCheck(req) {
  return idCheck(req) || checkValue(req.body?.value);
}

function dateQueryCheck(req) {
  if (req.query.date === undefined) return null; // sin fecha = hoy
  return isDateKey(req.query.date) ? null : 'Fecha inválida. Formato esperado: AAAA-MM-DD.';
}

module.exports = { idCheck, createCheck, updateCheck, valueCheck, dateQueryCheck };
