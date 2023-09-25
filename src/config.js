// Importa la configuración de appConfig si está definida
const appConfig = require("./appConfig"); // Ajusta la ruta según la ubicación de tu archivo de configuración

// Define las variables de entorno utilizando appConfig o valores predeterminados
const CLAVE_SECRETA =
  process.env.CLAVE_SECRETA || appConfig.CLAVE_SECRETA || "dulce29";
const PORT = process.env.PORT || appConfig.PORT || 80;
const DB_CONNECTION_STRING =
  process.env.DB_CONNECTION_STRING ||
  appConfig.DB_CONNECTION_STRING ||
  "mongodb+srv://proyectodulce:dulce29@cluster0.bi9aze0.mongodb.net/?retryWrites=true&w=majority";
const HOST =
  process.env.HOST || appConfig.HOST || "https://dulce29.herokuapp.com/";

// Exporta las variables de entorno configuradas
module.exports = {
  CLAVE_SECRETA,
  PORT,
  DB_CONNECTION_STRING,
  HOST,
};
