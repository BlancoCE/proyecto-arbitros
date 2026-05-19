const configuracionModel = require('../models/configuracionModel');
const bcrypt = require('bcryptjs');

const configuracionController = {
    getMiPerfil: async (req, res) => {
        try {
            const id_usuario = req.user.id; // Correcto según authMiddleware
            const perfil = await configuracionModel.obtenerPerfilCompleto(id_usuario);
            
            if (!perfil) return res.status(404).json({ error: "Usuario no encontrado" });

            // Eliminar el hash por seguridad antes de enviar al front
            delete perfil.password_hash;
            
            res.json(perfil);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // IMPLEMENTACIÓN DE CAMBIO DE PASSWORD
    cambiarPassword: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            const { passActual, passNueva } = req.body;

            // 1. Obtener hash actual de la BD
            const credenciales = await configuracionModel.obtenerCredenciales(id_usuario);
            
            // 2. Comparar con bcrypt
            const match = await bcrypt.compare(passActual, credenciales.password_hash);
            if (!match) {
                return res.status(401).json({ error: "La contraseña actual es incorrecta" });
            }

            // 3. Encriptar nueva clave
            const saltRounds = 10;
            const nuevoHash = await bcrypt.hash(passNueva, saltRounds);

            // 4. Actualizar
            await configuracionModel.actualizarPassword(id_usuario, nuevoHash);
            
            res.json({ message: "Contraseña actualizada" });
        } catch (error) {
            res.status(500).json({ error: "Error al cambiar contraseña" });
        }
    },

    updatePerfil: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            // Asegúrate de que el body contenga el 'rol' para que el modelo funcione
            const resultado = await configuracionModel.actualizarPerfil(id_usuario, req.body);
            res.json(resultado);
        } catch (error) {
            res.status(500).json({ error: "No se pudo actualizar el perfil" });
        }
    }
};

module.exports = configuracionController;