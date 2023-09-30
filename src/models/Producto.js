const { Schema, model } = require("mongoose");
/* const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 3001,
  DB_CONNECTION_STRING: "mongodb://localhost/proyecto",
  HOST: "http://localhost",
}; */

const productoSquema = new Schema(
  {
    numeroProducto: { type: Number },
    name: { type: String, required: true },
    desc: { type: String, required: true },
    image: { type: String },
    img_min: { type: String },
    precioVenta: { type: Number },
    costoProduccion: { type: Number },
  },

  {
    timestamps: true,
  }
);

/* productoSquema.methods.setimg = function setimg(filename) {
  const { HOST, PORT } = appConfig;
  this.imgagen = `${HOST}:${PORT}/public/uploads/productos/${filename}`;

};
productoSquema.methods.setimg_min = function setimg_min(filename) {
  const { HOST, PORT } = appConfig;
  this.img_min = `${HOST}:${PORT}/public/uploads/productos/min/${filename}`;
}; */

const Producto = model("Producto", productoSquema);
module.exports = Producto;
