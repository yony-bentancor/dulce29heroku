const { Schema, model } = require("mongoose");
const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 3001,
  DB_CONNECTION_STRING: "mongodb://localhost/proyecto",
  HOST: "http://localhost",
};

const productoSquema = new Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    img: { type: String },
    img_min: { type: String },
  },

  {
    timestamps: true,
  }
);

productoSquema.methods.setimg = function setimg(filename) {
  const { HOST, PORT } = appConfig;
  this.img = `${HOST}:${PORT}/public/uploads/productos/${filename}`;
  /*this.img = "${DB_CONNECTION_STRING}:${PORT}/public/${filename}";*/
};
productoSquema.methods.setimg_min = function setimg_min(filename) {
  const { HOST, PORT } = appConfig;
  this.img_min = `${HOST}:${PORT}/public/uploads/productos/min/${filename}`;
  /*this.img = "${DB_CONNECTION_STRING}:${PORT}/public/${filename}";*/
};

const Producto = model("Producto", productoSquema);
module.exports = Producto;
