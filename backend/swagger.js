const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API Colegio de Árbitros',
    version: '1.0.0',
    description: 'Documentación estructural automática de los endpoints de la plataforma web',
  },
  host: 'api-colegio-arbitros.onrender.com', // Mantén el host de tu Render
  schemes: ['https'],
};

const outputFile = './swagger-output.json'; // Archivo que se va a generar

// Ponemos './index.js' porque ahí es donde Express carga app.use('/api', ...)
const routesFiles = ['./index.js']; 

// Esta función lee tus rutas y genera el JSON automáticamente
swaggerAutogen(outputFile, routesFiles, doc);