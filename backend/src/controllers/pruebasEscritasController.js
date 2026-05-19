const peService = require('../services/pruebasEscritasService');
const fs = require('fs');
const path = require('path');

const registrar = async (req, res) => {
    try {
        await peService.procesarRegistroEscrito(req.body, req.file);
        res.status(201).json({ message: "Prueba escrita guardada exitosamente" });
    } catch (error) {
        // Limpieza inmediata si Multer subió el archivo pero la validación falló
        if (req.file) {
            const rutaFallida = path.join(__dirname, '../../uploads/informes', req.file.filename);
            if (fs.existsSync(rutaArchivoFallido)) {
                fs.unlinkSync(rutaArchivoFallido);
            }
        }

        if (error.message === 'DUPLICADO') {
            return res.status(400).json({ error: "Ya existe un examen con ese tema registrado en esta fecha." });
        }

        console.error(error);
        res.status(500).json({ error: "Error al registrar la prueba escrita" });
    }
};

const getHistorial = async (req, res) => {
    try {
        const historial = await peService.obtenerHistorial();
        res.status(200).json(historial);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener historial" });
    }
};

const getDetalle = async (req, res) => {
    try {
        const { fecha, tema } = req.query;
        const detalle = await peService.obtenerDetalle(fecha, tema);
        res.status(200).json(detalle);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener detalles" });
    }
};

const eliminar = async (req, res) => {
    try {
        const { fecha, tema } = req.query;
        await peService.eliminarRegistro(fecha, tema);
        res.status(200).json({ message: "Eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
};

module.exports = { registrar, getHistorial, getDetalle, eliminar };