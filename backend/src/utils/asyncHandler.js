// Evita repetir try/catch en cada controlador
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
