const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../../uploadConfig'); // Ajusta la ruta según donde esté
const { verificarToken } = require('../middlewares/authMiddleware');

// Auth & Registro inicial

router.post('/usuarios/asesores', upload.single('foto'), userController.registerAsesor);
router.post('/usuarios/arbitros', upload.single('foto'), userController.registerArbitro);

// Listado
router.get('/usuarios/asesores', verificarToken, userController.getAsesores);
router.get('/usuarios/arbitros', userController.getArbitros);

// Actualización (Botones de Editar)
router.put('/usuarios/asesores/:id', upload.single('foto'), userController.updateAsesor);
router.put('/usuarios/arbitros/:id', upload.single('foto'), userController.updateArbitro);

// Eliminación (Botones de Eliminar)
router.delete('/usuarios/asesores/:id', userController.deleteAsesor);
router.delete('/usuarios/arbitros/:id', userController.deleteArbitro);

router.get('/dashboard/stats', userController.getDashboardStats);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router;