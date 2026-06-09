const router = require('express').Router();
const { db, isDemoMode, demo } = require('../models/db');

router.get('/', async (req, res) => {
  try {
    if (isDemoMode()) return res.json(demo.getAlerts(req.query));
    const { category, severity } = req.query;
    let q = `SELECT a.*, u.name AS created_by_name, r.name AS resolved_by_name
             FROM alerts a LEFT JOIN users u ON a.created_by=u.id LEFT JOIN users r ON a.resolved_by=r.id
             WHERE a.resolved_at IS NULL`;
    const p = [];
    if (category) { p.push(category); q += ` AND a.category=$${p.length}`; }
    if (severity) { p.push(severity); q += ` AND a.severity=$${p.length}`; }
    q += ' ORDER BY a.severity DESC, a.created_at DESC';
    const { rows } = await db.query(q, p);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { title, description, category, severity } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'title e category obrigatórios' });
  try {
    if (isDemoMode()) return res.status(201).json(demo.createAlert(req.user.id, { title, description, category, severity }));
    const { rows } = await db.query(
      `INSERT INTO alerts (title, description, category, severity, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [title, description, category, severity || 'warning', req.user.id]
    );
    await db.query(`INSERT INTO mission_log (event_type, description, user_id, metadata) VALUES ($1,$2,$3,$4)`,
      ['alert_created', `Alerta ${severity || 'warning'}: ${title}`, req.user.id, JSON.stringify({ category, severity })]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/resolve', async (req, res) => {
  try {
    if (isDemoMode()) {
      const a = demo.resolveAlert(req.params.id, req.user.id);
      return a ? res.json(a) : res.status(404).json({ error: 'Alerta não encontrado' });
    }
    const { rows } = await db.query(
      `UPDATE alerts SET resolved_by=$1, resolved_at=NOW() WHERE id=$2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Alerta não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
