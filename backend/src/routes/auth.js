const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const db = require('../db');
const { validar } = require('../middleware/auth');

const registroSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es muy corto').max(100),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

const firmar = (u) =>
  jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/registro', validar(registroSchema), async (req, res) => {
  const { nombre, email, password } = req.body;
  const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existe.length) return res.status(409).json({ error: 'Ese email ya está registrado' });
  const hash = await bcrypt.hash(password, 10);
  const [r] = await db.query(
    'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
    [nombre, email, hash]
  );
  const user = { id: r.insertId, nombre, email };
  res.status(201).json({ token: firmar(user), user });
});

router.post('/login', validar(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash))) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }
  res.json({ token: firmar(u), user: { id: u.id, nombre: u.nombre, email: u.email } });
});

module.exports = router;
