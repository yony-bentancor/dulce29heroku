const { Schema, model } = require("mongoose");
const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 80,
  DB_CONNECTION_STRING:
    "mongodb+srv://proyectodulce:dulce29@cluster0.bi9aze0.mongodb.net/?retryWrites=true&w=majority",
  HOST: "https://dulce29.herokuapp.com/",
};

const productoSquema = new Schema(
  {
    numeroProducto: { type: Number },
    name: { type: String, required: true },
    desc: { type: String, required: true },
    img: { type: String },
    img_min: { type: String },
    precioVenta: { type: Number },
    costoProduccion: { type: Number },
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
