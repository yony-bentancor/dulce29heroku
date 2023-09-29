const aws = require("aws-sdk");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // Agrega la región de tu bucket de S3
});

const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ACL: "public-read", // Establece los permisos adecuados en S3
    /* ContentType: file.mimetype, */
  };

  try {
    const data = await s3.upload(params).promise();
    const imageUrl = data.Location; // Obtén la URL de la imagen en S3
    return imageUrl; // Devuelve la URL de la imagen en S3
  } catch (error) {
    console.error("Error al cargar la imagen a S3:", error);
    throw error;
  }
};

module.exports = {
  uploadToS3,
};
