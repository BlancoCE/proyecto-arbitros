const pfService = require('../services/pruebasFisicasService');
const fs = require('fs');
const path = require('path');

const getArbitrosParaPrueba = async (req, res) => {
    try {
        const arbitros = await pfService.obtenerListaArbitros();
        res.status(200).json(arbitros);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener lista jerárquica" });
    }
};

const registrarPruebaFisica = async (req, res) => {
    let url_informe = null;
    try {
        const datos = JSON.parse(req.body.datos);
        const { tipo_prueba, fecha } = req.body;
        url_informe = req.file ? `/uploads/informes/${req.file.filename}` : null;

        await pfService.procesarRegistroFisico({
            tipo_prueba, fecha, url_informe, datos
        });

        res.status(200).json({ message: "Registro físico completado" });
    } catch (error) {
        // SI ES DUPLICADO O ERROR, BORRAMOS EL ARCHIVO QUE MULTER SUBIÓ
        if (req.file) {
            const rutaArchivoFallido = path.join(__dirname, '../../uploads/informes', req.file.filename);
            
            if (fs.existsSync(rutaArchivoFallido)) {
                fs.unlinkSync(rutaArchivoFallido);
            }
        }

        if (error.message === 'DUPLICADO') {
            return res.status(400).json({ error: "Ya existe una prueba registrada para esta fecha y tipo." });
        }
        
        res.status(500).json({ error: "Error al guardar la prueba" });
    }
};

const getHistorial = async (req, res) => {
    try {
        const historial = await pfService.obtenerHistorial();
        res.status(200).json(historial);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar historial" });
    }
};

const getDetallePrueba = async (req, res) => {
    try {
        const { fecha, tipo } = req.query; // Recibimos de los parámetros de la URL
        if (!fecha || !tipo) {
            return res.status(400).json({ error: "Faltan parámetros: fecha y tipo" });
        }
        const detalle = await pfService.obtenerDetalleCompleto(fecha, tipo);
        res.status(200).json(detalle);
    } catch (error) {
        console.error("Error en getDetallePrueba:", error);
        res.status(500).json({ error: "Error al obtener el detalle de la prueba" });
    }
};

const eliminarPrueba = async (req, res) => {
    try {
        const { fecha, tipo } = req.query;
        await pfService.borrarRegistroFisico(fecha, tipo);
        res.status(200).json({ message: "Eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
};

module.exports = { getArbitrosParaPrueba, registrarPruebaFisica, getHistorial, getDetallePrueba, eliminarPrueba };