const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "yonybentancor",
  secretAccessKey: "Dinamitadog2023&",
  region: "us-east-2", // Por ejemplo, 'us-east-1'
});

module.exports = AWS;
