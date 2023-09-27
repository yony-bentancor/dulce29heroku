const { Schema, model } = require("mongoose");
const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 3001,
  DB_CONNECTION_STRING: "mongodb://localhost/proyecto",
  HOST: "http://localhost",
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
