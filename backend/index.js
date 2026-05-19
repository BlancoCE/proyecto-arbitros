require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importamos las rutas
const userRoutes = require('./src/routes/userRoutes');
const partidoRoutes = require('./src/routes/partidoRoutes');
const asistenciaRoutes = require('./src/routes/asistenciaRoutes');
const pruebasFisicasRoutes = require('./src/routes/pruebasFisicasRoutes');
const pruebasEscritasRoutes = require('./src/routes/pruebasEscritasRoutes');
const sancionRoutes = require('./src/routes/sancionRoutes');
const licenciaRoutes = require('./src/routes/licenciaRoutes');
const designacionRoutes = require('./src/routes/designacionRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const authRoutes = require('./src/routes/authRoutes');
const evaluacionRoutes = require('./src/routes/evaluacionRoutes');
const configuracionRoutes = require('./src/routes/configuracionRoutes');
const reporteRoutes = require('./src/routes/reporteRoutes');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// RUTAS CENTRALIZADAS
app.use('/api', userRoutes);    // Maneja /api/login, /api/asesores, /api/arbitros
app.use('/api', partidoRoutes); // Maneja /api/partidos, /api/equipos-sugeridos
app.use('/api', asistenciaRoutes);
app.use('/api', pruebasFisicasRoutes);
app.use('/api', pruebasEscritasRoutes);
app.use('/api', sancionRoutes);
app.use('/api', licenciaRoutes);
app.use('/api', designacionRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', authRoutes);
app.use('/api', evaluacionRoutes);
app.use('/api', configuracionRoutes);
app.use('/api', reporteRoutes)

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error detectado:", err.message);
  res.status(500).json({ success: false, message: err.message || "Error interno del servidor" });
});


app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});