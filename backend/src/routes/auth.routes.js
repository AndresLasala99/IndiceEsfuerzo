const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/auth');
const { registerCheck, registerAdminCheck, loginCheck } = require('../validators/auth.validator');

router.post('/register', validate(registerCheck), ctrl.register);
router.post('/register-admin', validate(registerAdminCheck), ctrl.registerAdmin);
router.post('/login', validate(loginCheck), ctrl.login);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
