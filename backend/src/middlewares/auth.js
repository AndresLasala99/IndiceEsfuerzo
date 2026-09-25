const jwt = require('jsonwebtoken');
const User = require('../model/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../config/env');

// Verifica que haya una sesión válida y carga el usuario en req.user
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Tenés que iniciar sesión.', 401);

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new AppError('La sesión venció. Iniciá sesión de nuevo.', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError('El usuario ya no existe.', 401);
  req.user = user;
  next();
});

// Deja pasar solo al rol indicado
const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return next(new AppError('No tenés permiso para esto.', 403));
  next();
};

module.exports = { requireAuth, requireRole };
