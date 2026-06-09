const router = require('express').Router();
const { isDemoMode, demo } = require('../models/db');

// GET /api/v1/resources
router.get('/', (req, res) => {
  if (isDemoMode()) return res.json(demo.getResources());
  res.json([]);
});

// GET /api/v1/resources/weather
router.get('/weather', (req, res) => {
  if (isDemoMode()) return res.json(demo.getWeather());
  res.json({});
});

// GET /api/v1/resources/mission
router.get('/mission', (req, res) => {
  if (isDemoMode()) return res.json(demo.getMissionInfo());
  res.json({});
});

module.exports = router;
