const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { db, isDemoMode, demo } = require('../models/db');

function sign(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email e senha obrigatórios' });

  try {
    if (isDemoMode()) {
      // Demo: aceita qualquer senha para os usuários demo
      const user = demo.getUserByEmail(email);
      if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
      const payload = { id: user.id, name: user.name, role: user.role, position: user.position };
      return res.json({ token: sign(payload), user: payload });
    }

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });
    const payload = { id: user.id, name: user.name, role: user.role, position: user.position };
    res.json({ token: sign(payload), user: payload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, position, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });

  try {
    if (isDemoMode()) {
      const existing = demo.getUserByEmail(email);
      if (existing) return res.status(409).json({ error: 'E-mail já cadastrado' });
      const user = demo.createUser({ name, email, password, position, role });
      const payload = { id: user.id, name: user.name, role: user.role, position: user.position };
      return res.status(201).json({ token: sign(payload), user: payload });
    }
    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) return res.status(409).json({ error: 'E-mail já cadastrado' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (id, name, email, password, role, position) VALUES (gen_random_uuid(),$1,$2,$3,$4,$5) RETURNING id,name,email,role,position`,
      [name, email, hash, role || 'crew', position || 'Mission Specialist']
    );
    const user = rows[0];
    const payload = { id: user.id, name: user.name, role: user.role, position: user.position };
    res.status(201).json({ token: sign(payload), user: payload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/auth/demo-login (sem banco, sem senha)
router.post('/demo-login', (req, res) => {
  if (process.env.NODE_ENV === 'production')
    return res.status(404).json({ error: 'Not found' });

  const { role = 'control' } = req.body;
  const users = {
    control: { id: 'u-control', name: 'Control Houston', role: 'control', position: 'Mission Control' },
    crew:    { id: 'u-sarah',   name: 'Cmd. Sarah Chen', role: 'crew',    position: 'Commander' },
  };
  const user = users[role] || users.control;
  res.json({ token: sign(user), user });
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado. Descarte o token no cliente.' });
});

module.exports = router;
