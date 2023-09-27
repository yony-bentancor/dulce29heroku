const AWS = require("aws-sdk");
const { accessKeyId, secretAccessKey } = require("./config");

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: "us-east-1", // Por ejemplo, 'us-east-1'
});

const s3 = new AWC.S3();

module.exports = AWS;
