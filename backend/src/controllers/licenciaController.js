const licenciaService = require('../services/licenciaService');
const licenciaModel = require('../models/licenciaModel');
const fs = require('fs');
const path = require('path');

const licenciaController = {
    getArbitros: async (req, res) => {
        try {
            const data = await licenciaModel.listarArbitros();
            res.json(data);
        } catch (e) { res.status(500).json({ error: e.message }); }
    },

    crear: async (req, res) => {
        let url_carta = req.file ? `../../uploads/licencias/${req.file.filename}` : null;
        try {
            const data = { ...req.body, url_carta };
            const nueva = await licenciaService.registrarLicencia(data);
            res.status(201).json(nueva);
        } catch (e) {
            // LIMPIEZA: Si hay error (como solape), borramos el archivo que Multer acaba de subir
            if (req.file) {
                const rutaFallida = path.join(__dirname, '../../uploads/licencias', req.file.filename);
                if (fs.existsSync(rutaFallida)) fs.unlinkSync(rutaFallida);
            }

            const errorMsg = e.message === "SOLAPE" 
                ? "El árbitro ya tiene una licencia registrada en esas fechas." 
                : e.message;
            res.status(400).json({ error: errorMsg });
        }
    },

    getLicencias: async (req, res) => {
        try {
            const data = await licenciaService.getHistorial();
            res.json(data);
        } catch (e) { res.status(500).json({ error: e.message }); }
    },

    actualizar: async (req, res) => {
        try {
            const { id } = req.params;
            const actualizada = await licenciaService.editarLicencia(id, req.body);
            res.json(actualizada);
        } catch (e) {
            // Aquí también capturamos el mensaje del throw new Error
            res.status(400).json({ error: e.message });
        }
    },

    eliminar: async (req, res) => {
        try {
            await licenciaService.borrarLicencia(req.params.id);
            res.json({ message: 'Eliminado' });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }
};

module.exports = licenciaController;