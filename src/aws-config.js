const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "yony",
  secretAccessKey: "0kALTJI&",
  region: "us-east-2", // Por ejemplo, 'us-east-1'
});

module.exports = AWS;
