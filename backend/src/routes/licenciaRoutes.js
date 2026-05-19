const express = require('express');
const router = express.Router();
const licenciaController = require('../controllers/licenciaController');
const upload = require('../../uploadConfig');

router.get('/licencias/arbitros-habilitados', licenciaController.getArbitros);
router.get('/licencias/licencias-lista', licenciaController.getLicencias);
router.post('/licencias/registrar',upload.single('url_carta'), licenciaController.crear);
router.put('/licencias/:id', upload.single('url_carta'), licenciaController.actualizar);
router.delete('/licencias/eliminar/:id', licenciaController.eliminar);

module.exports = router;