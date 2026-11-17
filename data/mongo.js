/* Persistencia de Dulce29 en MongoDB.

   Todas las pantallas siguen leyendo y escribiendo el objeto en memoria `db` (data/demo).
   Este módulo:
   - al arrancar, carga ese objeto desde MongoDB (o, si la base está vacía, la llena con la semilla mínima);
   - después de cada cambio guarda en MongoDB solo los registros que cambiaron;
   - guarda las imágenes subidas desde el panel (Heroku borra los archivos en cada reinicio);
   - guarda las sesiones, para que nadie pierda su ingreso ni su bolsa cuando el servidor se reinicia.

   Funciona con una sola instancia (un dyno web), que es lo que usa Dulce29. */
const db = require('./demo');

// Listas con `id` propio: cada elemento es un documento en su colección.
const COLLECTIONS = ['categories', 'products', 'promotions', 'zones', 'clients', 'deliverers', 'users', 'orders', 'inquiries', 'courses'];
const CONFIG = 'config';      // el resto (settings, content, seq, resets…) va como un documento por clave
const META_ID = '__meta';     // marca que la base ya fue inicializada

const state = { client: null, mdb: null, last: {}, timer: null, running: null, again: false };

const isData = k => typeof db[k] !== 'function';
const json = v => JSON.stringify(v === undefined ? null : v);
const clean = v => JSON.parse(json(v));

function dbName() { return process.env.MONGO_DB || undefined; } // si no se indica, usa la base del MONGO_URI (o "test")

async function connect(uri) {
  let mongodb;
  try { mongodb = require('mongodb'); }
  catch (e) { throw new Error('Falta el paquete "mongodb". Ejecutá npm install.'); }
  state.client = new mongodb.MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await state.client.connect();
  state.mdb = state.client.db(dbName());
  await state.mdb.command({ ping: 1 });
  return state.mdb;
}

const col = name => state.mdb.collection(name);

/* Estado guardado por última vez: para cada lista, id → JSON; para config, clave → JSON. */
function snapshot() {
  const snap = {};
  Object.keys(db).filter(isData).forEach(k => {
    if (COLLECTIONS.includes(k) && Array.isArray(db[k])) {
      const m = new Map(); db[k].forEach((it, i) => { if (it && it.id != null) m.set(String(it.id), json({ ...it, _ord: i })); });
      snap[k] = m;
    } else snap[k] = json(db[k]);
  });
  return snap;
}

async function persistNow() {
  if (!state.mdb) return;
  const now = snapshot(), last = state.last, ops = {};
  for (const k of Object.keys(now)) {
    if (now[k] instanceof Map) {
      const prev = last[k] instanceof Map ? last[k] : new Map(), list = [];
      for (const [id, s] of now[k]) {
        if (prev.get(id) === s) continue;
        const doc = JSON.parse(s), _id = doc.id;
        list.push({ replaceOne: { filter: { _id }, replacement: { ...doc, _id }, upsert: true } });
      }
      for (const [id, s] of prev) if (!now[k].has(id)) list.push({ deleteOne: { filter: { _id: JSON.parse(s).id } } });
      if (list.length) ops[k] = list;
    } else if (last[k] !== now[k]) {
      (ops[CONFIG] = ops[CONFIG] || []).push({ replaceOne: { filter: { _id: k }, replacement: { _id: k, value: JSON.parse(now[k]) }, upsert: true } });
    }
  }
  // claves de configuración que desaparecieron del objeto
  for (const k of Object.keys(last)) if (!(k in now) && !(last[k] instanceof Map)) (ops[CONFIG] = ops[CONFIG] || []).push({ deleteOne: { filter: { _id: k } } });
  for (const name of Object.keys(ops)) await col(name).bulkWrite(ops[name], { ordered: false });
  state.last = now;
  const n = Object.values(ops).reduce((a, l) => a + l.length, 0);
  if (n && process.env.MONGO_DEBUG) console.log(`[dulce29] MongoDB · ${n} cambio(s) guardado(s)`);
}

