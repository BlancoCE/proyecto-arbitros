const express = require('express');
const router = express.Router();
const designacionController = require('../controllers/designacionController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.get('/arbitros-disponibles/:id_partido', designacionController.getArbitrosDisponibles);
// Rutas de Gestión (Nivel 1, 2 y 3)
router.post('/partidos/asignar/:id_partido', verificarToken, permitirRoles('Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones'), designacionController.asignarTerna);
router.delete('/partidos/deshacer/:id_partido', verificarToken, permitirRoles('Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones'), designacionController.quitarDesignacion);

// Rutas de Consulta
router.get('/partidos/pendientes', verificarToken, designacionController.getPartidosPendientes);
router.get('/mis-designaciones', verificarToken, permitirRoles('arbitro'), designacionController.getMisDesignaciones);
router.get('/hoja-de-vida', verificarToken, designacionController.getHojaDeVida);

module.exports = router;