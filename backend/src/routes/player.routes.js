const router = require('express').Router();
const ctrl = require('../controllers/player.controller');
const validate = require('../middlewares/validate');
const v = require('../validators/player.validator');

router.get('/', validate(v.dateQueryCheck), ctrl.list);
router.get('/summary', validate(v.monthQueryCheck), ctrl.monthSummary);
// Promedios del mes
router.get('/month', validate(v.monthQueryCheck), ctrl.month);

router.post('/', validate(v.createCheck), ctrl.create);
router.patch('/:id', validate(v.updateCheck), ctrl.update);
router.delete('/:id', validate(v.idCheck), ctrl.remove);

// Mediciones del día de hoy (fatigue, sleep, effort)
router.put('/:id/today', validate(v.setValueCheck), ctrl.setToday);
router.delete('/:id/today/:metric', validate(v.clearValueCheck), ctrl.clearToday);

module.exports = router;
