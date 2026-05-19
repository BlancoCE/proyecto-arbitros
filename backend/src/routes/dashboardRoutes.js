const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Definir la ruta que el frontend llama con fetch('.../api/dashboard/stats')
router.get('/dashboard/stats', dashboardController.getDashboardStats);

module.exports = router;