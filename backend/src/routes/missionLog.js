const router = require('express').Router();
const { db, isDemoMode, demo } = require('../models/db');

router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    if (isDemoMode()) return res.json(demo.getMissionLog(limit));
    const { rows } = await db.query(
      `SELECT ml.*, u.name AS user_name, u.role AS user_role
       FROM mission_log ml LEFT JOIN users u ON ml.user_id=u.id
       ORDER BY ml.created_at DESC LIMIT $1`, [limit]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
