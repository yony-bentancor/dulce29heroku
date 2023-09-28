const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "accessKeyId",
  secretAccessKey: "secretAccessKey",
  region: "us-east-1", // Cambia a tu región AWS
});

const S3 = new AWS.S3();

module.exports = S3;
