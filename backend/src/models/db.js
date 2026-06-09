const { Pool } = require('pg');
const demo = require('./demoStore');

let pool = null;
let useDemo = true;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  pool.connect()
    .then(client => { client.release(); useDemo = false; console.log('  Banco:       PostgreSQL (Supabase)'); })
    .catch(() => { pool = null; useDemo = true; console.log('  Banco:       Demo em memória (sem DATABASE_URL)'); });
} else {
  console.log('  Banco:       Demo em memória (sem DATABASE_URL)');
}

module.exports = {
  isDemoMode: () => useDemo,
  demo,
  db: {
    query: (sql, params) => {
      if (useDemo) throw new Error('DEMO_MODE');
      return pool.query(sql, params);
    },
  },
};
