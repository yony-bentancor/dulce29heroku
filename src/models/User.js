const { Schema, model } = require("mongoose");
const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 80,
  DB_CONNECTION_STRING:
    "mongodb+srv://proyectodulce:dulce29@cluster0.bi9aze0.mongodb.net/?retryWrites=true&w=majority",
  HOST: "https://dulce29.herokuapp.com/",
};

const userSquema = new Schema(
  {
    username: { type: String, required: true },
    telefono: { type: String, required: true },
    direccion: { type: String, required: true },
    email: { type: String, required: true },
    hash: { type: String, require: true },
    createdAt: { type: Date },
  },

  {
    timestamps: true,
  }
);

const User = model("User", userSquema);
module.exports = User;
