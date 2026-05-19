const pool = require('../config/db');

const userModel = {
  // Para el Login
  findUserWithRoles: async (usuario, password) => {
    const query = `
      SELECT u.id_usuario, u.nombre_usuario, u.nombre, u.apellido_paterno,
             u.password_hash, u.activo, u.rol, a.id_arbitro, s.id_asesor
      FROM usuario u
      LEFT JOIN arbitro a ON u.id_usuario = a.id_arbitro
      LEFT JOIN asesor s ON u.id_usuario = s.id_asesor
      WHERE u.nombre_usuario = $1 AND u.password_hash = $2
    `;
    const result = await pool.query(query, [usuario, password]);
    return result.rows[0];
  },

  updateLastLogin: async (id_usuario) => {
    return await pool.query(
      'UPDATE usuario SET ultimo_login = CURRENT_TIMESTAMP WHERE id_usuario = $1',
      [id_usuario]
    );
  },

  checkExistingUser: async (ci, nombre_usuario) => {
    const res = await pool.query(
      'SELECT rol FROM usuario WHERE ci = $1 OR nombre_usuario = $2',
      [ci, nombre_usuario]
    );
    return res.rows[0];
  },

  insertUser: async (client, data) => {
    const sql = `
      INSERT INTO usuario (
        nombre_usuario, password_hash, ci, nombre, apellido_paterno, apellido_materno, 
        email, telefono, genero, foto, fecha_nacimiento, rol, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id_usuario
    `;
    const res = await client.query(sql, [
      data.nombre_usuario, data.password, data.ci, data.nombre, 
      data.apellido_paterno, data.apellido_materno || '', data.email, 
      data.telefono, data.genero, data.foto, data.fecha_nacimiento, 
      data.rol, data.activo
    ]);
    return res.rows[0].id_usuario;
  },
  
  // NUEVO: Buscar por nombre para el proceso de Login
  findUserByUsername: async (usuario) => {
    const query = `
      SELECT u.*, a.id_arbitro, s.id_asesor
      FROM usuario u
      LEFT JOIN arbitro a ON u.id_usuario = a.id_arbitro
      LEFT JOIN asesor s ON u.id_usuario = s.id_asesor
      WHERE u.nombre_usuario = $1
    `;
    const result = await pool.query(query, [usuario]);
    return result.rows[0];
  },

  // ACTUALIZADO: Filtrar al asesor actual
  findAllAsesores: async (id_excluir) => {
    const sql = `
      SELECT a.id_asesor, u.id_usuario, u.nombre_usuario, u.ci, u.nombre, u.apellido_paterno, 
             u.apellido_materno, u.email, u.telefono, u.genero, u.foto, u.fecha_nacimiento, u.activo,
             CASE WHEN u.activo = TRUE THEN 'Activo' ELSE 'Inactivo' END as estado, u.rol
      FROM asesor a
      INNER JOIN usuario u ON a.id_asesor = u.id_usuario
      WHERE u.id_usuario != $1 -- <--- EXCLUIMOS AL ASESOR QUE INICIÓ SESIÓN
      ORDER BY a.id_asesor DESC`;
    const res = await pool.query(sql, [id_excluir]);
    return res.rows;
  },

  findAllArbitros: async () => {
    const sql = `
      SELECT 
        u.id_usuario, u.nombre_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.ci, 
        u.foto, u.genero, u.email, u.telefono, u.fecha_nacimiento,
        a.id_arbitro, a.categoria, a.especializacion, 
        a.estado -- <--- Este es el estado dinámico (Activo, Suspendido, En Licencia)
      FROM ARBITRO a
      INNER JOIN USUARIO u ON a.id_arbitro = u.id_usuario
      ORDER BY u.apellido_paterno ASC`;
    const res = await pool.query(sql);
    return res.rows;
  },

  // OBTENER IDS VINCULADOS
  findUserIdByAsesorId: async (id_asesor) => {
    const res = await pool.query('SELECT id_asesor FROM asesor WHERE id_asesor = $1', [id_asesor]);
    return res.rows[0]?.id_asesor;
  },

  findUserIdByArbitroId: async (id_arbitro) => {
    const res = await pool.query('SELECT id_arbitro FROM arbitro WHERE id_arbitro = $1', [id_arbitro]);
    return res.rows[0]?.id_arbitro;
  },

  // ACTUALIZAR
  updateUsuario: async (client, data) => {
    let foto_sql = '';
    let params = [data.nombre_usuario, data.rol, data.activo, data.ci, data.nombre, 
                  data.apellido_paterno, data.apellido_materno, data.email, 
                  data.telefono, data.genero, data.fecha_nacimiento, data.id_usuario];
    
    if (data.foto) {
      foto_sql = ', foto = $13';
      params.push(data.foto);
    }

    const sql = `
      UPDATE usuario SET 
        nombre_usuario = $1, rol = $2, Activo = $3, ci = $4, nombre = $5, 
        apellido_paterno = $6, apellido_materno = $7, email = $8, 
        telefono = $9, genero = $10, fecha_nacimiento = $11
        ${foto_sql}
      WHERE id_usuario = $12`;
    return await client.query(sql, params);
  },

  updateAsesorData: async (client, id_asesor, data) => {
    const sql = `UPDATE asesor SET estado = $1 WHERE id_asesor = $2`;
    return await client.query(sql, [data.estado, id_asesor]);
  },

  updateArbitroData: async (client, id_arbitro, data) => {
    const sql = `UPDATE arbitro SET categoria = $1, especializacion = $2, estado = $3 WHERE id_arbitro = $4`;
    return await client.query(sql, [data.categoria, data.especializacion, data.estado, id_arbitro]);
  },

  // ELIMINAR
  deleteUsuario: async (db, id_usuario) => {
    return await db.query('DELETE FROM usuario WHERE id_usuario = $1', [id_usuario]);
  },

  getDashboardTotales: async () => {
    const sql = `
      SELECT 
        (SELECT COUNT(*)::INT FROM arbitro WHERE UPPER(TRIM(estado)) = 'ACTIVO') as arbitros_activos,
        (SELECT COUNT(*)::INT FROM asesor WHERE UPPER(TRIM(estado)) = 'ACTIVO') as asesores_activos
    `;
    const res = await pool.query(sql);
    // CAMBIO AQUÍ: Retornamos res.rows[0] para que sea un objeto directo { ... }
    return res.rows[0]; 
  },

  getArbitrosDistribucion: async () => {
    const sql = `
      SELECT a.categoria, u.genero, COUNT(*)::INT as cantidad
      FROM arbitro a
      INNER JOIN usuario u ON a.id_arbitro = u.id_usuario
      GROUP BY a.categoria, u.genero
      ORDER BY a.categoria, u.genero
    `;
    const res = await pool.query(sql);
    return res.rows; // Retorna el array de categorías
  },

  limpiarEstadosGlobales: async () => {
      const client = await pool.connect();
      try {
          await client.query('BEGIN');

          // 1. REANUDAR SANCIONES CONGELADAS (Art. 12)
          // Buscamos árbitros cuya licencia terminó ayer y deben cumplir días restantes
          const vencidos = await client.query(`
              SELECT id_arbitro, dias_restantes_sancion 
              FROM licencia 
              WHERE fecha_fin = CURRENT_DATE - INTERVAL '1 day' 
                AND congelo_sancion = TRUE 
                AND dias_restantes_sancion > 0
          `);

          for (const lic of vencidos.rows) {
              await client.query(`
                  INSERT INTO SANCION (id_arbitro, fecha_inicio, fecha_fin, tipo_sancion, motivo, estado, id_asesor)
                  VALUES ($1, CURRENT_DATE, CURRENT_DATE + ($2 || ' days')::interval, 
                          'Reanudación Art. 12', 'Cumplimiento de días pendientes tras licencia', 'Activa', 1)
              `, [lic.id_arbitro, lic.dias_restantes_sancion]);
              
              await client.query(`UPDATE licencia SET dias_restantes_sancion = 0 WHERE id_arbitro = $1`, [lic.id_arbitro]);
          }

          // 2. ACTUALIZACIÓN GLOBAL DE ESTADOS
          // Habilitar a los que ya no tienen ni sanciones ni licencias vigentes
          await client.query(`
              UPDATE ARBITRO 
              SET estado = 'Activo' 
              WHERE id_arbitro NOT IN (
                  -- Sanciones vigentes
                  SELECT id_arbitro FROM SANCION 
                  WHERE (CURRENT_DATE >= fecha_inicio AND (fecha_fin IS NULL OR CURRENT_DATE <= fecha_fin))
                  
                  UNION
                  
                  -- Licencias vigentes (ajustado para manejar NULL en fecha_fin)
                  SELECT id_arbitro FROM licencia 
                  WHERE CURRENT_DATE >= fecha_inicio AND (fecha_fin IS NULL OR CURRENT_DATE <= fecha_fin)
              ) 
              -- Solo reactivamos si el árbitro no está en "Inactivo" por baja administrativa
              AND estado IN ('Suspendido', 'En Licencia', 'Sancionado')
          `);

          // 3. ASEGURAR ESTADO 'En Licencia'
          await client.query(`
              UPDATE ARBITRO SET estado = 'En Licencia'
              WHERE id_arbitro IN (
                  SELECT id_arbitro FROM licencia 
                  WHERE CURRENT_DATE >= fecha_inicio AND (fecha_fin IS NULL OR CURRENT_DATE <= fecha_fin)
              )
              AND estado != 'Inactivo'
          `);

          await client.query('COMMIT');
      } catch (e) {
          await client.query('ROLLBACK');
          throw e;
      } finally {
          client.release();
      }
  },

  findUserByEmail: async (email) => {
    const res = await pool.query(
      'SELECT id_usuario, nombre, email FROM usuario WHERE email = $1',
      [email]
    );
    return res.rows[0];
  },

  setResetToken: async (id_usuario, token, expires) => {
    return await pool.query(
      'UPDATE usuario SET reset_token = $1, reset_token_expires = $2 WHERE id_usuario = $3',
      [token, expires, id_usuario]
    );
  },

  validateResetToken: async (token) => {
    const res = await pool.query(
      `SELECT id_usuario FROM usuario 
       WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP`,
      [token]
    );
    return res.rows[0];
  },

  updatePasswordWithToken: async (id_usuario, newPasswordHash) => {
    return await pool.query(
      `UPDATE usuario 
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL 
       WHERE id_usuario = $2`,
      [newPasswordHash, id_usuario]
    );
  }

}

module.exports = userModel;