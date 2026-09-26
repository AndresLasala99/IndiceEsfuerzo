const { Schema, model } = require('mongoose');

const playerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    // Nombre en minúsculas y sin espacios de más, para no repetir jugadores
    nameKey: { type: String, required: true, unique: true },
    // Foto comprimida guardada como data URL (ver README)
    photo: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = model('Player', playerSchema);
