const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(403).json({ message: "Acceso denegado. No se proporcionó token." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contiene { id, rol }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

// Middleware para verificar múltiples roles
const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ 
                message: "No tienes permisos suficientes para realizar esta acción." 
            });
        }
        next();
    };
};

module.exports = { verificarToken, permitirRoles };