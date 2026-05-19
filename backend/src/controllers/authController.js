const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    login: async (req, res) => {
        const { usuario, password } = req.body;

        try {
            // 1. Buscamos al usuario con sus IDs específicos (Árbitro o Asesor)
            // Reutilizamos tu lógica de LEFT JOIN
            const query = `
                SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.nombre_usuario, 
                       u.password_hash, u.rol, u.activo,
                       a.id_arbitro, s.id_asesor
                FROM usuario u
                LEFT JOIN arbitro a ON u.id_usuario = a.id_arbitro
                LEFT JOIN asesor s ON u.id_usuario = s.id_asesor
                WHERE u.nombre_usuario = $1
            `;
            
            const result = await pool.query(query, [usuario.trim()]);

            if (result.rows.length === 0) {
                return res.status(401).json({ message: "Usuario no encontrado" });
            }

            const user = result.rows[0];


            // 2. COMPARACIÓN CON BCRYPT (Asegúrate que el password no tenga espacios)
            const validPassword = await bcrypt.compare(password.trim(), user.password_hash);

            if (!validPassword) {
                console.log("Password incorrecto para:", user.nombre_usuario);
                return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
            }

            // 3. Generar el Token JWT con información de rol e ID
            const token = jwt.sign(
                { 
                    id: user.id_usuario, 
                    rol: user.rol,
                    id_especifico: user.id_asesor || user.id_arbitro || null 
                },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            // 4. Actualizar último login (opcional pero recomendado)
            await pool.query('UPDATE usuario SET ultimo_login = CURRENT_TIMESTAMP WHERE id_usuario = $1', [user.id_usuario]);

            // 5. Respuesta para el Frontend
            res.json({
                success: true,
                user: {
                    id_usuario: user.id_usuario,
                    nombre_usuario: user.nombre_usuario,
                    nombre_completo: `${user.nombre} ${user.apellido_paterno}`,
                    rol: user.rol,
                    id_especifico: user.id_asesor || user.id_arbitro || null
                },
                token
            });

        } catch (error) {
            console.error("ERROR EN LOGIN:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
};

module.exports = authController;