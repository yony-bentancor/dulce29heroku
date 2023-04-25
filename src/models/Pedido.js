const { Schema, model } = require("mongoose");
const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 3001,
  DB_CONNECTION_STRING: "mongodb://localhost/proyecto",
  HOST: "http://localhost",
};

const pedidoSquema = new Schema(
  {
    Detox: { type: Number },
    Kefir: { type: Number },
    Licuados: { type: Number },
    Limonada: { type: Number },
    username: { type: String },
    Numero_pedido: { type: Number },
    Smoothie: { type: Number },
    Estado: { type: String },
    Mes: { type: String },
    createdAt: { type: Date },
  },

  {
    timestamps: true,
  }
);

/*pedidoSquema.methods.setimg = function setimg(filename) {
  const { HOST, PORT } = appConfig;
  this.img = `${HOST}:${PORT}/public/uploads/productos/${filename}`;
  /*this.img = "${DB_CONNECTION_STRING}:${PORT}/public/${filename}";
};
productoSquema.methods.setimg_min = function setimg_min(filename) {
  const { HOST, PORT } = appConfig;
  this.img_min = `${HOST}:${PORT}/public/uploads/productos/min/${filename}`;
this.img = "${DB_CONNECTION_STRING}:${PORT}/public/${filename}";
};*/

const Pedido = model("Pedido", pedidoSquema);
module.exports = Pedido;
