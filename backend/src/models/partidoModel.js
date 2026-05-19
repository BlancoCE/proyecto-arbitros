const pool = require('../config/db');

const partidoModel = {
  // NUEVO: Validar si la sede está ocupada (Evita duplicidad lugar/hora/fecha)
  validarSedeDisponible: async (fecha, hora, ubicacion, idExcluir = null) => {
    let sql = `
      SELECT COUNT(*) FROM partido 
      WHERE fecha = $1 AND hora = $2 AND ubicacion = $3 
      AND estado != 'Cancelado'
    `;
    const params = [fecha, hora, ubicacion];

    // Si estamos editando, no debemos contar el partido actual como conflicto
    if (idExcluir) {
      sql += ` AND id_partido != $4`;
      params.push(idExcluir);
    }

    const res = await pool.query(sql, params);
    return parseInt(res.rows[0].count) === 0;
  },

  getOrCreateEquipo: async (nombre) => {
    let result = await pool.query('SELECT id_equipo FROM equipo WHERE nombre = $1', [nombre]);
    if (result.rows.length === 0) {
      result = await pool.query('INSERT INTO equipo (nombre) VALUES ($1) RETURNING id_equipo', [nombre]);
    }
    return result.rows[0].id_equipo;
  },

  insertPartido: async (client, data) => {
    const sql = `
      INSERT INTO partido (fecha, hora, ubicacion, liga, categoria, estado) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id_partido
    `;
    const res = await client.query(sql, [
      data.fecha, data.hora, data.ubicacion, data.liga, data.categoria, data.estado || 'Programado'
    ]);
    return res.rows[0].id_partido;
  },

  insertPlanilla: async (client, id_partido, id_equipo, goles, esVisitante) => {
    const sql = `
      INSERT INTO planilla_juego (id_partido, id_equipo, id_jugador, goles, visitante)
      VALUES ($1, $2, 1, $3, $4) 
    `; 
    return await client.query(sql, [id_partido, id_equipo, goles, esVisitante]);
  },

  getAllPartidos: async () => {
    try {
        // Actualización automática de estado
        await pool.query(`
            UPDATE partido 
            SET estado = 'Finalizado' 
            WHERE estado != 'Finalizado' 
              AND (fecha + hora::time + interval '2 hours') < NOW()
        `);

        const sql = `
            SELECT p.*, 
                (SELECT e.nombre FROM planilla_juego pl JOIN equipo e ON pl.id_equipo = e.id_equipo 
                 WHERE pl.id_partido = p.id_partido AND pl.visitante = false LIMIT 1) as equipo_local,
                (SELECT e.nombre FROM planilla_juego pl JOIN equipo e ON pl.id_equipo = e.id_equipo 
                 WHERE pl.id_partido = p.id_partido AND pl.visitante = true LIMIT 1) as equipo_visitante,
                (SELECT pl.goles FROM planilla_juego pl 
                 WHERE pl.id_partido = p.id_partido AND pl.visitante = false LIMIT 1) as goles_local,
                (SELECT pl.goles FROM planilla_juego pl 
                 WHERE pl.id_partido = p.id_partido AND pl.visitante = true LIMIT 1) as goles_visitante
            FROM partido p
            ORDER BY p.fecha DESC, p.hora ASC
        `;
        const res = await pool.query(sql);
        return res.rows;
    } catch (error) {
        console.error("Error en getAllPartidos:", error);
        throw error;
    }
  },

  deletePartido: async (id) => {
    return await pool.query('DELETE FROM partido WHERE id_partido = $1', [id]);
  },

  updatePartidoBase: async (client, id, data) => {
    const sql = `
      UPDATE partido SET fecha = $1, hora = $2, ubicacion = $3, liga = $4, categoria = $5, estado = $6
      WHERE id_partido = $7
    `;
    return await client.query(sql, [data.fecha, data.hora, data.ubicacion, data.liga, data.categoria, data.estado, id]);
  },

  updatePlanillaGoles: async (client, id_partido, esVisitante, goles) => {
    return await client.query(
      'UPDATE planilla_juego SET goles = $1 WHERE id_partido = $2 AND visitante = $3',
      [goles, id_partido, esVisitante]
    );
  }
};

module.exports = partidoModel;