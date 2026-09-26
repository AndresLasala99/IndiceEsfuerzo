const { Schema, model } = require('mongoose');

const effortSchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    // Día en hora de Uruguay, formato AAAA-MM-DD
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// Un solo valor por jugador por día
effortSchema.index({ player: 1, date: 1 }, { unique: true });
effortSchema.index({ date: 1 });

module.exports = model('Effort', effortSchema);
