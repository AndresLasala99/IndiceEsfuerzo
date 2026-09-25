const express = require('express');
const cors = require('cors');
const { clientUrls } = require('./config/env');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      // Permite herramientas sin origen (Postman, health checks) y las URLs configuradas
      if (!origin || clientUrls.includes(origin.replace(/\/$/, ''))) return cb(null, true);
      cb(new Error(`Origen no permitido por CORS: ${origin}`));
    },
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/efforts', require('./routes/effort.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
