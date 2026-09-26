const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/player.service');

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.listForDate(req.query.date));
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.create(req.body));
});

exports.update = asyncHandler(async (req, res) => {
  res.json(await service.update(req.params.id, req.body));
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).end();
});

exports.setToday = asyncHandler(async (req, res) => {
  res.json(await service.setToday(req.params.id, req.body.value));
});

exports.clearToday = asyncHandler(async (req, res) => {
  res.json(await service.clearToday(req.params.id));
});
