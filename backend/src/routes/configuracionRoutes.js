const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Obtener datos actuales
router.get('/configuracion/perfil', verificarToken, configuracionController.getMiPerfil);

// Actualizar datos
router.put('/configuracion/actualizar', verificarToken, configuracionController.updatePerfil);
router.put('/configuracion/cambiar-password', verificarToken, configuracionController.cambiarPassword);

module.exports = router;