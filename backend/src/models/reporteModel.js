const pool = require('../config/db');

const reporteModel = {
    // 1. Obtiene promedios de campo, teóricos y pruebas de un árbitro específico filtrados por año fiscal
    obtenerMetricasCualitativas: async (id_arbitro, anio) => {
        const queryCampo = `
            SELECT 
                ROUND(AVG(ep.nota), 2) as promedio_general,
                ROUND(AVG(ep.criterio_tecnico), 2) as avg_tecnico,
                ROUND(AVG(ep.criterio_fisico), 2) as avg_fisico,
                ROUND(AVG(ep.criterio_actitud), 2) as avg_actitud,
                COUNT(ep.id_evaluacion) as partidos_evaluados
            FROM evaluacion_partido ep
            WHERE ep.id_arbitro = $1 AND EXTRACT(YEAR FROM ep.fecha) = $2
        `;
        
        const queryEscritas = `
            SELECT 
                ROUND(AVG(pe.nota), 2) as avg_pruebas_escritas,
                COUNT(pe.id_pruescrita) as examenes_rendidos
            FROM prueba_escrita pe
            WHERE pe.id_arbitro = $1 AND EXTRACT(YEAR FROM pe.fecha) = $2
        `;

        const queryFisicas = `
            SELECT COUNT(pf.id_prufisica) as pruebas_fisicas_hechas
            FROM prueba_fisica pf
            WHERE pf.id_arbitro = $1 AND EXTRACT(YEAR FROM pf.fecha) = $2
        `;

        const [resCampo, resEscritas, resFisicas] = await Promise.all([
            pool.query(queryCampo, [id_arbitro, anio]),
            pool.query(queryEscritas, [id_arbitro, anio]),
            pool.query(queryFisicas, [id_arbitro, anio])
        ]);

        return {
            promedio_general: resCampo.rows[0]?.promedio_general || '0.00',
            avg_tecnico: resCampo.rows[0]?.avg_tecnico || '0.00',
            avg_fisico: resCampo.rows[0]?.avg_fisico || '0.00',
            avg_actitud: resCampo.rows[0]?.avg_actitud || '0.00',
            partidos_evaluados: resCampo.rows[0]?.partidos_evaluados || '0',
            avg_pruebas_escritas: resEscritas.rows[0]?.avg_pruebas_escritas || '0.00',
            examenes_rendidos: resEscritas.rows[0]?.examenes_rendidos || '0',
            pruebas_fisicas_hechas: resFisicas.rows[0]?.pruebas_fisicas_hechas || '0'
        };
    },

    // 2. Métricas Promedio Consolidadas de toda la liga para la cabecera Global
    obtenerMetricasGlobalesLiga: async (anio) => {
        const query = `
            SELECT 
                ROUND(AVG(nota), 2) as promedio_general,
                ROUND(AVG(criterio_tecnico), 2) as avg_tecnico,
                ROUND(AVG(criterio_fisico), 2) as avg_fisico,
                ROUND(AVG(criterio_actitud), 2) as avg_actitud,
                COUNT(id_evaluacion) as partidos_evaluados
            FROM evaluacion_partido
            WHERE EXTRACT(YEAR FROM fecha) = $1
        `;
        const queryExamenes = `
            SELECT ROUND(AVG(nota), 2) as avg_pruebas_escritas
            FROM prueba_escrita
            WHERE EXTRACT(YEAR FROM fecha) = $1
        `;
        const res = await pool.query(query, [anio]);
        const resEx = await pool.query(queryExamenes, [anio]);
        return {
            promedio_general: res.rows[0]?.promedio_general || '0.00',
            avg_tecnico: res.rows[0]?.avg_tecnico || '0.00',
            avg_fisico: res.rows[0]?.avg_fisico || '0.00',
            avg_actitud: res.rows[0]?.avg_actitud || '0.00',
            partidos_evaluados: res.rows[0]?.partidos_evaluados || '0',
            avg_pruebas_escritas: resEx.rows[0]?.avg_pruebas_escritas || '0.00'
        };
    },

    obtenerEvolucionTemporal: async (id_arbitro, anio) => {
        const query = `
            SELECT fecha, nota, criterio_tecnico as tecnico, criterio_fisico as fisico, criterio_actitud as actitud
            FROM evaluacion_partido
            WHERE id_arbitro = $1 AND EXTRACT(YEAR FROM fecha) = $2
            ORDER BY fecha ASC
        `;
        const res = await pool.query(query, [id_arbitro, anio]);
        return res.rows;
    },

    // 3. Evolución promedio de toda la institución por fecha para el gráfico lineal global
    obtenerEvolucionGlobalLiga: async (anio) => {
        const query = `
            SELECT fecha, 
                   ROUND(AVG(nota), 2) as nota,
                   ROUND(AVG(criterio_tecnico), 2) as tecnico,
                   ROUND(AVG(criterio_fisico), 2) as fisico,
                   ROUND(AVG(criterio_actitud), 2) as actitud
            FROM evaluacion_partido
            WHERE EXTRACT(YEAR FROM fecha) = $1
            GROUP BY fecha
            ORDER BY fecha ASC
        `;
        const res = await pool.query(query, [anio]);
        return res.rows;
    },

    obtenerHistorialEscrito: async (id_arbitro, anio) => {
        const query = `
            SELECT fecha, tema, nota, observacion
            FROM prueba_escrita
            WHERE id_arbitro = $1 AND EXTRACT(YEAR FROM fecha) = $2
            ORDER BY fecha ASC
        `;
        const res = await pool.query(query, [id_arbitro, anio]);
        return res.rows;
    },

    obtenerHistorialFisico: async (id_arbitro, anio) => {
        const query = `
            SELECT pf.fecha, pf.tipo_prueba, pf.agilidad, pf.velocidad, pf.resistencia, pf.observacion,
                   a.categoria, a.especializacion
            FROM prueba_fisica pf
            INNER JOIN arbitro a ON pf.id_arbitro = a.id_arbitro
            WHERE pf.id_arbitro = $1 AND EXTRACT(YEAR FROM pf.fecha) = $2
            ORDER BY pf.fecha ASC
        `;
        const res = await pool.query(query, [id_arbitro, anio]);
        return res.rows;
    },

    // 4. Reporte Global: Trae a los 28 Árbitros del sistema ordenados por jerarquía usando LEFT JOIN
    obtenerTodosLosArbitrosParaReporteGlobal: async (anio) => {
        const query = `
            SELECT 
                u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno,
                a.categoria, a.especializacion as tipo_arbitro,
                COALESCE((SELECT ROUND(AVG(nota), 2) FROM evaluacion_partido WHERE id_arbitro = u.id_usuario AND EXTRACT(YEAR FROM fecha) = $1), 0) as prom_campo,
                COALESCE((SELECT ROUND(AVG(nota), 2) FROM prueba_escrita WHERE id_arbitro = u.id_usuario AND EXTRACT(YEAR FROM fecha) = $1), 0) as prom_escrito,
                (SELECT COUNT(id_prufisica) FROM prueba_fisica WHERE id_arbitro = u.id_usuario AND EXTRACT(YEAR FROM fecha) = $1) as fisicos_hechos
            FROM usuario u
            INNER JOIN arbitro a ON u.id_usuario = a.id_arbitro
            WHERE u.rol = 'arbitro'
            ORDER BY 
                CASE a.categoria
                    WHEN 'FIFA' THEN 1
                    WHEN 'Primera' THEN 2
                    WHEN 'Segunda' THEN 3
                    WHEN 'Tercera' THEN 4
                    WHEN 'Cuarta' THEN 5
                    ELSE 6
                END ASC,
                CASE LOWER(a.especializacion)
                    WHEN 'central' THEN 1
                    WHEN 'asistente' THEN 2
                    ELSE 3
                END ASC,
                u.apellido_paterno ASC
        `;
        const res = await pool.query(query, [anio]);
        return res.rows;
    }
};

module.exports = reporteModel;