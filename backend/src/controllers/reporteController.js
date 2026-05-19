const pool = require('../config/db');
const reporteService = require('../services/reporteService');

const reporteController = {
    getReportePersonalizado: async (req, res) => {
        try {
            let id_destino = req.params.id_arbitro;
            const esArbitro = req.user.rol === 'arbitro';

            if (esArbitro) {
                id_destino = req.user.id;
                const data = await reporteService.generarInformeDetallado(id_destino);
                return res.json(data);
            }

            // Si es Admin/Asesor y no seleccionó a nadie (Mi reporte) -> Ver Global
            if (!id_destino) {
                const dataGlobal = await reporteService.generarInformeGlobalLiga();
                return res.json(dataGlobal);
            }

            // Si seleccionó a alguien específico
            const data = await reporteService.generarInformeDetallado(id_destino);
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "No se pudo generar el reporte" });
        }
    },

    getRankingGeneral: async (req, res) => {
        try {
            const data = await reporteService.obtenerEstadisticasLiga();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    listarArbitrosConReporte: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT DISTINCT 
                    u.id_usuario, 
                    u.nombre, 
                    u.apellido_paterno, 
                    u.apellido_materno, 
                    a.categoria,
                    CASE a.categoria
                        WHEN 'FIFA' THEN 1
                        WHEN 'Primera' THEN 2
                        WHEN 'Segunda' THEN 3
                        WHEN 'Tercera' THEN 4
                        WHEN 'Cuarta' THEN 5
                        ELSE 6
                    END AS orden_jerarquico
                FROM usuario u
                INNER JOIN arbitro a ON u.id_usuario = a.id_arbitro
                INNER JOIN evaluacion_partido e ON u.id_usuario = e.id_arbitro
                WHERE u.rol = 'arbitro'
                ORDER BY orden_jerarquico ASC, u.apellido_paterno ASC
            `);
            res.json(result.rows);
        } catch (error) {
            console.error("ERROR SQL EN LISTAR:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = reporteController;