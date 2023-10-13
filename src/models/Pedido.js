const { Schema, model } = require("mongoose");
const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 3001,
  DB_CONNECTION_STRING: "mongodb://localhost/proyecto",
  HOST: "http://localhost",
};

const pedidoSquema = new Schema(
  {
    username: { type: String },
    direccion: { type: String },
    telefono: { type: String },
    Numero_pedido: { type: Number },
    Estado: { type: String },
    Pago: { type: String },
    Monto_total: { type: Number },
    Costo_total: { type: Number },
    Descuento: { type: Number },
    Mes: { type: String },
    productos: [
      {
        nombre: String,
        cantidad: Number,
        precio: Number,
        costo: Number,
      },
    ],
    createdAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Pedido = model("Pedido", pedidoSquema);
module.exports = Pedido;
