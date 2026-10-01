async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    console.log('[dulce29] Demo local activo · MongoDB todavía no conectado');
    return null;
  }
  // Punto de conexión preparado para incorporar mongoose en la siguiente etapa.
  console.log('[dulce29] MONGO_URI detectada · implementar adaptador Mongo en producción');
  return null;
}
module.exports = { connectDatabase };
