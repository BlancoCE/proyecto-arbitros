const sancionService = require('../services/sancionService');

const sancionController = {
    crearSancion: async (req, res) => {
        try {
            const data = req.body;
            // Si Multer subió un archivo, guardamos la ruta
            if (req.file) {
                data.url_resolucion = `/uploads/sanciones/${req.file.filename}`;
            }
            const nueva = await sancionService.aplicarSancion(data);
            res.status(201).json(nueva);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    actualizarSancion: async (req, res) => {
        try {
            const data = req.body;
            if (req.file) {
                data.url_resolucion = `/uploads/sanciones/${req.file.filename}`;
            }
            const actualizada = await sancionService.editarSancion(req.params.id, data);
            res.json(actualizada);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getSanciones: async (req, res) => {
        try {
            const sanciones = await sancionService.obtenerListadoSanciones();
            res.json(sanciones);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener listado' });
        }
    },

    eliminarSancion: async (req, res) => {
        try {
            await sancionService.borrarSancion(req.params.id);
            res.json({ message: 'Sanción eliminada con éxito' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getArbitrosJerarquia: async (req, res) => {
        try {
            const arbitros = await sancionService.obtenerArbitrosParaSancion();
            res.json(arbitros);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener árbitros' });
        }
    },

    verificarSancion: async (req, res) => {
        try {
            const { id } = req.params;
            const sancion = await sancionService.verificarSancionExistente(id);
            res.json(sancion); // Retornará la sanción o null
        } catch (error) {
            res.status(500).json({ error: 'Error al verificar sanción' });
        }
    }
};

module.exports = sancionController;