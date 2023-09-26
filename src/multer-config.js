const AWS = require("./aws-config"); // Importa la configuración de AWS
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "dulce29",
    acl: "public-read", // Define los permisos de lectura del archivo en S3
    key: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

module.exports = upload;
