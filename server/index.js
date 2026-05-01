const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos (PostgreSQL)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'pescadia',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Inicializar tabla
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS capturas (
        id SERIAL PRIMARY KEY,
        latitude DECIMAL NOT NULL,
        longitude DECIMAL NOT NULL,
        rating INTEGER NOT NULL,
        tags TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Tabla capturas verificada/creada.');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  }
};
initDB();

// Rutas base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Pescadía' });
});

// Endpoint de prueba de conexión a DB
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', serverTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/capturas', async (req, res) => {
  try {
    const { latitude, longitude, rating, tags } = req.body;
    const result = await pool.query(
      'INSERT INTO capturas (latitude, longitude, rating, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [latitude, longitude, rating, tags]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/capturas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM capturas ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
