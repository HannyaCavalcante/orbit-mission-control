const router = require('express').Router();
const { db, isDemoMode, demo } = require('../models/db');

router.get('/', async (req, res) => {
  try {
    if (isDemoMode()) return res.json(demo.getMessages(req.query));
    const { from, to, status } = req.query;
    let q = `SELECT m.*, s.name AS sender_name, s.role AS sender_role, r.name AS receiver_name, r.role AS receiver_role
             FROM messages m LEFT JOIN users s ON m.sender_id=s.id LEFT JOIN users r ON m.receiver_id=r.id WHERE 1=1`;
    const p = [];
    if (from)   { p.push(from);   q += ` AND m.sender_id=$${p.length}`; }
    if (to)     { p.push(to);     q += ` AND m.receiver_id=$${p.length}`; }
    if (status) { p.push(status); q += ` AND m.status=$${p.length}`; }
    q += ' ORDER BY m.sent_at DESC';
    const { rows } = await db.query(q, p);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { receiver_id, content, priority } = req.body;
  if (!receiver_id || !content)
    return res.status(400).json({ error: 'receiver_id e content obrigatórios' });
  try {
    if (isDemoMode()) return res.status(201).json(demo.createMessage(req.user.id, { receiver_id, content, priority }));
    const { rows } = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, content, priority, status)
       VALUES ($1,$2,$3,$4,'sent') RETURNING *`,
      [req.user.id, receiver_id, content, priority || 'normal']
    );
    await db.query(`INSERT INTO mission_log (event_type, description, user_id) VALUES ($1,$2,$3)`,
      ['message_sent', `Mensagem enviada para receiver ${receiver_id}`, req.user.id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/ack', async (req, res) => {
  try {
    if (isDemoMode()) {
      const m = demo.ackMessage(req.params.id);
      return m ? res.json(m) : res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    const { rows } = await db.query(
      `UPDATE messages SET status='delivered', delivered_at=NOW() WHERE id=$1 RETURNING *`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Mensagem não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    if (isDemoMode()) {
      const m = demo.readMessage(req.params.id);
      return m ? res.json(m) : res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    const { rows } = await db.query(
      `UPDATE messages SET status='read', read_at=NOW() WHERE id=$1 RETURNING *`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Mensagem não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
