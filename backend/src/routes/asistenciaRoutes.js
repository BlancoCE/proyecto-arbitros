const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');

router.get('/asistencia/arbitros-asistencia', asistenciaController.listarArbitros);
// Ruta para registrar la lista masiva del día
router.post('/asistencia/registrar', asistenciaController.registrar);

// Ruta para obtener el historial por rango de fechas
// Ejemplo: /api/asistencia/historial?inicio=2024-01-01&fin=2024-01-31
router.get('/asistencia/historial', asistenciaController.historial);
router.get('/asistencia/resumen-faltas', asistenciaController.obtenerResumen);
router.get('/asistencia/detalle-faltas/:id', asistenciaController.detalleFaltas);
router.put('/asistencia/justificar', asistenciaController.justificar);

module.exports = router;