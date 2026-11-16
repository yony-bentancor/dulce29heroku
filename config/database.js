const mongo = require('../data/mongo');

/* Sin MONGO_URI: modo demo en memoria (se pierde todo al reiniciar).
   Con MONGO_URI: carga los datos desde MongoDB y guarda cada cambio. */
async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    console.log('[dulce29] Sin MONGO_URI · demo en memoria (los cambios se pierden al reiniciar)');
    return null;
  }
  try {
    await mongo.init(process.env.MONGO_URI);
    return mongo;
  } catch (e) {
    // Si hay MONGO_URI pero no conecta, no arrancamos en memoria: se perderían pedidos reales sin aviso.
    console.error('[dulce29] No se pudo conectar a MongoDB:', e.message);
    console.error('[dulce29] Revisá MONGO_URI y que Atlas permita conexiones desde cualquier IP (0.0.0.0/0).');
    process.exit(1);
  }
}

module.exports = { connectDatabase, useMongo: () => !!process.env.MONGO_URI };
