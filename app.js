/* Dulce29 · tienda, clientes, administración y reparto. Express + Nunjucks + sesión.
   Con MONGO_URI los datos se guardan en MongoDB (data/mongo.js); sin ella, demo en memoria. */
require('dotenv').config();
const express = require('express'), session = require('express-session'), nunjucks = require('nunjucks'), path = require('path');
const { connectDatabase, useMongo } = require('./config/database'), mongo = require('./data/mongo'), constants = require('./config/constants'), routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errors');
const db = require('./data/demo'), F = require('./utils/format'), cart = require('./services/cartService');

const app = express(), PORT = process.env.PORT || 3000;
const DEMO = String(process.env.DEMO_MODE || 'on').toLowerCase() !== 'off'; // DEMO_MODE=off oculta los accesos de demostración
const env = nunjucks.configure(path.join(__dirname, 'views'), { autoescape: true, express: app, noCache: process.env.NODE_ENV !== 'production' });
env.addFilter('money', F.money); env.addFilter('date', (d, f) => F.date(d, f === 'long' ? { weekday: 'long', day: 'numeric', month: 'long' } : f === 'full' ? { day: 'numeric', month: 'long', year: 'numeric' } : undefined));
env.addFilter('datetime', F.datetime); env.addFilter('time', F.time); env.addFilter('ago', F.ago); env.addFilter('initials', F.initials);
env.addFilter('status', s => (F.STATUS[s] || { label: s }).label); env.addFilter('tone', s => (F.STATUS[s] || F.LEAD[s] || { tone: '' }).tone);
env.addFilter('lead', s => (F.LEAD[s] || { label: s }).label); env.addFilter('kind', s => F.KIND[s] || s);
env.addFilter('json', v => new nunjucks.runtime.SafeString(JSON.stringify(v).replace(/</g, '\\u003c')));
env.addFilter('wa', p => String(p || '').replace(/\D/g, '').replace(/^0?9/, '5989'));
env.addFilter('pct', (a, b) => Math.max(0, Math.min(100, Math.round((+a || 0) / (+b || 1) * 100)))); env.addGlobal('STATUS', F.STATUS); env.addGlobal('FLOW', F.FLOW); env.addGlobal('LEAD', F.LEAD);

app.set('view engine', 'njk');
app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0 }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// imágenes subidas desde el panel: si el archivo ya no está en disco (Heroku lo borra al reiniciar), se sirve desde MongoDB
app.get('/uploads/:file', (req, res, next) => {
  if (!mongo.connected() || !/^[\w.-]+$/.test(req.params.file)) return next();
  mongo.getUpload(req.params.file).then(f => {
    if (!f) return next();
    res.set('Cache-Control', 'public, max-age=604800'); res.type(f.type || path.extname(req.params.file)); res.send(f.data);
  }, next);
});
app.use(session({ secret: process.env.SESSION_SECRET || 'dulce29-demo', resave: false, saveUninitialized: !useMongo(),
  store: useMongo() ? mongo.sessionStore(session) : undefined, cookie: { maxAge: 604800000, sameSite: 'lax' } }));
// después de cada formulario enviado (POST), los cambios se guardan en MongoDB
app.use((req, res, next) => { if (req.method !== 'GET' && req.method !== 'HEAD') res.on('finish', () => mongo.save()); next(); });
app.use((req, res, next) => {
  const u = req.session.user || null, ls = cart.lines(req.session.cart);
  res.locals.demoMode = DEMO; res.locals.user = u; res.locals.cartCount = ls.reduce((a, l) => a + l.qty, 0);
  res.locals.brand = constants; res.locals.biz = db.settings.business; res.locals.settings = db.settings; res.locals.content = db.content;
  res.locals.categories = db.categories; res.locals.currentPath = req.path; res.locals.query = req.query || {};
  res.locals.flash = req.session.flash || null; delete req.session.flash;
  res.locals.accountHref = !u ? '/ingresar' : u.role === 'admin' ? '/admin' : u.role === 'delivery' ? '/repartidor' : '/mi-cuenta';
  res.locals.favs = u && u.clientId ? ((db.clients.find(c => c.id === u.clientId) || {}).favorites || []) : (req.session.favs || []);
  req.flash = (type, text) => { req.session.flash = { type, text }; };
  next();
});
app.use(routes);
app.use(notFound);
app.use(errorHandler);
connectDatabase().then(() => app.listen(PORT, () => console.log(`Dulce29 · http://localhost:${PORT}${DEMO ? ' · modo demo activo' : ''}`)));
// Heroku avisa con SIGTERM antes de reiniciar: guardamos lo pendiente
['SIGTERM', 'SIGINT'].forEach(sig => process.on(sig, () => { mongo.close().catch(() => {}).finally(() => process.exit(0)); }));
