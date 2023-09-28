const CLAVE_SECRETA =
  process.env.CLAVE_SECRETA || "dulce29"; /* "lunes23deagosto"; */

const PORT = process.env.PORT || 80; /*3001 */

const TU_ACCESS_KEY_ID = process.env.TU_ACCESS_KEY_ID || "AKIAY6K62BUGQIZCBAGX";
const TU_SECRET_ACCESS_KEY =
  process.env.TU_SECRET_ACCESS_KEY ||
  "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";

const DB_CONNECTION_STRING =
  process.env.DB_CONNECTION_STRING ||
  "mongodb+srv://proyectodulce:dulce29@cluster0.bi9aze0.mongodb.net/?retryWrites=true&w=majority"; /* "mongodb://localhost/proyecto" */

const uri =
  "mongodb+srv://proyectodulce:dulce29@cluster0.bi9aze0.mongodb.net/?retryWrites=true&w=majority";

const HOST = "https://dulce29.herokuapp.com/";

/* "http://localhost";
 */
module.exports = {
  CLAVE_SECRETA,
  PORT,
  TU_SECRET_ACCESS_KEY,
  TU_ACCESS_KEY_ID,
  DB_CONNECTION_STRING,
  HOST,
  uri,
};
