const awsConfig = require("./awsConfig"); // Importa la configuración de AWS

// Función para subir un archivo a Amazon S3
async function uploadToS3(file, key) {
  const params = {
    Bucket: "proyectodulce29", // Cambia a tu nombre de bucket
    Key: key,
    Body: file.buffer,
  };

  try {
    const result = await awsConfig.upload(params).promise();
    return result.Location;
  } catch (error) {
    throw error;
  }
}

module.exports = { uploadToS3 };
