const router = require('express').Router();
const { db, isDemoMode, demo } = require('../models/db');

router.get('/', async (req, res) => {
  try {
    if (isDemoMode()) return res.json(demo.getCrew());
    const { rows } = await db.query(`
      SELECT u.id, u.name, u.role, u.position, u.avatar_url,
        cs.heart_rate, cs.hydration, cs.sleep_hours, cs.location, cs.updated_at AS status_updated_at
      FROM users u
      LEFT JOIN crew_status cs ON cs.user_id = u.id
      WHERE u.role = 'crew'
      ORDER BY u.name
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    if (isDemoMode()) {
      const m = demo.getCrewMember(req.params.id);
      return m ? res.json(m) : res.status(404).json({ error: 'Tripulante não encontrado' });
    }
    const { rows } = await db.query(`
      SELECT u.*, cs.heart_rate, cs.hydration, cs.sleep_hours, cs.location
      FROM users u LEFT JOIN crew_status cs ON cs.user_id = u.id
      WHERE u.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Tripulante não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { name, position, email, location } = req.body;
  if (!name || !position) return res.status(400).json({ error: 'name e position são obrigatórios' });
  try {
    if (isDemoMode()) return res.status(201).json(demo.createCrew({ name, position, email, location }));
    const { rows } = await db.query(
      `INSERT INTO users (id, name, email, role, position) VALUES (gen_random_uuid(),$1,$2,'crew',$3) RETURNING *`,
      [name, email || `${name.toLowerCase().replace(/\s+/g,'.')}@orbit.space`, position]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/status', async (req, res) => {
  const { heart_rate, hydration, sleep_hours, location } = req.body;
  try {
    if (isDemoMode()) return res.json(demo.updateCrewStatus(req.params.id, { heart_rate, hydration, sleep_hours, location }));
    const { rows } = await db.query(`
      INSERT INTO crew_status (user_id, heart_rate, hydration, sleep_hours, location, updated_at)
      VALUES ($1,$2,$3,$4,$5,NOW())
      ON CONFLICT (user_id) DO UPDATE
        SET heart_rate=$2, hydration=$3, sleep_hours=$4, location=$5, updated_at=NOW()
      RETURNING *
    `, [req.params.id, heart_rate, hydration, sleep_hours, location]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
