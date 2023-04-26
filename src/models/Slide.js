const { Schema, model } = require("mongoose");
const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 3001,
  DB_CONNECTION_STRING:
    "mongodb+srv://proyectodulce:dulce29@cluster0.bi9aze0.mongodb.net/?retryWrites=true&w=majority",
  HOST: "https://dulce29.herokuapp.com",
};
const slideSquema = new Schema(
  {
    slidename: { type: String, required: true },
    img: { type: String },
  },

  {
    timestamps: true,
  }
);

slideSquema.methods.setimg = function setimg(filename) {
  const { HOST, PORT } = appConfig;
  this.img = `${HOST}:${PORT}/public/uploads/${filename}`;
  /*this.img = "${DB_CONNECTION_STRING}:${PORT}/public/${filename}";*/
};

const Slide = model("Slide", slideSquema);
module.exports = Slide;
