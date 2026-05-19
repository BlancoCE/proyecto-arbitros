// dashboardController.js
const asistenciaModel = require('../models/asistenciaModel');
const pool = require('../config/db'); // Tu configuración de BD

const getDashboardStats = async (req, res) => {
    try {
        // 1. Totales Activos
        const totalesQuery = `
            SELECT 
                (SELECT COUNT(*) FROM ARBITRO WHERE estado_activo = true) as arbitros_activos,
                (SELECT COUNT(*) FROM ASESOR WHERE estado_activo = true) as asesores_activos
        `;
        
        // 2. Distribución por categoría
        const distribucionQuery = `
            SELECT categoria, genero, COUNT(*) as cantidad 
            FROM ARBITRO 
            WHERE estado_activo = true 
            GROUP BY categoria, genero
        `;

        const [totales, distribucion, alertas] = await Promise.all([
            pool.query(totalesQuery),
            pool.query(distribucionQuery),
            asistenciaModel.getAlertasSancion()
        ]);

        res.json({
            totales: totales.rows[0],
            distribucion: distribucion.rows,
            alertas: alertas // Lista de personas con 8+ faltas
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getDashboardStats };