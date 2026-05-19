const express = require('express');
const router = express.Router();
const peController = require('../controllers/pruebasEscritasController');
const upload = require('../../uploadConfig');

// Registro con subida de archivo (Multer detectará que es PDF y lo enviará a /informes)
router.post('/pruebas-escritas/registrar', upload.single('url_informe_prueba'), peController.registrar);

router.get('/pruebas-escritas/historial', peController.getHistorial);
router.get('/pruebas-escritas/detalle', peController.getDetalle);
router.delete('/pruebas-escritas/eliminar', peController.eliminar);

module.exports = router;