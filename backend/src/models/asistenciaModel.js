const pool = require('../config/db');

const asistenciaModel = {
    listarParaAsistencia: async () => {
        const query = `
            SELECT 
                a.id_arbitro, 
                u.nombre, 
                u.apellido_paterno, 
                u.apellido_materno,
                a.categoria,
                a.especializacion,
                -- Obtenemos la licencia solo si está vigente hoy
                (SELECT l.tipo FROM LICENCIA l 
                WHERE l.id_arbitro = a.id_arbitro 
                AND CURRENT_DATE BETWEEN l.fecha_inicio AND COALESCE(l.fecha_fin, CURRENT_DATE)
                LIMIT 1) as licencia_activa
            FROM ARBITRO a
            INNER JOIN USUARIO u ON a.id_arbitro = u.id_usuario
            WHERE --u.activo = true AND
                u.nombre_usuario != 'Admin'
            -- REGLA: Solo desaparecen los que tienen licencia de tipo 'Indefinida'
            AND NOT EXISTS (
                SELECT 1 FROM LICENCIA l2 
                WHERE l2.id_arbitro = a.id_arbitro 
                AND UPPER(l2.tipo) = 'INDEFINIDA'
            )
            -- REGLA: Los inhabilitados desaparecen (Si manejas ese estado en u.estado o a.estado)
            AND UPPER(a.estado) != 'INHABILITADO'
            ORDER BY 
                CASE 
                    WHEN UPPER(TRIM(a.categoria)) = 'FIFA' THEN 1
                    WHEN UPPER(TRIM(a.categoria)) IN ('PRIMERA', '1RA') THEN 2
                    WHEN UPPER(TRIM(a.categoria)) IN ('SEGUNDA', '2DA') THEN 3
                    WHEN UPPER(TRIM(a.categoria)) IN ('TERCERA', '3RA') THEN 4
                    WHEN UPPER(TRIM(a.categoria)) IN ('CUARTA', '4TA') THEN 5
                    ELSE 6
                END ASC,
                u.apellido_paterno ASC;
        `;
        const res = await pool.query(query);
        return res.rows;
    },

    // Registrar asistencia masiva
    registrarAsistencia: async (id_arbitro, fecha, hora_entrada, tipo_actividad, estado) => {
        // Si la hora viene vacía (Falta/Licencia), enviamos 00:00 para cumplir con el NOT NULL
        const horaValida = (hora_entrada && hora_entrada !== "") ? hora_entrada : "00:00:00";
        
        // El campo justificado es false por defecto según tu tabla
        const justificado = (estado === 'Licencia');

        const sql = `
            INSERT INTO asistencia (id_arbitro, fecha, hora_entrada, tipo_actividad, estado, justificado)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id_arbitro, fecha, tipo_actividad) 
            DO UPDATE SET 
                hora_entrada = EXCLUDED.hora_entrada,
                estado = EXCLUDED.estado,
                justificado = EXCLUDED.justificado;
        `;
        
        const values = [id_arbitro, fecha, horaValida, tipo_actividad, estado, justificado];
        return await pool.query(sql, values);
    },

    // Obtener historial tipo matriz
    getHistorial: async (fechaInicio, fechaFin) => {
        const sql = `
            SELECT 
                a.id_asistencia, 
                a.fecha, 
                a.estado, 
                a.tipo_actividad,
                -- Concatenación de nombre completo
                CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) as nombre_completo,
                u.nombre,
                u.apellido_paterno,
                arb.id_arbitro,
                arb.categoria,
                arb.especializacion
            FROM asistencia a
            JOIN arbitro arb ON a.id_arbitro = arb.id_arbitro
            JOIN usuario u ON arb.id_arbitro = u.id_usuario
            WHERE a.fecha BETWEEN $1 AND $2
            ORDER BY a.fecha DESC, u.apellido_paterno ASC
        `;
        const res = await pool.query(sql, [fechaInicio, fechaFin]);
        return res.rows;
    },

    // Reporte de resumen de faltas para el Art. 7
    getResumenFaltas: async () => {
        const sql = `
            SELECT 
                arb.id_arbitro,
                u.nombre, 
                u.apellido_paterno, 
                CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) as nombre_completo,
                arb.categoria,
                arb.especializacion, -- Campo vital para tus nuevos filtros del frontend
                COUNT(CASE WHEN a.estado = 'Falta' AND a.justificado = false THEN 1 END) as total_faltas,
                COUNT(CASE WHEN a.estado = 'Retraso' THEN 1 END) as total_retrasos
            FROM ARBITRO arb
            JOIN USUARIO u ON arb.id_arbitro = u.id_usuario
            LEFT JOIN ASISTENCIA a ON arb.id_arbitro = a.id_arbitro
            GROUP BY arb.id_arbitro, u.nombre, u.apellido_paterno, u.apellido_materno, arb.categoria, arb.especializacion
            ORDER BY total_faltas DESC;
        `;
        const res = await pool.query(sql);
        return res.rows;
    },

    justificarFalta: async (id_asistencia, motivo) => {
        // Usamos el motivo como comentario o simplemente marcamos true
        const sql = `
            UPDATE ASISTENCIA 
            SET justificado = true, estado = 'Licencia'
            WHERE id_asistencia = $1
        `;
        await pool.query(sql, [id_asistencia]);
    },
    
    getDetalleFaltas: async (id_arbitro) => {
        const sql = `
            SELECT id_asistencia, fecha, tipo_actividad 
            FROM ASISTENCIA 
            WHERE id_arbitro = $1 AND estado = 'Falta' AND justificado = false
            ORDER BY fecha DESC
        `;
        const res = await pool.query(sql, [id_arbitro]);
        return res.rows;
    },

    // Actualizar la falta a justificada
    justificarFalta: async (id_asistencia) => {
        const sql = `
            UPDATE ASISTENCIA 
            SET justificado = true, estado = 'Licencia' 
            WHERE id_asistencia = $1
        `;
        return await pool.query(sql, [id_asistencia]);
    },

    // Obtener solo árbitros que deben ser sancionados (>= 10 faltas)
    getAlertasSancion: async () => {
        const sql = `
            SELECT 
                u.id_usuario,
                CONCAT(u.nombre, ' ', u.apellido_paterno) as nombre_completo,
                arb.categoria,
                COUNT(a.id_asistencia) as total_faltas,
                CASE 
                    WHEN COUNT(a.id_asistencia) >= 10 THEN 'SANCION'
                    WHEN COUNT(a.id_asistencia) >= 8 THEN 'ADVERTENCIA'
                    ELSE 'OK'
                END as nivel_alerta
            FROM ARBITRO arb
            JOIN USUARIO u ON arb.id_arbitro = u.id_usuario
            JOIN ASISTENCIA a ON arb.id_arbitro = a.id_arbitro
            WHERE a.estado = 'Falta' AND a.justificado = false
            GROUP BY u.id_usuario, u.nombre, u.apellido_paterno, arb.categoria
            HAVING COUNT(a.id_asistencia) >= 8
            ORDER BY total_faltas DESC;
        `;
        const res = await pool.query(sql);
        return res.rows;
    }
};

module.exports = asistenciaModel;