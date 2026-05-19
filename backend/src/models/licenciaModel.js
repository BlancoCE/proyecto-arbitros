const pool = require('../config/db');

const licenciaModel = {
    listarArbitros: async () => {
        const query = `
            SELECT a.id_arbitro, u.nombre, u.apellido_paterno, u.apellido_materno, a.categoria
            FROM ARBITRO a
            INNER JOIN USUARIO u ON a.id_arbitro = u.id_usuario
            WHERE --u.activo = true AND 
                u.nombre_usuario != 'Admin'
            ORDER BY 
                CASE 
                    WHEN TRIM(UPPER(a.categoria)) = 'FIFA' THEN 1
                    WHEN TRIM(UPPER(a.categoria)) LIKE 'PRIMERA%' THEN 2
                    WHEN TRIM(UPPER(a.categoria)) LIKE 'SEGUNDA%' THEN 3
                    WHEN TRIM(UPPER(a.categoria)) LIKE 'TERCERA%' THEN 4
                    ELSE 5 
                END ASC, u.apellido_paterno ASC;`;
        return (await pool.query(query)).rows;
    },

    obtenerUrlCarta: async (id) => {
        const res = await pool.query('SELECT url_carta FROM licencia WHERE id_licencia = $1', [id]);
        return res.rows[0] ? res.rows[0].url_carta : null;
    },

    crear: async (d) => {
        const query = `INSERT INTO licencia (id_arbitro, fecha_inicio, fecha_fin, tipo, motivo, congelo_sancion, url_carta) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        const values = [d.id_arbitro, d.fecha_inicio, d.fecha_fin, d.tipo, d.motivo, d.congelo_sancion || false, d.url_carta];
        const res = await pool.query(query, values);
        return res.rows[0];
    },

    actualizar: async (id, d) => {
        const query = `
            UPDATE licencia 
            SET fecha_inicio = $1, fecha_fin = $2, tipo = $3, motivo = $4, congelo_sancion = $5, url_carta = COALESCE($6, url_carta)
            WHERE id_licencia = $7
            RETURNING *`;
        const values = [d.fecha_inicio, d.fecha_fin, d.tipo, d.motivo, d.congelo_sancion, d.url_carta, id];
        const res = await pool.query(query, values);
        return res.rows[0];
    },

    eliminar: async (id) => {
        await pool.query('DELETE FROM licencia WHERE id_licencia = $1', [id]);
    },

    listarTodo: async () => {
        const query = `
            SELECT l.*, u.nombre, u.apellido_paterno, u.apellido_materno,
                   (u.nombre || ' ' || u.apellido_paterno || ' ' || u.apellido_materno) as nombre_completo, a.categoria
            FROM licencia l
            JOIN ARBITRO a ON l.id_arbitro = a.id_arbitro
            JOIN USUARIO u ON a.id_arbitro = u.id_usuario
            ORDER BY l.fecha_inicio DESC`;
        const res = await pool.query(query);
        return res.rows;
    },

    verificarSolapamiento: async (id_arbitro, fecha_inicio, fecha_fin, id_licencia_actual = null) => {
        // Definimos un fin infinito si es null para la comparación lógica
        const fin = fecha_fin || '9999-12-31';

        let query = `
            SELECT COUNT(*) 
            FROM licencia 
            WHERE id_arbitro = $1 
            AND (
                (fecha_inicio <= $2 AND (fecha_fin IS NULL OR fecha_fin >= $2)) OR
                (fecha_inicio <= $3 AND (fecha_fin IS NULL OR fecha_fin >= $3)) OR
                ($2 <= fecha_inicio AND ($3 IS NULL OR $3 >= fecha_inicio))
            )
        `;
        const params = [id_arbitro, fecha_inicio, fin];

        // Si pasamos un ID, lo excluimos (es una edición)
        if (id_licencia_actual) {
            query += ` AND id_licencia != $4`;
            params.push(id_licencia_actual);
        }

        const res = await pool.query(query, params);
        return parseInt(res.rows[0].count) > 0;
    }
};

module.exports = licenciaModel;