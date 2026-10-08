const router = require('express').Router();
const { z } = require('zod');
const db = require('../db');
const { validar } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, ingrediente, cantidad, unidad, comprado FROM lista_compras WHERE usuario_id = ? ORDER BY comprado, ingrediente',
    [req.userId]
  );
  res.json(rows.map((r) => ({ ...r, comprado: !!r.comprado })));
});

// Agrupa y suma los ingredientes de todas las recetas del plan.
// La clave de agrupación es (nombre normalizado, unidad): 200 g + 100 g de cebolla = 300 g.
// Si el mismo ingrediente viene en unidades distintas (g y kg) se convierten a la base.
const BASE = { kg: ['g', 1000], l: ['ml', 1000] };

function normalizar(nombre, cantidad, unidad) {
  const u = unidad.toLowerCase();
  if (BASE[u]) return { nombre, cantidad: cantidad * BASE[u][1], unidad: BASE[u][0] };
  return { nombre, cantidad, unidad: u };
}

// Muestra 1500 g como 1.5 kg
function humanizar(cantidad, unidad) {
  if (unidad === 'g' && cantidad >= 1000) return { cantidad: cantidad / 1000, unidad: 'kg' };
  if (unidad === 'ml' && cantidad >= 1000) return { cantidad: cantidad / 1000, unidad: 'l' };
  return { cantidad, unidad };
}

router.post('/generar', async (req, res) => {
  const [filas] = await db.query(
    `SELECT i.nombre, i.cantidad, i.unidad
     FROM plan_semanal p
     JOIN ingredientes_receta i ON i.receta_id = p.receta_id
     WHERE p.usuario_id = ?`,
    [req.userId]
  );
  if (!filas.length) {
    return res.status(400).json({ error: 'Tu plan semanal está vacío. Asigna recetas primero.' });
  }

  const mapa = new Map();
  for (const f of filas) {
    const n = normalizar(f.nombre.trim().toLowerCase(), f.cantidad, f.unidad);
    const clave = `${n.nombre}|${n.unidad}`;
    const prev = mapa.get(clave);
    if (prev) prev.cantidad += n.cantidad;
    else mapa.set(clave, { ...n });
  }

  const valores = [...mapa.values()].map((n) => {
    const h = humanizar(Math.round(n.cantidad * 100) / 100, n.unidad);
    return [req.userId, n.nombre, h.cantidad, h.unidad];
  });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM lista_compras WHERE usuario_id = ?', [req.userId]);
    await conn.query('INSERT INTO lista_compras (usuario_id, ingrediente, cantidad, unidad) VALUES ?', [valores]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  res.status(201).json({ items: valores.length });
});

router.patch('/:id', validar(z.object({ comprado: z.boolean() })), async (req, res) => {
  const [r] = await db.query('UPDATE lista_compras SET comprado = ? WHERE id = ? AND usuario_id = ?', [
    req.body.comprado ? 1 : 0, req.params.id, req.userId,
  ]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Ítem no encontrado' });
  res.json({ ok: true });
});

router.delete('/', async (req, res) => {
  await db.query('DELETE FROM lista_compras WHERE usuario_id = ?', [req.userId]);
  res.json({ ok: true });
});

module.exports = router;
