const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(`No existe la ruta ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'La foto es demasiado pesada. Probá con otra.' });
  }
  if (err.code === 11000 && err.keyPattern?.nameKey) {
    return res.status(409).json({ message: 'Ya hay un jugador con ese nombre en la lista.' });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor.' });
}

module.exports = { notFound, errorHandler };
