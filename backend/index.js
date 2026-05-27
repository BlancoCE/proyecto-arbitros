require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

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

const { verificarToken } = require('./src/middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permite que el frontend cargue tus imágenes/archivos
}));
app.disable('x-powered-by');

const allowedOrigins = [
  'http://localhost:5173', // Tu entorno de desarrollo local (Vite)
  'https://proyecto-arbitros-b1xi.vercel.app' // Reemplaza con tu URL real de producción en Vercel
];

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (ej. Postman o llamadas internas del servidor)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acceso denegado por políticas de CORS (Colegio de Árbitros La Paz)'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 3. PROTECCIÓN Y SEGMENTACIÓN DE ARCHIVOS ESTÁTICOS
// Las fotos de perfil las dejamos públicas para que los avatars carguen libremente
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
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Ocurrió un error interno en el servidor.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 4. ESCUCHA CONDICIONAL DEL PUERTO (Solución Local vs Vercel)
// Vercel inyecta automáticamente variables de entorno globales. Si no estamos en Vercel, corre el listen local.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Servidor local corriendo de forma segura en: http://localhost:${PORT}`);
  });
}

// Exportación requerida para que las Serverless Functions de Vercel controlen el ciclo de vida de la API
module.exports = app;