const router = require('express').Router();
const { db, isDemoMode, demo } = require('../models/db');

router.get('/', async (req, res) => {
  try {
    if (isDemoMode()) return res.json(demo.getTasks(req.query));
    const { status, assignee, priority } = req.query;
    let q = `SELECT t.*, a.name AS assignee_name, c.name AS created_by_name
             FROM tasks t LEFT JOIN users a ON t.assignee_id=a.id LEFT JOIN users c ON t.created_by=c.id WHERE 1=1`;
    const p = [];
    if (status)   { p.push(status);   q += ` AND t.status=$${p.length}`; }
    if (assignee) { p.push(assignee); q += ` AND t.assignee_id=$${p.length}`; }
    if (priority) { p.push(priority); q += ` AND t.priority=$${p.length}`; }
    q += ' ORDER BY t.priority, t.created_at DESC';
    const { rows } = await db.query(q, p);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { title, description, assignee_id, priority, due_at } = req.body;
  if (!title) return res.status(400).json({ error: 'title obrigatório' });
  try {
    if (isDemoMode()) return res.status(201).json(demo.createTask(req.user.id, { title, description, assignee_id, priority, due_at }));
    const { rows } = await db.query(
      `INSERT INTO tasks (title, description, assignee_id, created_by, priority, due_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description, assignee_id, req.user.id, priority || 'p2', due_at]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { status, priority, title, description, assignee_id } = req.body;
  try {
    if (isDemoMode()) {
      const t = demo.updateTask(req.params.id, { status, priority, title, description, assignee_id }, req.user.id);
      return t ? res.json(t) : res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    const { rows } = await db.query(
      `UPDATE tasks SET status=COALESCE($1,status), priority=COALESCE($2,priority),
       title=COALESCE($3,title), description=COALESCE($4,description),
       assignee_id=COALESCE($5,assignee_id), updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [status, priority, title, description, assignee_id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Tarefa não encontrada' });
    if (status === 'done') {
      await db.query(`INSERT INTO mission_log (event_type, description, user_id) VALUES ($1,$2,$3)`,
        ['task_completed', `Tarefa concluída: ${rows[0].title}`, req.user.id]);
    }
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/comments', async (req, res) => {
  try {
    if (isDemoMode()) return res.json(demo.getComments(req.params.id));
    const { rows } = await db.query(
      `SELECT tc.*, u.name AS user_name FROM task_comments tc JOIN users u ON tc.user_id=u.id WHERE tc.task_id=$1 ORDER BY tc.created_at`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/comments', async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text obrigatório' });
  try {
    if (isDemoMode()) return res.status(201).json(demo.addComment(req.params.id, req.user.id, text.trim()));
    const { rows } = await db.query(
      `INSERT INTO task_comments (task_id, user_id, text) VALUES ($1,$2,$3) RETURNING *`,
      [req.params.id, req.user.id, text.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
