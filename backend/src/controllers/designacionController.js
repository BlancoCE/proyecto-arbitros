const designacionService = require('../services/designacionService');

const designacionController = {
    getPartidosPendientes: async (req, res) => {
        try {
            const partidos = await designacionService.obtenerPartidosParaDesignar();
            res.json(partidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getArbitrosDisponibles: async (req, res) => {
        try {
            // Capturamos el id del partido actual desde la URL
            const { id_partido } = req.params; 
            
            if (!id_partido) {
                return res.status(400).json({ error: "El ID del partido es requerido para filtrar disponibilidad." });
            }

            const arbitros = await designacionService.obtenerArbitrosAptos(id_partido);
            res.json(arbitros);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    asignarTerna: async (req, res) => {
        try {
            const { id_partido } = req.params;
            if (!req.user) return res.status(401).json({ error: "Token inválido" });
            const resultado = await designacionService.registrarDesignacion(id_partido, req.body);
            res.json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    quitarDesignacion: async (req, res) => {
        try {
            const { id_partido } = req.params;
            await designacionService.eliminarDesignacion(id_partido);
            res.json({ message: 'Designación eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getMisDesignaciones: async (req, res) => {
        try {
            // req.user viene del middleware verificarToken
            const id_usuario = req.user.id; 
            
            if (!id_usuario) {
                return res.status(401).json({ error: "No se encontró identificación de usuario en el token." });
            }

            const designaciones = await designacionService.obtenerDesignacionesPorArbitro(id_usuario);
            res.json(designaciones);
        } catch (error) {
            console.error("Error en getMisDesignaciones:", error);
            res.status(500).json({ error: error.message });
        }
    },

    getHojaDeVida: async (req, res) => {
        try {
            const data = await designacionModel.obtenerEstadisticasYEvaluaciones(req.user.id);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = designacionController;