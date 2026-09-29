const { Schema, model } = require('mongoose');

const scale = { type: Number, min: 1, max: 5 };

// Registro diario de un jugador: las tres mediciones del día
const entrySchema = new Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    // Día en hora de Uruguay, formato AAAA-MM-DD
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    fatigue: scale, // antes de entrenar: 1 nada fatigado, 5 muy fatigado
    sleep: scale,   // antes de entrenar: 1 durmió muy mal, 5 durmió muy bien
    effort: scale,  // después de entrenar: 1 muy suave, 5 máximo
  },
  { timestamps: true }
);

// Un solo registro por jugador por día
entrySchema.index({ player: 1, date: 1 }, { unique: true });
entrySchema.index({ date: 1 });

// Se mantiene el nombre de colección "efforts" para no perder lo ya cargado
module.exports = model('Effort', entrySchema, 'efforts');
