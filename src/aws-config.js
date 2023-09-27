const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "AKIAY6K62BUG4GBUYHWG",
  secretAccessKey: "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",
  region: "us-east-1", // Por ejemplo, 'us-east-1'
});

const s3 = new AWC.S3();

module.exports = AWS;
