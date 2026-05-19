const pool = require('../config/db');

// Obtener cabeceras del historial
const listarCabecerasEscritas = async () => {
    const query = `
        SELECT DISTINCT 
            TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, 
            tema, 
            url_informe_prueba 
        FROM PRUEBA_ESCRITA 
        ORDER BY fecha DESC;
    `;
    const res = await pool.query(query);
    return res.rows;
};

// Insertar resultado individual
const insertarResultadoEscrito = async (datos) => {
    const query = `
        INSERT INTO PRUEBA_ESCRITA (fecha, tema, nota, observacion, id_arbitro, url_informe_prueba)
        VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
        datos.fecha,
        datos.tema,
        datos.nota,
        datos.observacion,
        datos.id_arbitro,
        datos.url_informe_prueba
    ];
    return await pool.query(query, values);
};

// Consultar detalles con jerarquía
const consultarDetalleEscrito = async (fecha, tema) => {
    const query = `
        SELECT 
            u.nombre || ' ' || u.apellido_paterno || ' ' || u.apellido_materno as nombre_completo,
            a.categoria,
            a.especializacion,
            pe.nota as agilidad, -- Reutilizamos nombres de campos para consistencia en tabla frontend si es necesario
            pe.nota, 
            pe.observacion
        FROM PRUEBA_ESCRITA pe
        JOIN ARBITRO a ON pe.id_arbitro = a.id_arbitro
        JOIN USUARIO u ON a.id_arbitro = u.id_usuario
        WHERE TO_CHAR(pe.fecha, 'YYYY-MM-DD') = $1 AND pe.tema = $2
        ORDER BY 
            CASE WHEN a.categoria = 'FIFA' THEN 1
                 WHEN a.categoria = 'Primera' OR a.categoria = '1ra' THEN 2
                 WHEN a.categoria = 'Segunda' OR a.categoria = '2da' THEN 3
                 WHEN a.categoria = 'Tercera' THEN 4
                 WHEN a.categoria = 'Cuarta' THEN 5 ELSE 6 END,
            CASE WHEN a.especializacion = 'Central' THEN 1 ELSE 2 END;
    `;
    const res = await pool.query(query, [fecha, tema]);
    return res.rows;
};

// NUEVO: Verificar duplicados por fecha y tema
const verificarDuplicadoEscrito = async (fecha, tema) => {
    const query = `SELECT COUNT(*) FROM PRUEBA_ESCRITA WHERE TO_CHAR(fecha, 'YYYY-MM-DD') = $1 AND tema = $2`;
    const res = await pool.query(query, [fecha, tema]);
    return parseInt(res.rows[0].count) > 0;
};

// NUEVO: Obtener la URL del archivo antes de eliminar
const obtenerUrlInformeEscrito = async (fecha, tema) => {
    const query = `SELECT url_informe_prueba FROM PRUEBA_ESCRITA WHERE TO_CHAR(fecha, 'YYYY-MM-DD') = $1 AND tema = $2 LIMIT 1`;
    const res = await pool.query(query, [fecha, tema]);
    return res.rows[0] ? res.rows[0].url_informe_prueba : null;
};

const eliminarPruebaEscritaCompleta = async (fecha, tema) => {
    const query = `DELETE FROM PRUEBA_ESCRITA WHERE TO_CHAR(fecha, 'YYYY-MM-DD') = $1 AND tema = $2`;
    return await pool.query(query, [fecha, tema]);
};

module.exports = { 
    listarCabecerasEscritas, 
    insertarResultadoEscrito, 
    consultarDetalleEscrito,
    verificarDuplicadoEscrito,
    obtenerUrlInformeEscrito, 
    eliminarPruebaEscritaCompleta 
};