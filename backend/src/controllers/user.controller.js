const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

exports.updateMyPhoto = asyncHandler(async (req, res) => {
  res.json({ user: await userService.updatePhoto(req.user, req.body.photo) });
});

exports.listPlayers = asyncHandler(async (req, res) => {
  res.json({ players: await userService.listPlayers() });
});
