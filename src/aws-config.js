const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "AKIAY6K62BUG4GBUYHWG",
  secretAccessKey: "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",
  region: "us-east-2", // Por ejemplo, 'us-east-1'
});

module.exports = AWS;
