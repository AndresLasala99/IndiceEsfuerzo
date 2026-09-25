const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function registerCheck(req) {
  const { name, email, password } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) return 'Escribí tu nombre (mínimo 2 letras).';
  if (name.trim().length > 60) return 'El nombre puede tener hasta 60 caracteres.';
  if (!email || !EMAIL_RE.test(email)) return 'Escribí un email válido.';
  if (!password || typeof password !== 'string' || password.length < 6) return 'La contraseña tiene que tener al menos 6 caracteres.';
  return null;
}

function registerAdminCheck(req) {
  const base = registerCheck(req);
  if (base) return base;
  if (!req.body.adminCode) return 'Escribí el código de administrador.';
  return null;
}

function loginCheck(req) {
  const { email, password } = req.body || {};
  if (!email || !password) return 'Escribí tu email y contraseña.';
  return null;
}

module.exports = { registerCheck, registerAdminCheck, loginCheck };
