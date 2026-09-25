const AppError = require('../utils/AppError');

// Recibe una función que devuelve el primer error encontrado (o null)
module.exports = (check) => (req, res, next) => {
  const error = check(req);
  if (error) return next(new AppError(error, 400));
  next();
};
