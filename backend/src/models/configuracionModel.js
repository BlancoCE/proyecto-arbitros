const pool = require('../config/db');

const configuracionModel = {
    // Obtener perfil detallado
    obtenerPerfilCompleto: async (id_usuario) => {
        const query = `
            SELECT 
                u.id_usuario, u.nombre_usuario, u.ci, u.nombre, 
                u.apellido_paterno, u.apellido_materno, u.email, 
                u.telefono, u.genero, u.foto, u.fecha_nacimiento, u.fecha_registro, u.rol,
                a.categoria, a.especializacion, a.estado as estado_arbitro,
                ase.estado as estado_asesor
            FROM usuario u
            LEFT JOIN arbitro a ON u.id_usuario = a.id_arbitro
            LEFT JOIN asesor ase ON u.id_usuario = ase.id_asesor
            WHERE u.id_usuario = $1
        `;
        const res = await pool.query(query, [id_usuario]);
        return res.rows[0];
    },

    // Actualización atómica con Transacción
    actualizarPerfil: async (id_usuario, datos) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Actualizar tabla USUARIO
            const userQuery = `
                UPDATE usuario SET 
                    nombre_usuario = $1, ci = $2, nombre = $3, 
                    apellido_paterno = $4, apellido_materno = $5, 
                    email = $6, telefono = $7, fecha_nacimiento = $8,
                    foto = $9, genero = $10
                WHERE id_usuario = $11
                RETURNING *;
            `;
            const userValues = [
                datos.nombre_usuario, datos.ci, datos.nombre, 
                datos.apellido_paterno, datos.apellido_materno, 
                datos.email, datos.telefono, datos.fecha_nacimiento,
                datos.foto, datos.genero, id_usuario
            ];
            await client.query(userQuery, userValues);

            // 2. Si el rol es árbitro, actualizar especialización si se permite
            if (datos.rol === 'arbitro') {
                await client.query(
                    'UPDATE arbitro SET especializacion = $1 WHERE id_arbitro = $2',
                    [datos.especializacion, id_usuario]
                );
            }

            await client.query('COMMIT');
            return { success: true, message: "Perfil actualizado correctamente" };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    obtenerCredenciales: async (id_usuario) => {
        const res = await pool.query('SELECT password_hash FROM usuario WHERE id_usuario = $1', [id_usuario]);
        return res.rows[0];
    },

    actualizarPassword: async (id_usuario, nuevoHash) => {
        return await pool.query('UPDATE usuario SET password_hash = $1 WHERE id_usuario = $2', [nuevoHash, id_usuario]);
    }
};

module.exports = configuracionModel;