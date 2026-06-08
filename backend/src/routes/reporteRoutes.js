const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.get('/reportes/desempeno', verificarToken, reporteController.getReportePersonalizado);
router.get('/reportes/desempeno/:id_arbitro', verificarToken, reporteController.getReportePersonalizado);
router.get(
    '/reportes/lista-arbitros', 
    verificarToken, 
    permitirRoles('Administrador', 'Secretaría General', 'Comisión Disciplinaria', 'Gestor de Designaciones', 'Asesor Técnico'), 
    reporteController.listarArbitrosConReporte
);

module.exports = router;