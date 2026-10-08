const router = require('express').Router();
const { z } = require('zod');
const db = require('../db');
const { validar } = require('../middleware/auth');

const recetaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(150),
  categoria: z.string().trim().min(1).max(50).default('General'),
  pasos: z.string().trim().max(5000).default(''),
  ingredientes: z
    .array(
      z.object({
        nombre: z.string().trim().min(1, 'Ingrediente sin nombre').max(100),
        cantidad: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
        unidad: z.string().trim().min(1).max(20),
      })
    )
    .min(1, 'Agrega al menos un ingrediente'),
});

async function guardarIngredientes(conn, recetaId, ingredientes) {
  await conn.query('DELETE FROM ingredientes_receta WHERE receta_id = ?', [recetaId]);
  const valores = ingredientes.map((i) => [recetaId, i.nombre, i.cantidad, i.unidad]);
  await conn.query('INSERT INTO ingredientes_receta (receta_id, nombre, cantidad, unidad) VALUES ?', [valores]);
}

async function conIngredientes(recetas) {
  if (!recetas.length) return [];
  const ids = recetas.map((r) => r.id);
  const [ings] = await db.query(
    'SELECT id, receta_id, nombre, cantidad, unidad FROM ingredientes_receta WHERE receta_id IN (?)',
    [ids]
  );
  return recetas.map((r) => ({ ...r, ingredientes: ings.filter((i) => i.receta_id === r.id) }));
}

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM recetas WHERE usuario_id = ? ORDER BY nombre', [req.userId]);
  res.json(await conIngredientes(rows));
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM recetas WHERE id = ? AND usuario_id = ?', [req.params.id, req.userId]);
  if (!rows.length) return res.status(404).json({ error: 'Receta no encontrada' });
  res.json((await conIngredientes(rows))[0]);
});

router.post('/', validar(recetaSchema), async (req, res) => {
  const { nombre, categoria, pasos, ingredientes } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO recetas (usuario_id, nombre, categoria, pasos) VALUES (?, ?, ?, ?)',
      [req.userId, nombre, categoria, pasos]
    );
    await guardarIngredientes(conn, r.insertId, ingredientes);
    await conn.commit();
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

router.put('/:id', validar(recetaSchema), async (req, res) => {
  const { nombre, categoria, pasos, ingredientes } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'UPDATE recetas SET nombre = ?, categoria = ?, pasos = ? WHERE id = ? AND usuario_id = ?',
      [nombre, categoria, pasos, req.params.id, req.userId]
    );
    if (!r.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ error: 'Receta no encontrada' });
    }
    await guardarIngredientes(conn, req.params.id, ingredientes);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

router.delete('/:id', async (req, res) => {
  const [r] = await db.query('DELETE FROM recetas WHERE id = ? AND usuario_id = ?', [req.params.id, req.userId]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Receta no encontrada' });
  res.json({ ok: true });
});

module.exports = router;
