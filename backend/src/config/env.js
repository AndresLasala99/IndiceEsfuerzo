require('dotenv').config();

const required = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_CODE'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Falta la variable de entorno ${key}. Revisá el archivo .env`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES || '30d',
  adminCode: process.env.ADMIN_CODE,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((u) => u.trim().replace(/\/$/, ''))
    .filter(Boolean),
  // El "día" siempre se cuenta con la hora de Uruguay
  timezone: 'America/Montevideo',
};
