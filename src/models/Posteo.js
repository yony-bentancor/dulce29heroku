const { Schema, model } = require("mongoose");
const { PORT, DB_CONNECTION_STRING, HOST } = require("../config");
appConfig = {
  PORT: 3001,
  DB_CONNECTION_STRING:
    "mongodb+srv://proyectodulce:dulce29@cluster0.bi9aze0.mongodb.net/?retryWrites=true&w=majority",
  HOST: "https://dulce29.herokuapp.com",
};
const posteoSquema = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    img: { type: String, required: true },
    img_min: { type: String },
    tweetScored: [
      { required: true, type: Schema.Types.ObjectId, ref: "Tweet" },
    ],
    tweetConceded: [
      { required: true, type: Schema.Types.ObjectId, ref: "Tweet" },
    ],
  },

  {
    timestamps: true,
  }
);
posteoSquema.methods.setImgUrls = function setImgUrl(filename) {
  const { host, port } = appConfig;
  this.img = `${host}:${port}/public/uploads/post/${filename}`;
};
posteoSquema.methods.setImgUrlsmin = function setImgUrlmin(filename) {
  const { host, port } = appConfig;
  this.img_min = `${host}:${port}/public/uploads/post/min/${filename}`;
};

const Posteo = model("Posteo", posteoSquema);
module.exports = Posteo;
