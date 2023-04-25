const CLAVE_SECRETA = process.env.CLAVE_SECRETA || "lunes23deagosto";

const PORT = process.env.PORT || 3001;

const DB_CONNECTION_STRING =
  process.env.DB_CONNECTION_STRING || "mongodb://localhost/proyecto";

const HOST = "http://localhost";

module.exports = {
  CLAVE_SECRETA,
  PORT,
  DB_CONNECTION_STRING,
  HOST,
};
