const asyncHandler = require('../utils/asyncHandler');
const effortService = require('../services/effort.service');

exports.getToday = asyncHandler(async (req, res) => {
  res.json(await effortService.getToday(req.user._id));
});

exports.setToday = asyncHandler(async (req, res) => {
  res.json(await effortService.setToday(req.user._id, req.body.value));
});

exports.getDay = asyncHandler(async (req, res) => {
  res.json(await effortService.getDay(req.query.date));
});

exports.getPlayerMonth = asyncHandler(async (req, res) => {
  res.json(await effortService.getPlayerMonth(req.params.id, req.query.month));
});
