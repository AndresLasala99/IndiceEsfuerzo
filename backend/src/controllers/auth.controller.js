const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

exports.register = asyncHandler(async (req, res) => {
  res.status(201).json(await authService.register(req.body));
});

exports.registerAdmin = asyncHandler(async (req, res) => {
  res.status(201).json(await authService.registerAdmin(req.body));
});

exports.login = asyncHandler(async (req, res) => {
  res.json(await authService.login(req.body));
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublic() });
});
