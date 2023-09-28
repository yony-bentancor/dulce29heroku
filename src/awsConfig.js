const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "TU_ACCESS_KEY_ID",
  secretAccessKey: "TU_SECRET_ACCESS_KEY",
  region: "us-east-1", // Cambia a tu región AWS
});

const S3 = new AWS.S3();

module.exports = S3;
