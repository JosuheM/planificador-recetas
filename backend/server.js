require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { auth } = require('./src/middleware/auth');

const app = express();

const origenes = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origenes.length ? origenes : false }));
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true, servicio: 'API Planificador de recetas' }));
app.use('/auth', require('./src/routes/auth'));
app.use('/recetas', auth, require('./src/routes/recetas'));
app.use('/plan', auth, require('./src/routes/plan'));
app.use('/lista-compras', auth, require('./src/routes/listaCompras'));

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Manejo central de errores (Express 5 envía aquí también los errores de handlers async)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
