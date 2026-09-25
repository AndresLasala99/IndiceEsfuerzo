const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { photoCheck } = require('../validators/user.validator');

// Cualquier usuario logueado puede cambiar su propia foto
router.put('/me/photo', requireAuth, validate(photoCheck), ctrl.updateMyPhoto);

// Lista de jugadores: solo administrador
router.get('/players', requireAuth, requireRole('admin'), ctrl.listPlayers);

module.exports = router;
