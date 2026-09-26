require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('Falta la variable de entorno MONGODB_URI. Revisá el archivo .env o Render.');
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGODB_URI,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((u) => u.trim().replace(/\/$/, ''))
    .filter(Boolean),
  // El "día" siempre se cuenta con la hora de Uruguay
  timezone: 'America/Montevideo',
};
