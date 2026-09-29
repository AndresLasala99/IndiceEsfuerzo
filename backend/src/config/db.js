const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log('Conectado a MongoDB');

  // Registros de la versión anterior guardaban el esfuerzo como "value".
  // Se pasan a "effort" una sola vez; si ya no hay ninguno, no hace nada.
  const res = await mongoose.connection.collection('efforts').updateMany(
    { value: { $exists: true } },
    [{ $set: { effort: '$value' } }, { $unset: 'value' }]
  );
  if (res.modifiedCount) console.log(`Registros actualizados al nuevo formato: ${res.modifiedCount}`);
}

module.exports = connectDB;
