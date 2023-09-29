const aws = require("aws-sdk");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // Agrega la región de tu bucket de S3
  Bucket: process.env.AWS_BUCKET_NAME,
});

const uploadToS3 = (file, key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ACL: "public-read", // Establece los permisos adecuados en S3
    ContentType: file.mimetype,
  };

  return s3.upload(params).promise();
};

module.exports = {
  uploadToS3,
};
