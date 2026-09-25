const User = require('../model/User');

async function updatePhoto(user, photo) {
  user.photo = photo;
  await user.save();
  return user.toPublic();
}

async function listPlayers() {
  const players = await User.find({ role: 'player' }).sort({ name: 1 });
  return players.map((p) => ({ id: p._id, name: p.name, photo: p.photo }));
}

module.exports = { updatePhoto, listPlayers };
