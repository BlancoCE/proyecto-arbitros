const express = require('express');
const router = express.Router();
const sancionController = require('../controllers/sancionController');
const upload = require('../../uploadConfig');

router.get('/sancion/arbitros-jerarquia', sancionController.getArbitrosJerarquia);
router.get('/sancion', sancionController.getSanciones);
router.post('/sancion', upload.single('url_sancion'), sancionController.crearSancion);
router.put('/sancion/:id', upload.single('url_sancion'), sancionController.actualizarSancion);
router.delete('/sancion/:id', sancionController.eliminarSancion);
router.get('/sancion/verificar/:id', sancionController.verificarSancion);

module.exports = router;