const MAX_PHOTO_CHARS = 1_500_000; // ~1 MB de imagen

function photoCheck(req) {
  const { photo } = req.body || {};
  if (typeof photo !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo)) {
    return 'Formato de foto inválido.';
  }
  if (photo.length > MAX_PHOTO_CHARS) return 'La foto es demasiado pesada. Probá con otra.';
  return null;
}

module.exports = { photoCheck };
