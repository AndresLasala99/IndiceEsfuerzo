const { port } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

connectDB()
  .then(() => app.listen(port, () => console.log(`API escuchando en el puerto ${port}`)))
  .catch((err) => {
    console.error('No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  });
