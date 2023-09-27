const { Schema, model } = require("mongoose");
const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 3001,
  DB_CONNECTION_STRING: "mongodb://localhost/proyecto",
  HOST: "http://localhost",
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
