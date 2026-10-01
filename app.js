/* Dulce29 · tienda, clientes, administración y reparto. Express + Nunjucks + sesión, datos demo en memoria. */
require('dotenv').config();
const express = require('express'), session = require('express-session'), nunjucks = require('nunjucks'), path = require('path');
const { connectDatabase } = require('./config/database'), constants = require('./config/constants'), routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errors');
const db = require('./data/demo'), F = require('./utils/format'), cart = require('./services/cartService');

const app = express(), PORT = process.env.PORT || 3000;
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
app.use(session({ secret: process.env.SESSION_SECRET || 'dulce29-demo', resave: false, saveUninitialized: true, cookie: { maxAge: 604800000, sameSite: 'lax' } }));
app.use((req, res, next) => {
  const u = req.session.user || null, ls = cart.lines(req.session.cart);
  res.locals.user = u; res.locals.cartCount = ls.reduce((a, l) => a + l.qty, 0);
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
connectDatabase().finally(() => app.listen(PORT, () => console.log(`Dulce29 · http://localhost:${PORT}`)));
