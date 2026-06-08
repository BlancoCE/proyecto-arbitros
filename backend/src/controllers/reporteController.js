const pool = require('../config/db');
const reporteService = require('../services/reporteService');

const reporteController = {
    getReportePersonalizado: async (req, res) => {
        try {
            let id_destino = req.params.id_arbitro;
            const anio = req.query.anio || new Date().getFullYear();
            const esArbitro = req.user.rol === 'arbitro';

            if (esArbitro) {
                id_destino = req.user.id;
            }

            if (!id_destino) {
                const dataGlobal = await reporteService.generarInformeGlobalLiga(anio);
                return res.json(dataGlobal);
            }

            const dataIndividual = await reporteService.generarInformeDetallado(id_destino, anio);
            return res.json(dataIndividual);
        } catch (error) {
            console.error("Error en getReportePersonalizado:", error);
            return res.status(500).json({ error: "No se pudo procesar el reporte estructurado anual" });
        }
    },

    listarArbitrosConReporte: async (req, res) => {
        try {
            // Explicación del cambio: Usamos una consulta directa sobre la relación usuario-árbitro.
            // Quitamos cualquier subconsulta externa de rendimiento aquí para que no limite el listado.
            // Aseguramos LOWER() en el rol para evitar problemas de mayúsculas/minúsculas.
            const query = `
                SELECT 
                    u.id_usuario, 
                    u.nombre, 
                    u.apellido_paterno, 
                    u.apellido_materno, 
                    a.categoria
                FROM usuario u
                INNER JOIN arbitro a ON u.id_usuario = a.id_arbitro
                WHERE LOWER(u.rol) = 'arbitro' 
                ORDER BY 
                    CASE a.categoria
                        WHEN 'FIFA' THEN 1
                        WHEN 'Primera' THEN 2
                        WHEN 'Segunda' THEN 3
                        WHEN 'Tercera' THEN 4
                        WHEN 'Cuarta' THEN 5
                        ELSE 6
                    END ASC, 
                    u.apellido_paterno ASC, 
                    u.nombre ASC;
            `;
            
            const result = await pool.query(query);
            
            // Registro de depuración en la consola del backend para que verifiques cuántos lee Node.js
            console.log(`[Reportes Back] Árbitros totales encontrados para el selector: ${result.rows.length}`);
            
            return res.json(result.rows);
        } catch (error) {
            console.error("Error crítico en listarArbitrosConReporte:", error);
            return res.status(500).json({ error: "Fallo al obtener la nómina completa de árbitros" });
        }
    }
};

module.exports = reporteController;