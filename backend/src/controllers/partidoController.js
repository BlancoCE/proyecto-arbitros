const partidoService = require('../services/partidoService');
const pool = require('../config/db');

const getEquiposSugeridos = async (req, res) => {
  try {
    const result = await pool.query('SELECT nombre FROM equipo ORDER BY nombre ASC');
    res.json(result.rows.map(r => r.nombre));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPartido = async (req, res) => {
  try {
    await partidoService.crearPartido(req.body);
    res.status(201).json({ success: true, message: "Partido y Planilla registrados correctamente" });
  } catch (err) {
    // Enviamos el mensaje específico del Error lanzado en el service
    res.status(400).json({ success: false, message: err.message });
  }
};

const getPartidos = async (req, res) => {
  try {
    const partidos = await partidoService.listarPartidos();
    res.json(partidos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener partidos" });
  }
};

const updatePartido = async (req, res) => {
  try {
    const { id } = req.params;
    await partidoService.actualizarPartido(id, req.body);
    res.json({ success: true, message: "Partido actualizado con éxito" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deletePartido = async (req, res) => {
  try {
    const { id } = req.params;
    await partidoService.eliminarPartido(id);
    res.json({ success: true, message: "Partido eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEquiposSugeridos,
  createPartido,
  getPartidos,
  updatePartido,
  deletePartido
};