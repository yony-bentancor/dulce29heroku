const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// Configura AWS S3
/* const s3 = new AWS.S3(); */

// Configura el almacenamiento de multer para S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  /*   storage: multerS3({
    s3: s3,
    bucket: "dulce29",
    acl: "public-read", // Define los permisos de lectura del archivo en S3
    key: (req, file, cb) => {
      const timestamp = Date.now();
      const originalname = file.originalname;
      const uniqueFilename = `${timestamp}-${originalname}`;
      cb(null, uniqueFilename);
    },
  }), */
});

module.exports = upload;
