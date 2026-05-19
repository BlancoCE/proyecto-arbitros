const express = require('express');
const router = express.Router();
const pfController = require('../controllers/pruebasFisicasController');
const upload = require('../../uploadConfig');

// Endpoint para obtener árbitros ya filtrados y ordenados
router.get('/pruebas-fisicas/arbitros-habilitados', pfController.getArbitrosParaPrueba);

// Endpoint para guardar la prueba física
router.post('/pruebas-fisicas/registrar', upload.single('url_informe'), pfController.registrarPruebaFisica);

// Endpoint para el historial
router.get('/pruebas-fisicas/historial', pfController.getHistorial);
router.get('/pruebas-fisicas/detalle', pfController.getDetallePrueba);
router.delete('/pruebas-fisicas/eliminar', pfController.eliminarPrueba);

module.exports = router;