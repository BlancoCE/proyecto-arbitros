const pool = require('../config/db');

const listarArbitrosParaPrueba = async () => {
    const query = `
        SELECT 
            u.id_usuario as id_arbitro,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.genero,
            a.categoria,
            a.especializacion,
            a.estado
        FROM ARBITRO a
        JOIN USUARIO u ON a.id_arbitro = u.id_usuario
        WHERE a.estado != 'Inactivo'
        ORDER BY 
            CASE 
                WHEN a.categoria = 'FIFA' THEN 1
                WHEN a.categoria = 'Primera' THEN 2
                WHEN a.categoria = 'Segunda' THEN 3
                WHEN a.categoria = 'Tercera' THEN 4
                WHEN a.categoria = 'Cuarta' THEN 5
                ELSE 9 
            END ASC,
            CASE 
                WHEN a.especializacion = 'Central' THEN 1
                WHEN a.especializacion = 'Asistente' THEN 2
                ELSE 3 
            END ASC,
            u.apellido_paterno ASC;
    `;
    const res = await pool.query(query);
    return res.rows;
};

const insertarResultadoFisico = async (d) => {
    const query = `
        INSERT INTO PRUEBA_FISICA 
        (id_arbitro, tipo_prueba, fecha, url_informe, agilidad, velocidad, resistencia, observacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [d.id_arbitro, d.tipo_prueba, d.fecha, d.url_informe, d.agilidad, d.velocidad, d.resistencia, d.observacion];
    return await pool.query(query, values);
};

const listarCabecerasFisicas = async () => {
    const query = `
        SELECT DISTINCT 
            tipo_prueba, 
            TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, 
            url_informe
        FROM PRUEBA_FISICA
        ORDER BY fecha DESC
    `;
    const res = await pool.query(query);
    return res.rows;
};

const consultarDetallePorPrueba = async (fecha, tipo) => {
    const query = `
        SELECT 
            u.nombre || ' ' || u.apellido_paterno || ' ' || u.apellido_materno as nombre_completo,
            a.categoria,
            a.especializacion,
            pf.agilidad,
            pf.velocidad,
            pf.resistencia,
            pf.observacion
        FROM PRUEBA_FISICA pf
        JOIN ARBITRO a ON pf.id_arbitro = a.id_arbitro
        JOIN USUARIO u ON a.id_arbitro = u.id_usuario
        -- CAMBIO AQUÍ: Convertimos la fecha de la DB a texto para comparar
        WHERE TO_CHAR(pf.fecha, 'YYYY-MM-DD') = $1 AND pf.tipo_prueba = $2
        ORDER BY u.apellido_paterno ASC;
    `;
    const res = await pool.query(query, [fecha, tipo]);
    return res.rows;
};

// NUEVO: Verificar si ya existe una prueba en esa fecha y tipo
const verificarDuplicadoFisico = async (fecha, tipo) => {
    const query = `SELECT COUNT(*) FROM PRUEBA_FISICA WHERE TO_CHAR(fecha, 'YYYY-MM-DD') = $1 AND tipo_prueba = $2`;
    const res = await pool.query(query, [fecha, tipo]);
    return parseInt(res.rows[0].count) > 0;
};

// NUEVO: Obtener la URL del informe para poder borrar el archivo físico
const obtenerUrlInformeFisico = async (fecha, tipo) => {
    const query = `SELECT url_informe FROM PRUEBA_FISICA WHERE TO_CHAR(fecha, 'YYYY-MM-DD') = $1 AND tipo_prueba = $2 LIMIT 1`;
    const res = await pool.query(query, [fecha, tipo]);
    return res.rows[0] ? res.rows[0].url_informe : null;
};

const eliminarPruebaCompleta = async (fecha, tipo) => {
    const query = `DELETE FROM PRUEBA_FISICA WHERE TO_CHAR(fecha, 'YYYY-MM-DD') = $1 AND tipo_prueba = $2`;
    return await pool.query(query, [fecha, tipo]);
};

module.exports = { 
    listarArbitrosParaPrueba, 
    insertarResultadoFisico, 
    listarCabecerasFisicas,
    consultarDetallePorPrueba,
    verificarDuplicadoFisico,
    obtenerUrlInformeFisico,
    eliminarPruebaCompleta 
};