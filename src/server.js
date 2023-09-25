const express = require("express");
const app = express();
const { PORT } = require("./config");
const nunjucks = require("nunjucks");
const db = require("./db");
var fs = require("fs");
const multer = require("multer");
const path = require("path");

const productoRoutes = require("./routes/producto.routes");
const pageRoutes = require("./routes/page.routes");
const posteoRoutes = require("./routes/posteo.routers");
const userRoutes = require("./routes/user.routes");
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });

// Ahora puedes utilizar el SDK de AWS para interactuar con los servicios de AWS
const s3 = new AWS.S3();

// Ejemplo: listar los buckets de Amazon S3
s3.listBuckets((err, data) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Buckets:", data.Buckets);
  }
});

nunjucks.configure("./src/views", {
  autoescape: true,
  express: app,
});

// Configura multer para gestionar la carga de archivos
/* const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/productos"); // Directorio donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage }); */
db();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", pageRoutes);
app.use("/producto", productoRoutes);
app.use("/posteo", posteoRoutes);
app.use("/session", userRoutes);
app.use(express.static("/"));
app.set("view engine", "njk");
app.use("/static", express.static(__dirname + "/public"));
/* app.use(express.static(path.join(__dirname, "public"))); */

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}!`));
