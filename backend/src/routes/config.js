const router = require('express').Router();

// Mecânica orbital simulada: distância Terra-Marte varia entre ~56M e ~401M km
// Velocidade da luz: 299792 km/s
// Período orbital de Marte: ~687 dias
const LIGHT_SPEED_KM_S = 299792;
const MARS_SYNODIC_PERIOD_MS = 779.94 * 24 * 3600 * 1000; // ~780 dias em ms
const MISSION_START = Date.now() - (47 * 88620000); // Sol 47

function getOrbitalData() {
  const phase = ((Date.now() - MISSION_START) % MARS_SYNODIC_PERIOD_MS) / MARS_SYNODIC_PERIOD_MS;
  // Distância oscila de 56M km (oposição) a 401M km (conjunção)
  const distanceKm = 56000000 + (401000000 - 56000000) * (0.5 - 0.5 * Math.cos(2 * Math.PI * phase));
  const oneWaySec = distanceKm / LIGHT_SPEED_KM_S;
  const oneWayMin = oneWaySec / 60;
  const roundTripMin = oneWayMin * 2;
  return {
    distance_km: Math.round(distanceKm),
    distance_AU: +(distanceKm / 149597870.7).toFixed(3),
    one_way_sec: Math.round(oneWaySec),
    one_way_min: +oneWayMin.toFixed(1),
    round_trip_min: +roundTripMin.toFixed(1),
    orbital_phase: +phase.toFixed(4),
    signal_quality: oneWayMin < 8 ? 'excellent' : oneWayMin < 14 ? 'good' : oneWayMin < 18 ? 'degraded' : 'critical',
  };
}

function formatDelay(ms) {
  if (ms < 1000)    return `${ms}ms`;
  if (ms < 60000)   return `${(ms/1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.round(ms/60000)}min`;
  return `${(ms/3600000).toFixed(1)}h`;
}

router.get('/latency', (req, res) => {
  const ms = parseInt(process.env.MARS_DELAY_MS) || 0;
  res.json({ delayMs: ms, delayLabel: formatDelay(ms), orbital: getOrbitalData() });
});

router.put('/latency', (req, res) => {
  const { delayMs } = req.body;
  if (typeof delayMs !== 'number' || delayMs < 0)
    return res.status(400).json({ error: 'delayMs deve ser número >= 0' });
  process.env.MARS_DELAY_MS = String(delayMs);
  res.json({ delayMs, delayLabel: formatDelay(delayMs), orbital: getOrbitalData() });
});

router.get('/orbital', (req, res) => {
  res.json(getOrbitalData());
});

module.exports = router;
