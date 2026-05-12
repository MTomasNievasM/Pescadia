const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pescadia',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

async function check() {
  try {
    const val = await pool.query('SELECT * FROM valoraciones');
    console.log('Valoraciones:', val.rows);
    
    const cap = await pool.query('SELECT id, rating FROM capturas');
    console.log('Capturas:', cap.rows);
    
    const avg = await pool.query('SELECT captura_id, AVG(puntuacion) FROM valoraciones GROUP BY captura_id');
    console.log('Medias:', avg.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
