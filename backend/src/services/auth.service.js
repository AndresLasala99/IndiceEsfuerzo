const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const AppError = require('../utils/AppError');
const { jwtSecret, jwtExpires, adminCode } = require('../config/env');

const signToken = (user) => jwt.sign({ sub: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: jwtExpires });

// Compara textos sin filtrar información por el tiempo de respuesta
function sameText(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

async function register({ name, email, password }, role = 'player') {
  const exists = await User.exists({ email: email.toLowerCase().trim() });
  if (exists) throw new AppError('Ya existe una cuenta con ese email.', 409);

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name: name.trim(), email, password: hash, role });
  return { token: signToken(user), user: user.toPublic() };
}

async function registerAdmin(data) {
  if (!sameText(data.adminCode, adminCode)) throw new AppError('El código de administrador no es correcto.', 403);
  return register(data, 'admin');
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new AppError('Email o contraseña incorrectos.', 401);
  return { token: signToken(user), user: user.toPublic() };
}

module.exports = { register, registerAdmin, login };
