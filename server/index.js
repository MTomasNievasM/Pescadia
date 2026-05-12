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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Servir la carpeta de subidas como estática para poder ver las fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Asegurar que la carpeta uploads existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}



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
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

// Inicializar tablas
const initDB = async () => {
  try {
    // Tabla de Usuarios
    // Borrar tablas existentes para empezar de cero (Opción B)
    // await pool.query(`
    //   DROP TABLE IF EXISTS capturas CASCADE;
    //   DROP TABLE IF EXISTS usuarios CASCADE;
    // `);

    // Tabla de Usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        display_name TEXT,
        avatar TEXT,
        bio TEXT,
        cover TEXT,
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

    // Tabla de Seguidores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seguidores (
        id SERIAL PRIMARY KEY,
        seguidor_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        seguido_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(seguidor_id, seguido_id)
      )
    `);

    // Tabla de Comentarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        captura_id INTEGER REFERENCES capturas(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        texto TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla de Valoraciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS valoraciones (
        id SERIAL PRIMARY KEY,
        captura_id INTEGER REFERENCES capturas(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(captura_id, user_id)
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
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, display_name } = req.body;
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await pool.query(
      'INSERT INTO usuarios (username, password, email, display_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, display_name, created_at',
      [username, hashedPassword, email, display_name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (Simplificado sin JWT por ahora)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1 OR email = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }
    res.json({ id: user.id, username: user.username, email: user.email, display_name: user.display_name, bio: user.bio, avatar: user.avatar, cover: user.cover });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar perfil
app.put('/api/profile', async (req, res) => {
  try {
    const { username, bio, avatar, display_name, cover } = req.body;
    
    const result = await pool.query(
      'UPDATE usuarios SET bio = $1, avatar = $2, display_name = $3, cover = $4 WHERE username = $5 RETURNING id, username, email, display_name, bio, avatar, cover',
      [bio, avatar, display_name, cover, username]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener perfil público de un usuario y sus stats
app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { current_user_id } = req.query; 
    
    const userResult = await pool.query(
      'SELECT id, username, display_name, bio, avatar, cover, created_at FROM usuarios WHERE username = $1',
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const targetUser = userResult.rows[0];
    
    const followersResult = await pool.query('SELECT COUNT(*) FROM seguidores WHERE seguido_id = $1', [targetUser.id]);
    const followersCount = parseInt(followersResult.rows[0].count);
    
    const followingResult = await pool.query('SELECT COUNT(*) FROM seguidores WHERE seguidor_id = $1', [targetUser.id]);
    const followingCount = parseInt(followingResult.rows[0].count);
    
    const capturesResult = await pool.query('SELECT COUNT(*) FROM capturas WHERE user_id = $1', [targetUser.id]);
    const capturesCount = parseInt(capturesResult.rows[0].count);
    
    let isFollowing = false;
    if (current_user_id) {
      const followCheck = await pool.query(
        'SELECT 1 FROM seguidores WHERE seguidor_id = $1 AND seguido_id = $2',
        [current_user_id, targetUser.id]
      );
      isFollowing = followCheck.rows.length > 0;
    }
    
    res.json({
      ...targetUser,
      followersCount,
      followingCount,
      capturesCount,
      isFollowing
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seguir / Dejar de seguir
app.post('/api/users/:username/follow', async (req, res) => {
  try {
    const { username } = req.params;
    const { current_user_id } = req.body; 
    
    if (!current_user_id) {
      return res.status(400).json({ error: 'Se requiere ID de usuario' });
    }
    
    const targetResult = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario a seguir no encontrado' });
    }
    const targetUserId = targetResult.rows[0].id;
    
    if (current_user_id === targetUserId) {
      return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
    }
    
    const checkResult = await pool.query(
      'SELECT id FROM seguidores WHERE seguidor_id = $1 AND seguido_id = $2',
      [current_user_id, targetUserId]
    );
    
    if (checkResult.rows.length > 0) {
      await pool.query('DELETE FROM seguidores WHERE id = $1', [checkResult.rows[0].id]);
      res.json({ isFollowing: false, message: 'Has dejado de seguir a este usuario' });
    } else {
      await pool.query(
        'INSERT INTO seguidores (seguidor_id, seguido_id) VALUES ($1, $2)',
        [current_user_id, targetUserId]
      );
      res.json({ isFollowing: true, message: 'Ahora sigues a este usuario' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// --- RUTAS DE CAPTURAS ---

// Subir captura con foto
app.post('/api/capturas', upload.single('photo'), async (req, res) => {
  try {
    const { latitude, longitude, rating, tags, user_id } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
      let parsedTags = [];
      if (Array.isArray(tags)) parsedTags = tags;
      else if (typeof tags === 'string') try { parsedTags = JSON.parse(tags); } catch(e) { parsedTags = []; }
      
      // Intentar guardar en Base de Datos
      const result = await pool.query(
        'INSERT INTO capturas (latitude, longitude, rating, tags, photo_url, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [latitude, longitude, rating, parsedTags, photo_url, user_id || null]
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
app.get('/api/capturas', async (req, res) => {
  try {
    try {
      const result = await pool.query(`
        SELECT c.*, u.username, COALESCE(AVG(v.puntuacion), 0) as average_rating
        FROM capturas c 
        LEFT JOIN usuarios u ON c.user_id = u.id 
        LEFT JOIN valoraciones v ON c.id = v.captura_id
        GROUP BY c.id, u.username
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

// --- RUTAS DE COMENTARIOS Y VALORACIONES ---

app.get('/api/capturas/:id/detalles', async (req, res) => {
  try {
    const { id } = req.params;
    const { current_user_id } = req.query;

    const comentariosResult = await pool.query(`
      SELECT c.id, c.texto, c.created_at, u.username as user
      FROM comentarios c
      JOIN usuarios u ON c.user_id = u.id
      WHERE c.captura_id = $1
      ORDER BY c.created_at DESC
    `, [id]);

    const mediaResult = await pool.query(`
      SELECT AVG(puntuacion) as media FROM valoraciones WHERE captura_id = $1
    `, [id]);
    
    let tu_valoracion = 0;
    if (current_user_id) {
      const miValoracionResult = await pool.query(`
        SELECT puntuacion FROM valoraciones WHERE captura_id = $1 AND user_id = $2
      `, [id, current_user_id]);
      if (miValoracionResult.rows.length > 0) {
        tu_valoracion = miValoracionResult.rows[0].puntuacion;
      }
    }

    res.json({
      comentarios: comentariosResult.rows,
      media: mediaResult.rows[0].media ? parseFloat(mediaResult.rows[0].media) : null,
      tu_valoracion
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/capturas/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, texto } = req.body;
    
    if (!user_id || !texto) return res.status(400).json({ error: 'Faltan datos' });

    const result = await pool.query(`
      INSERT INTO comentarios (captura_id, user_id, texto) VALUES ($1, $2, $3) RETURNING *
    `, [id, user_id, texto]);
    
    const userResult = await pool.query('SELECT username FROM usuarios WHERE id = $1', [user_id]);
    const nuevoComentario = {
      ...result.rows[0],
      user: userResult.rows[0].username
    };

    res.json(nuevoComentario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/capturas/:id/valorar', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, puntuacion } = req.body;
    
    if (!user_id || !puntuacion) return res.status(400).json({ error: 'Faltan datos' });

    const result = await pool.query(`
      INSERT INTO valoraciones (captura_id, user_id, puntuacion) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (captura_id, user_id) 
      DO UPDATE SET puntuacion = EXCLUDED.puntuacion
      RETURNING *
    `, [id, user_id, puntuacion]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', async (req, res) => {
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
