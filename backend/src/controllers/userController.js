const userService = require('../services/userService');

const login = async (req, res) => {
  try {
    const { usuario, password } = req.body;
    const user = await userService.login(usuario, password);
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const registerAsesor = async (req, res) => {
  try {
    const foto_path = req.file ? `/uploads/fotos/${req.file.filename}` : null;
    
    await userService.registerAsesor({ ...req.body, foto: foto_path });
    res.status(201).json({ success: true, message: 'Asesor registrado con éxito' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const registerArbitro = async (req, res) => {
  try {
    const foto_path = req.file ? `/uploads/fotos/${req.file.filename}` : null;
    await userService.registerArbitro({ ...req.body, foto: foto_path });
    res.status(201).json({ success: true, message: "Árbitro creado correctamente" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAsesores = async (req, res) => {
  try {
    const id_actual = req.user.id; // Del middleware verificarToken
    const data = await userService.getAsesores(id_actual);
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getArbitros = async (req, res) => {
  try {
    const data = await userService.getArbitros();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAsesor = async (req, res) => {
  try {
    const { id } = req.params;
    const foto_path = req.file ? `/uploads/fotos/${req.file.filename}` : null;
    await userService.updateAsesor(id, { ...req.body, foto: foto_path });
    res.json({ success: true, message: "Asesor actualizado con éxito" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateArbitro = async (req, res) => {
  try {
    const { id } = req.params;
    const foto_path = req.file ? `/uploads/fotos/${req.file.filename}` : null;
    await userService.updateArbitro(id, { ...req.body, foto: foto_path });
    res.json({ success: true, message: "Árbitro actualizado con éxito" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAsesor = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteAsesor(id);
    res.json({ success: true, message: "Asesor eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteArbitro = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteArbitro(id);
    res.json({ success: true, message: "Árbitro eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const data = await userService.getDashboardData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error en getDashboardStats:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.forgotPassword(email);
    res.json({ success: true, message: "Se ha enviado un enlace de recuperación a tu correo." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    await userService.resetPassword(token, password);
    res.json({ success: true, message: "Contraseña actualizada correctamente." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  login, 
  registerAsesor,
  registerArbitro,
  getAsesores,
  getArbitros,
  updateAsesor,
  updateArbitro,
  deleteAsesor,
  deleteArbitro,
  getDashboardStats,
  forgotPassword,
  resetPassword
};
