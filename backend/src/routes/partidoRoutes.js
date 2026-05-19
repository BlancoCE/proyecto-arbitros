const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');

router.get('/equipos-sugeridos', partidoController.getEquiposSugeridos);
router.get('/partidos', partidoController.getPartidos);
router.post('/partidos', partidoController.createPartido);
router.put('/partidos/:id', partidoController.updatePartido);
router.delete('/partidos/:id', partidoController.deletePartido);

module.exports = router;