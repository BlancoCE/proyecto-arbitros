const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';

    // Identificar subcarpeta por campo
    if (file.fieldname === 'url_carta') {
      folder += 'licencias/';
    } else if (file.fieldname === 'url_sancion' || file.fieldname === 'documento_sancion') {
      folder += 'sanciones/';
    } else if (file.mimetype === 'application/pdf') {
      folder += 'informes/';
    } else if (file.mimetype.startsWith('image/')) {
      folder += 'fotos/';
    } else {
      folder += 'otros/';
    }

    // Crear la carpeta de forma síncrona y segura
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(4).toString('hex');
    const uniqueSuffix = Date.now() + '-' + randomHex;
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de seguridad mejorado (No tumba el servidor, delega el control)
const fileFilter = (req, file, cb) => {
  // Añadimos image/webp y permitimos variaciones de mayúsculas/minúsculas
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    // EN LUGAR DE LANZAR UN ERROR QUE TUMBA EXPRESS:
    // Pasamos false. El controlador recibirá "req.file = undefined".
    // Así evaluamos el error elegantemente con un res.status(400) en el controlador.
    cb(null, false); 
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite amigable de 10MB por archivo/foto de alta resolución
  }
});

module.exports = upload;