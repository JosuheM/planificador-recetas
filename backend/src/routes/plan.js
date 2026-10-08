const router = require('express').Router();
const { z } = require('zod');
const db = require('../db');
const { validar } = require('../middleware/auth');

const slotSchema = z.object({
  dia: z.coerce.number().int().min(0).max(6),
  comida: z.enum(['desayuno', 'almuerzo', 'cena']),
  receta_id: z.coerce.number().int().positive(),
});

router.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.id, p.dia, p.comida, p.receta_id, r.nombre AS receta_nombre
     FROM plan_semanal p JOIN recetas r ON r.id = p.receta_id
     WHERE p.usuario_id = ?`,
    [req.userId]
  );
  res.json(rows);
});

// Asigna (o reemplaza) una receta en un hueco dia+comida
router.put('/', validar(slotSchema), async (req, res) => {
  const { dia, comida, receta_id } = req.body;
  const [own] = await db.query('SELECT id FROM recetas WHERE id = ? AND usuario_id = ?', [receta_id, req.userId]);
  if (!own.length) return res.status(404).json({ error: 'Receta no encontrada' });
  await db.query(
    `INSERT INTO plan_semanal (usuario_id, dia, comida, receta_id) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE receta_id = VALUES(receta_id)`,
    [req.userId, dia, comida, receta_id]
  );
  res.json({ ok: true });
});

router.delete('/', async (req, res) => {
  const dia = Number(req.query.dia);
  const { comida } = req.query;
  if (!Number.isInteger(dia) || !['desayuno', 'almuerzo', 'cena'].includes(comida)) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }
  await db.query('DELETE FROM plan_semanal WHERE usuario_id = ? AND dia = ? AND comida = ?', [req.userId, dia, comida]);
  res.json({ ok: true });
});

module.exports = router;
