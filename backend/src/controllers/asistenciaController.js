const asistenciaService = require('../services/asistenciaService');
const asistenciaModel = require('../models/asistenciaModel');

const listarArbitros = async (req, res) => {
    try {
        const data = await asistenciaModel.listarParaAsistencia();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const registrar = async (req, res) => {
    const { fecha, tipo_actividad, registros } = req.body;

    if (!registros || registros.length === 0) {
        return res.status(400).json({ error: "No hay registros para guardar" });
    }

    try {
        // Ejecutamos todas las inserciones en paralelo
        const promesas = registros.map(r => 
            asistenciaModel.registrarAsistencia(
                r.id_arbitro, 
                fecha, 
                r.estado === 'Presente' ? r.hora_entrada : "00:00:00", 
                tipo_actividad, 
                r.estado
            )
        );

        await Promise.all(promesas);

        res.json({ success: true, message: "Asistencia procesada correctamente" });
    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({ 
            error: "Error interno en el servidor", 
            detalles: error.message 
        });
    }
};

const historial = async (req, res) => {
    try {
        // Valores por defecto si no vienen en la query
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

        const inicio = req.query.inicio || inicioMes;
        const fin = req.query.fin || finMes;

        const data = await asistenciaModel.getHistorial(inicio, fin);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerResumen = async (req, res) => {
    try {
        const data = await asistenciaModel.getResumenFaltas();
        // Opcional: log para verificar que la especialización esté llegando al servidor
        // console.log("Datos enviados al frontend:", data[0]); 
        res.json(data);
    } catch (error) {
        console.error("Error en obtenerResumen:", error);
        res.status(500).json({ error: error.message });
    }
};

const detalleFaltas = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await asistenciaModel.getDetalleFaltas(id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const justificar = async (req, res) => {
    try {
        const { id_asistencia } = req.body;
        await asistenciaModel.justificarFalta(id_asistencia);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { listarArbitros, registrar, historial, obtenerResumen, justificar, detalleFaltas };