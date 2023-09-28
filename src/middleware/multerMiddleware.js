const multer = require("multer");

// Configuración de almacenamiento para Multer
const storage = multer.memoryStorage();

// Middleware de Multer para manejar la subida de archivos
const upload = multer({ storage: storage });

module.exports = upload;
