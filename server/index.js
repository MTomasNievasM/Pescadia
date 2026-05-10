const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
// Servir la carpeta de subidas como estática para poder ver las fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Asegurar que la carpeta uploads existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Endpoint de salud para el chivato de conexión
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simulador de base de datos en memoria para cuando falle la real
let memoriaCapturas = [
  {
    id: 1,
    latitude: 36.8340,
    longitude: -2.4637,
    rating: 4,
    tags: ['Lucio', 'Carpas'],
    photo_url: null,
    created_at: new Date()
  },
  {
    id: 2,
    latitude: 36.8400,
    longitude: -2.4500,
    rating: 5,
    tags: ['Black Bass'],
    photo_url: null,
    created_at: new Date()
  }
];

// Configuración de Multer para guardar fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Configuración de la base de datos (PostgreSQL)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'pescadia',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Inicializar tablas
const initDB = async () => {
  try {
    // Tabla de Usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla de Capturas (actualizada)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS capturas (
        id SERIAL PRIMARY KEY,
        latitude DECIMAL NOT NULL,
        longitude DECIMAL NOT NULL,
        rating INTEGER NOT NULL,
        tags TEXT[] NOT NULL,
        photo_url TEXT,
        user_id INTEGER REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Tablas verificadas/creadas correctamente.');
  } catch (err) {
    console.error('Error al inicializar la base de datos (No te preocupes, usaré la memoria):');
  }
};
initDB();

// --- RUTAS DE AUTENTICACIÓN ---

// Registro
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await pool.query(
      'INSERT INTO usuarios (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (Simplificado sin JWT por ahora)
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }
    
    res.json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RUTAS DE CAPTURAS ---

// Subir captura con foto
app.post('/capturas', upload.single('photo'), async (req, res) => {
  try {
    const { latitude, longitude, rating, tags, user_id } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
      // Intentar guardar en Base de Datos
      const result = await pool.query(
        'INSERT INTO capturas (latitude, longitude, rating, tags, photo_url, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [latitude, longitude, rating, tags ? JSON.parse(tags) : [], photo_url, user_id || null]
      );
      res.json(result.rows[0]);
    } catch (dbErr) {
      // Si falla la DB (porque estás en local sin Docker), guardamos en memoria
      console.log('Guardando en memoria (Fallo DB)');
      const nuevaCaptura = {
        id: Date.now(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        rating: parseInt(rating),
        tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? JSON.parse(tags) : []),
        photo_url,
        user_id: user_id ? parseInt(user_id) : null,
        created_at: new Date()
      };
      memoriaCapturas.unshift(nuevaCaptura); // Añadir al principio
      res.json(nuevaCaptura);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las capturas
app.get('/capturas', async (req, res) => {
  try {
    try {
      const result = await pool.query(`
        SELECT c.*, u.username 
        FROM capturas c 
        LEFT JOIN usuarios u ON c.user_id = u.id 
        ORDER BY c.created_at DESC
      `);
      res.json(result.rows);
    } catch (dbErr) {
      // Si falla la DB, devolvemos lo que hay en memoria
      res.json(memoriaCapturas);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', serverTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
