const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const latency    = require('./src/middleware/latency');
const auth       = require('./src/middleware/auth');

const authRoutes       = require('./src/routes/auth');
const crewRoutes       = require('./src/routes/crew');
const messageRoutes    = require('./src/routes/messages');
const taskRoutes       = require('./src/routes/tasks');
const alertRoutes      = require('./src/routes/alerts');
const configRoutes     = require('./src/routes/config');
const missionLogRoutes = require('./src/routes/missionLog');
const resourceRoutes   = require('./src/routes/resources');

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) cb(null, true);
    else cb(null, true); // permite tudo em dev
  },
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => res.json({
  status: 'ok', project: 'ORBIT',
  marsDelayMs: parseInt(process.env.MARS_DELAY_MS) || 0,
  timestamp: new Date().toISOString(),
}));

// Públicas
app.use('/api/v1/auth', authRoutes);

// Config e recursos rápidos (auth, sem delay de Marte)
app.use('/api/v1/config',    auth, configRoutes);
app.use('/api/v1/resources', auth, resourceRoutes);

// Rotas com delay de Marte + auth
app.use(latency);
app.use(auth);
app.use('/api/v1/crew',         crewRoutes);
app.use('/api/v1/messages',     messageRoutes);
app.use('/api/v1/tasks',        taskRoutes);
app.use('/api/v1/alerts',       alertRoutes);
app.use('/api/v1/mission-log',  missionLogRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`\n◉  ORBIT API iniciada`);
  console.log(`   Porta:       ${PORT}`);
  console.log(`   Delay Marte: ${process.env.MARS_DELAY_MS || 0}ms`);
  console.log(`   Ambiente:    ${process.env.NODE_ENV || 'development'}`);
});
