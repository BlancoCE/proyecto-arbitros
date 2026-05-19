const pool = require('../config/db');

const reporteModel = {
    // Métricas para un árbitro específico
    obtenerMetricasCualitativas: async (id_arbitro) => {
        const query = `
            SELECT 
                ROUND(AVG(nota), 2) as promedio_general,
                ROUND(AVG(criterio_tecnico), 2) as avg_tecnico,
                ROUND(AVG(criterio_fisico), 2) as avg_fisico,
                ROUND(AVG(criterio_actitud), 2) as avg_actitud,
                COUNT(id_evaluacion) as partidos_evaluados
            FROM evaluacion_partido
            WHERE id_arbitro = $1
        `;
        const res = await pool.query(query, [id_arbitro]);
        return res.rows[0];
    },

    // Métricas GLOBALES (Para que el Asesor vea el promedio de toda la liga)
    obtenerMetricasGlobalesLiga: async () => {
        const query = `
            SELECT 
                ROUND(AVG(nota), 2) as promedio_general,
                ROUND(AVG(criterio_tecnico), 2) as avg_tecnico,
                ROUND(AVG(criterio_fisico), 2) as avg_fisico,
                ROUND(AVG(criterio_actitud), 2) as avg_actitud,
                COUNT(id_evaluacion) as partidos_evaluados
            FROM evaluacion_partido
        `;
        const res = await pool.query(query);
        return res.rows[0];
    },

    obtenerEvolucionTemporal: async (id_arbitro) => {
        const query = `
            SELECT fecha, nota, criterio_tecnico as tecnico, criterio_fisico as fisico, criterio_actitud as actitud
            FROM evaluacion_partido
            WHERE id_arbitro = $1
            ORDER BY fecha ASC LIMIT 20
        `;
        const res = await pool.query(query, [id_arbitro]);
        return res.rows;
    },

    // Evolución promedio de toda la institución por fecha
    obtenerEvolucionGlobalLiga: async () => {
        const query = `
            SELECT fecha, 
                   ROUND(AVG(nota), 2) as nota,
                   ROUND(AVG(criterio_tecnico), 2) as tecnico,
                   ROUND(AVG(criterio_fisico), 2) as fisico,
                   ROUND(AVG(criterio_actitud), 2) as actitud
            FROM evaluacion_partido
            GROUP BY fecha
            ORDER BY fecha ASC LIMIT 30
        `;
        const res = await pool.query(query);
        return res.rows;
    },

    obtenerRankingGlobal: async () => {
        const query = `
            SELECT u.nombre, u.apellido_paterno, ROUND(AVG(e.nota), 2) as promedio
            FROM evaluacion_partido e
            JOIN usuario u ON e.id_arbitro = u.id_usuario
            GROUP BY u.id_usuario, u.nombre, u.apellido_paterno
            ORDER BY promedio DESC
        `;
        const res = await pool.query(query);
        return res.rows;
    }
};

module.exports = reporteModel;