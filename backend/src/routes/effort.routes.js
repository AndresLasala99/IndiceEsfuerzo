const router = require('express').Router();
const ctrl = require('../controllers/effort.controller');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { valueCheck, dayQueryCheck, playerMonthCheck } = require('../validators/effort.validator');

router.use(requireAuth);

// Jugador
router.get('/today', requireRole('player'), ctrl.getToday);
router.put('/today', requireRole('player'), validate(valueCheck), ctrl.setToday);

// Administrador
router.get('/day', requireRole('admin'), validate(dayQueryCheck), ctrl.getDay);
router.get('/player/:id', requireRole('admin'), validate(playerMonthCheck), ctrl.getPlayerMonth);

module.exports = router;
