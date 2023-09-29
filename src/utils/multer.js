const multer = require("multer");

// Configura la ubicación y el nombre de los archivos cargados
const storage = multer.memoryStorage();

// Configura Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Tamaño máximo de archivo (en este caso, 5 MB)
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipo de archivo no válido. Aceptamos archivos JPEG, JPG, PNG y GIF."
        ),
        false
      );
    }
  },
});

module.exports = upload;
