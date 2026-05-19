// routes/evaluacionRoutes.js
const express = require('express');
const router = express.Router();
const evaluacionController = require('../controllers/evaluacionController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/evaluaciones
 * @desc    Registrar o actualizar la evaluación de un árbitro en un partido (Relación Ternaria)
 * @access  Privado (Administrador, Secretaría, Comisión Disciplinaria, Gestor, Asesor Técnico)
 */
router.post('/evaluaciones', 
    verificarToken, 
    permitirRoles(
        'Administrador', 
        'Secretaría General', 
        'Comisión Disciplinaria', 
        'Gestor de Designaciones', 
        'Asesor Técnico'
    ),
    evaluacionController.registrarEvaluacion
);

/**
 * @route   GET /api/evaluaciones/partido/:id_partido
 * @desc    Obtener todas las evaluaciones realizadas en un partido específico
 * @access  Privado (Cualquier asesor o administrador)
 */
router.get('/evaluaciones/detalles/:id_partido',
    verificarToken,
    permitirRoles(
        'Administrador', 
        'Secretaría General', 
        'Comisión Disciplinaria', 
        'Gestor de Designaciones', 
        'Asesor Técnico'
    ),
    evaluacionController.obtenerEvaluacionesPorPartido
);

module.exports = router;