/* Guarda en segundo plano. Si llega otro pedido de guardado mientras uno corre, se repite al terminar. */
function save() {
  if (!state.mdb) return Promise.resolve();
  if (state.running) { state.again = true; return state.running; }
  state.running = (async () => {
    try { do { state.again = false; await persistNow(); } while (state.again); }
    catch (e) { console.error('[dulce29] Error guardando en MongoDB:', e.message); }
    finally { state.running = null; }
  })();
  return state.running;
}

async function load() {
  const meta = await col(CONFIG).findOne({ _id: META_ID });
  if (!meta) {
    // base nueva: se guarda la semilla mínima que ya está en memoria
    state.last = {};
    await persistNow();
    await col(CONFIG).replaceOne({ _id: META_ID }, { _id: META_ID, seededAt: new Date().toISOString(), version: 1 }, { upsert: true });
    console.log('[dulce29] MongoDB vacía · cargamos los datos mínimos de ejemplo');
    return;
  }
  const fresh = {};
  for (const k of COLLECTIONS) {
    const docs = await col(k).find({}).sort({ _ord: 1, _id: 1 }).toArray();
    fresh[k] = docs.map(d => { const { _id, _ord, ...rest } = d; return rest; });
  }
  const conf = await col(CONFIG).find({}).toArray();
  conf.forEach(d => { if (d._id !== META_ID) fresh[d._id] = d.value; });
  // lo que no esté en la base (por ejemplo, una clave nueva del código) queda con su valor de la semilla
  Object.keys(db).filter(isData).forEach(k => { if (!(k in fresh)) return; db[k] = fresh[k]; });
  state.last = snapshot();
  console.log(`[dulce29] MongoDB conectada · ${db.products.length} productos, ${db.orders.length} pedidos, ${db.users.length} usuarios`);
}

async function init(uri) {
  await connect(uri);
  await col('sessions').createIndex({ expires: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
  await load();
  // red de seguridad: cambios hechos fuera de un POST (p. ej. último ingreso) se guardan cada 30 s
  state.timer = setInterval(save, 30000); if (state.timer.unref) state.timer.unref();
}

const connected = () => !!state.mdb;

/* ---------- Imágenes subidas ---------- */
async function saveUpload(file, buffer, type) {
  if (!state.mdb) return;
  await col('uploads').replaceOne({ _id: file }, { _id: file, type, size: buffer.length, data: buffer, createdAt: new Date() }, { upsert: true });
}
async function getUpload(file) {
  if (!state.mdb) return null;
  const d = await col('uploads').findOne({ _id: file });
  if (!d) return null;
  const raw = d.data && d.data.buffer !== undefined && !Buffer.isBuffer(d.data) ? d.data.buffer : d.data; // Binary → bytes
  return { type: d.type, data: Buffer.from(raw) };
}

/* ---------- Sesiones ---------- */
function sessionStore(session) {
  class MongoSessionStore extends session.Store {
    expiry(sess) { return sess && sess.cookie && sess.cookie.expires ? new Date(sess.cookie.expires) : new Date(Date.now() + 864e5); }
    get(sid, cb) {
      col('sessions').findOne({ _id: sid })
        .then(d => cb(null, d && (!d.expires || d.expires > new Date()) ? JSON.parse(d.session) : null), cb);
    }
    set(sid, sess, cb = () => {}) {
      col('sessions').replaceOne({ _id: sid }, { _id: sid, session: JSON.stringify(sess), expires: this.expiry(sess) }, { upsert: true })
        .then(() => cb(), cb);
    }
    touch(sid, sess, cb = () => {}) {
      col('sessions').updateOne({ _id: sid }, { $set: { expires: this.expiry(sess) } }).then(() => cb(), cb);
    }
    destroy(sid, cb = () => {}) { col('sessions').deleteOne({ _id: sid }).then(() => cb(), cb); }
  }
  return new MongoSessionStore();
}

async function close() { if (state.timer) clearInterval(state.timer); await save(); if (state.client) await state.client.close(); }

module.exports = { init, save, connected, saveUpload, getUpload, sessionStore, close, COLLECTIONS, _state: state };
