const express = require('express');
const router = express.Router();
const licenciaController = require('../controllers/licenciaController');
const upload = require('../../uploadConfig');

// Middleware intermedio para capturar errores de Multer de forma segura
const uploadCartaHandler = (req, res, next) => {
  const uploadSingle = upload.single('url_carta');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      // Si es un error provocado por el fileFilter o tamaño de Multer, respondemos de forma segura
      return res.status(400).json({ error: err.message || "Error al procesar el archivo subido." });
    }
    next();
  });
};

router.get('/licencias/arbitros-habilitados', licenciaController.getArbitros);
router.get('/licencias/licencias-lista', licenciaController.getLicencias);
router.post('/licencias/registrar',upload.single('url_carta'), licenciaController.crear);
router.put('/licencias/:id', upload.single('url_carta'), licenciaController.actualizar);
router.delete('/licencias/eliminar/:id', licenciaController.eliminar);

module.exports = router;