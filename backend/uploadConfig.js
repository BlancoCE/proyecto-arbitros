const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 1. Definimos la base
    let folder = 'uploads/';

    // 2. PRIORIDAD: Identificar por el campo enviado desde el frontend
    // Esto asegura que si viene de Licencias o Sanciones, vaya a su carpeta sin importar si es PDF o Imagen
    if (file.fieldname === 'url_carta') {
      folder += 'licencias/';
    } else if (file.fieldname === 'url_sancion' || file.fieldname === 'documento_sancion') {
      // Dejamos listo el campo para el módulo de Sanciones
      folder += 'sanciones/';
    } 
    // 3. SECUNDARIO: Si no es de los módulos anteriores, clasificar por tipo (Pruebas físicas/escritas)
    else if (file.mimetype === 'application/pdf') {
      folder += 'informes/';
    } else if (file.mimetype.startsWith('image/')) {
      folder += 'fotos/';
    } else {
      folder += 'otros/';
    }

    // Crear la carpeta si no existe (recursive: true crea 'uploads' y la subcarpeta de un solo golpe)
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Nombre único para evitar sobrescritura
    const randomHex = crypto.randomBytes(4).toString('hex');
    const uniqueSuffix = Date.now() + '-' + randomHex;
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de seguridad
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no soportado. Solo PDF, JPG y PNG.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Aumentado a 10MB por si las fotos son pesadas
});

module.exports = upload;