const pool = require('../config/db');

const sancionModel = {
    listarArbitrosJerarquicos: async () => {
        const query = `
            SELECT 
                a.id_arbitro, 
                u.nombre, 
                u.apellido_paterno, 
                u.apellido_materno,
                a.categoria,
                a.especializacion
            FROM ARBITRO a
            INNER JOIN USUARIO u ON a.id_arbitro = u.id_usuario
            WHERE --u.activo = true AND
                u.nombre_usuario != 'Admin' -- Filtro de seguridad para no traer al admin
            ORDER BY 
                CASE 
                    WHEN UPPER(a.categoria) = 'FIFA' THEN 1
                    WHEN UPPER(a.categoria) = 'PRIMERA' THEN 2
                    WHEN UPPER(a.categoria) = 'SEGUNDA' THEN 3
                    WHEN UPPER(a.categoria) = 'TERCERA' THEN 4
                    WHEN UPPER(a.categoria) = 'CUARTA' THEN 5
                    ELSE 6
                END ASC,
                u.apellido_paterno ASC;
        `;
        const res = await pool.query(query);
        return res.rows;
    },

    crear: async (data) => {
        const query = `
            INSERT INTO SANCION (fecha_inicio, fecha_fin, motivo, tipo_sancion, estado, id_asesor, id_arbitro, url_resolucion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
        const values = [
            data.fecha_inicio, 
            data.fecha_fin || null, 
            data.motivo, 
            data.tipo_sancion, 
            data.estado, 
            data.id_asesor, 
            data.id_arbitro,
            data.url_resolucion || null // Nueva columna
        ];
        const res = await pool.query(query, values);
        return res.rows[0];
    },

    actualizar: async (id, data) => {
        const query = `
            UPDATE SANCION 
            SET id_arbitro = $1, fecha_inicio = $2, fecha_fin = $3, 
                motivo = $4, tipo_sancion = $5, estado = $6, url_resolucion = $7
            WHERE id_sancion = $8 RETURNING *`;
        const values = [
            data.id_arbitro, 
            data.fecha_inicio, 
            data.fecha_fin || null, 
            data.motivo, 
            data.tipo_sancion, 
            data.estado, 
            data.url_resolucion, // Nueva columna
            id
        ];
        const res = await pool.query(query, values);
        return res.rows[0];
    },

    eliminar: async (id) => {
        const query = `DELETE FROM SANCION WHERE id_sancion = $1`;
        await pool.query(query, [id]);
        return true;
    },

    obtenerUrlResolucion: async (id) => {
        const query = `SELECT url_resolucion FROM SANCION WHERE id_sancion = $1`;
        const res = await pool.query(query, [id]);
        return res.rows[0]?.url_resolucion;
    },

    // Función para actualizar el estado del árbitro en la tabla ARBITRO
    actualizarEstadoArbitro: async (id_arbitro, nuevoEstado) => {
        await pool.query('UPDATE ARBITRO SET estado = $1 WHERE id_arbitro = $2', [nuevoEstado, id_arbitro]);
    },

    listarSancionesCompleto: async () => {
        const query = `
            SELECT 
                s.*, 
                u.nombre || ' ' || u.apellido_paterno || ' ' || COALESCE(u.apellido_materno, '') as nombre_completo,
                a.categoria
            FROM SANCION s
            JOIN ARBITRO a ON s.id_arbitro = a.id_arbitro
            JOIN USUARIO u ON a.id_arbitro = u.id_usuario
            ORDER BY s.fecha_inicio DESC`;
        const res = await pool.query(query);
        return res.rows;
    },

    // Restablece a 'Activo' a los árbitros que NO tengan sanciones vigentes hoy
    restablecerEstadosArbitros: async () => {
        const query = `
            UPDATE ARBITRO 
            SET estado = 'Activo' 
            WHERE id_arbitro NOT IN (
                SELECT id_arbitro 
                FROM SANCION 
                WHERE CURRENT_DATE >= fecha_inicio 
                AND (fecha_fin IS NULL OR CURRENT_DATE <= fecha_fin)
            ) AND estado IN ('Suspendido', 'Inactivo', 'Sancionado');
        `;
        return await pool.query(query);
    },

    verificarSancionActiva: async (id_arbitro) => {
        const sql = `
        SELECT id_sancion, tipo_sancion, fecha_fin, 
                (fecha_fin - CURRENT_DATE) as dias_restantes
        FROM SANCION 
        WHERE id_arbitro = $1 
            AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
            AND (fecha_fin IS NOT NULL)
        LIMIT 1`;
        const res = await pool.query(sql, [id_arbitro]);
        return res.rows[0];
    },

};

module.exports = sancionModel;