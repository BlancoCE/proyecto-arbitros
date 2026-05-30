require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

// === NUEVA CONFIGURACIÓN DE SWAGGER (AUTOMÁTICA Y SEGURA) ===
const swaggerUi = require('swagger-ui-express');
// Importamos el JSON que generó 'swagger-autogen'
const swaggerSpec = require('./swagger-output.json'); 

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
  crossOriginResourcePolicy: { policy: "cross-origin" } 
}));
app.disable('x-powered-by');

const allowedOrigins = [
  'https://colegio-arbitros-lapaz.vercel.app', 
  'http://localhost:5173' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === ENDPOINTS DE SWAGGER QUE UTILIZARÁ OWASP ZAP ===
// Interface visual por si quieres revisarla en el navegador
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta que OWASP ZAP va a leer (Ahora mandará el JSON con todos los PATHS llenos)
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// Las fotos de perfil las dejamos públicas para que los avatars carguen libremente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// RUTAS CENTRALIZADAS
app.use('/api', userRoutes);    
app.use('/api', partidoRoutes); 
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
app.use('/api', reporteRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Ocurrió un error interno en el servidor.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Documentación de Swagger disponible en http://localhost:${PORT}/api-docs`);
  console.log(`JSON estructurado disponible en http://localhost:${PORT}/api-docs-json`);
});

module.exports = app;