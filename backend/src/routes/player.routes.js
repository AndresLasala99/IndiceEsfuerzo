const router = require('express').Router();
const ctrl = require('../controllers/player.controller');
const validate = require('../middlewares/validate');
const { idCheck, createCheck, updateCheck, valueCheck, dateQueryCheck } = require('../validators/player.validator');

router.get('/', validate(dateQueryCheck), ctrl.list);
router.post('/', validate(createCheck), ctrl.create);
router.patch('/:id', validate(updateCheck), ctrl.update);
router.delete('/:id', validate(idCheck), ctrl.remove);

// Valor del día de hoy
router.put('/:id/today', validate(valueCheck), ctrl.setToday);
router.delete('/:id/today', validate(idCheck), ctrl.clearToday);

module.exports = router;
