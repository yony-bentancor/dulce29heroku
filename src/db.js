const mongoose = require("mongoose");
const { DB_CONNECTION_STRING } = require("./config");

module.exports = () => {
  mongoose.connect(DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection
    .once("open", () => console.log("Conexión establecida satisfactoriamente"))
    .on("error", (error) => console.error("Error en la conexión", error));
};
