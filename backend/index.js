const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Configuración de conexión a tu PostgreSQL
const pool = new Pool({
  user: 'postgres', // tu usuario de postgres
  host: 'localhost',
  database: 'colegio_arbitros', 
  password: '123456',
  port: 5432,
});

// Endpoint para validar el Login

app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    // 1. Buscamos al usuario por nombre_usuario o email (más flexible)
    const queryBusqueda = `
      SELECT id_usuario, nombre_usuario, email, rol, estado 
      FROM usuario 
      WHERE nombre_usuario = $1 AND password_hash = $2 AND estado = 'activo'
    `;
    
    const result = await pool.query(queryBusqueda, [usuario, password]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // 2. ACTUALIZACIÓN: Registramos el último login en la BD
      await pool.query(
        'UPDATE usuario SET ultimo_login = CURRENT_TIMESTAMP WHERE id_usuario = $1',
        [user.id_usuario]
      );

      // 3. Enviamos los datos al frontend
      res.json({ 
        success: true, 
        user: {
          id: user.id_usuario,
          nombre: user.nombre_usuario,
          rol: user.rol,
          email: user.email
        }
      });
    } else {
      res.status(401).json({ message: "Credenciales incorrectas o cuenta inactiva" });
    }
  } catch (err) {
    console.error("Error en DB:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.listen(3001, () => console.log("Servidor corriendo en puerto 3001"));

// ... (Configuración de Express y Pool de Postgres)

// backend/index.js

app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body; // Estos vienen del frontend

  try {
    // CAMBIO AQUÍ: Usamos nombre_usuario
    const query = `
      SELECT id_usuario, nombre_usuario, nombre_completo, rol 
      FROM usuario
      WHERE nombre_usuario = $1 
      AND password_hash = $2 
      AND estado = TRUE
    `;
    
    const result = await pool.query(query, [usuario, password]);

    if (result.rows.length > 0) {
      // Si lo encuentra, enviamos los datos del usuario al frontend
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});