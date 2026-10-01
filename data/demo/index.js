/* Almacén en memoria. Todas las capas leen/escriben este objeto (db.products, db.orders, ...).
   reset() vuelve a cargar la semilla sin reemplazar la referencia exportada. */
const seed = require('./seed');
const db = {};
db.reset = () => { const fresh = JSON.parse(JSON.stringify(seed())); Object.keys(db).forEach(k => { if (k !== 'reset' && k !== 'nextId') delete db[k]; }); Object.assign(db, fresh); };
db.nextId = name => Math.max(0, ...(db[name] || []).map(x => Number(x.id) || 0)) + 1;
db.reset();
module.exports = db;
