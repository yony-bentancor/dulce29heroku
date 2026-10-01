const db = require('../data/demo');
const O = require('../services/orderService'), A = require('../services/authService'), cart = require('../services/cartService');
const wa = require('../services/whatsappService');
const me = req => db.clients.find(c => c.id === req.session.user.clientId);
const myOrders = c => db.orders.filter(o => o.clientId === c.id).sort((a, b) => b.id - a.id);
function ctx(req, extra) { const c = me(req); return Object.assign({ c, section: '' }, extra); }
exports.guard = (req, res, next) => { const c = req.session.user && me(req); if (!c) return res.status(403).render('errors/403'); req.client = c; next(); };

exports.dashboard = (req, res) => {
  const c = req.client, os = myOrders(c).map(O.hydrate), active = os.filter(o => !['entregado', 'cancelado', 'no_entregado'].includes(o.status));
  const spent = os.filter(o => o.status === 'entregado').reduce((a, o) => a + o.total, 0);
  const favs = db.products.filter(p => c.favorites.includes(p.id) && p.active).slice(0, 4);
  const inq = db.inquiries.filter(i => i.clientId === c.id);
  res.render('account/dashboard', ctx(req, { section: 'inicio', active, last: os.slice(0, 3), count: os.length, spent, favs, inq, news: db.content.news }));
};
exports.orders = (req, res) => {
  const f = req.query.estado || 'todos'; let os = myOrders(req.client).map(O.hydrate);
  if (f === 'activos') os = os.filter(o => !['entregado', 'cancelado', 'no_entregado'].includes(o.status)); else if (f === 'entregados') os = os.filter(o => o.status === 'entregado');
  res.render('account/orders', ctx(req, { section: 'pedidos', orders: os, f }));
};
const mine = req => { const o = db.orders.find(x => x.code === req.params.code && x.clientId === req.client.id); return o && O.hydrate(o); };
exports.order = (req, res) => { const o = mine(req); if (!o) return res.status(404).render('errors/404'); res.render('account/order', ctx(req, { section: 'pedidos', o, wa: wa.link(`Hola Dulce29, consulto por mi pedido #${o.code}.`), canCancel: o.status === 'recibido' })); };
exports.track = (req, res) => { const o = mine(req); if (!o) return res.status(404).render('errors/404'); res.render('account/track', ctx(req, { section: 'pedidos', o })); };
exports.cancel = (req, res) => { const o = db.orders.find(x => x.code === req.params.code && x.clientId === req.client.id); if (o && o.status === 'recibido') { O.setStatus(o, 'cancelado', req.client.name, 'Cancelado por el cliente desde su cuenta.'); req.flash('ok', `Cancelaste el pedido #${o.code}.`); } else req.flash('error', 'Este pedido ya está en preparación: escribinos por WhatsApp para cambiarlo.'); res.redirect('/mi-cuenta/pedidos/' + req.params.code); };
// volver a pedir: copia los productos disponibles a la bolsa
exports.reorder = (req, res) => {
  const o = db.orders.find(x => x.code === req.params.code && x.clientId === req.client.id); if (!o) return res.redirect('/mi-cuenta/pedidos');
  let added = 0, missing = [];
  o.items.forEach(i => { const type = i.type === 'promo' ? 'promo' : 'product', id = type === 'promo' ? i.promoId : i.productId;
    const it = type === 'promo' ? db.promotions.find(p => p.id === id && p.active) : db.products.find(p => p.id === id && p.active);
    const av = it ? (type === 'promo' ? cart.promoStock(it) : it.stock) : 0;
    if (av > 0) { cart.add(req.session, type, id, Math.min(i.qty, av)); added++; if (av < i.qty) missing.push(`${i.name} (solo ${av})`); } else missing.push(i.name); });
  req.flash(missing.length ? 'error' : 'ok', added ? `Agregamos el pedido #${o.code} a tu bolsa.${missing.length ? ' Sin stock suficiente: ' + missing.join(', ') + '.' : ''}` : 'Ninguno de esos productos tiene stock hoy.');
  res.redirect(added ? '/carrito' : '/mi-cuenta/pedidos');
};
exports.reorderList = (req, res) => {
  const os = myOrders(req.client).filter(o => o.status === 'entregado').slice(0, 8).map(O.hydrate);
  // productos que más pidió
  const cnt = {}; myOrders(req.client).forEach(o => o.items.forEach(i => { if (i.productId) cnt[i.productId] = (cnt[i.productId] || 0) + i.qty; }));
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id, n]) => ({ p: db.products.find(p => p.id === +id), n })).filter(x => x.p && x.p.active);
  res.render('account/reorder', ctx(req, { section: 'repetir', orders: os, top }));
};
exports.profile = (req, res) => res.render('account/profile', ctx(req, { section: 'datos', values: req.client }));
exports.saveProfile = (req, res) => {
  const c = req.client, b = req.body, errors = [], u = db.users.find(x => x.id === req.session.user.id);
  if (!String(b.name || '').trim()) errors.push('Escribí tu nombre.');
  if (!/^\S+@\S+\.\S+$/.test(b.email || '')) errors.push('Revisá el email.');
  if (String(b.phone || '').replace(/\D/g, '').length < 8) errors.push('Revisá el teléfono.');
  if (db.users.find(x => x.id !== u.id && x.email.toLowerCase() === String(b.email).toLowerCase())) errors.push('Ese email ya lo usa otra cuenta.');
  if (b.newpass) { if (!A.verify(b.current, u.pass)) errors.push('La contraseña actual no es correcta.'); else if (b.newpass.length < 6) errors.push('La contraseña nueva necesita al menos 6 caracteres.'); }
  if (errors.length) return res.status(422).render('account/profile', ctx(req, { section: 'datos', values: b, errors }));
  Object.assign(c, { name: b.name.trim(), email: b.email.trim(), phone: b.phone.trim() }); Object.assign(u, { name: c.name, email: c.email });
  if (b.newpass) u.pass = A.hash(b.newpass);
  req.session.user = A.sessionUser(u); req.flash('ok', b.newpass ? 'Guardamos tus datos y tu contraseña nueva.' : 'Guardamos tus datos.'); res.redirect('/mi-cuenta/datos');
};
exports.addresses = (req, res) => res.render('account/addresses', ctx(req, { section: 'direcciones', edit: req.query.editar ? req.client.addresses.find(a => a.id === +req.query.editar) : null, zones: db.zones }));
exports.saveAddress = (req, res) => {
  const c = req.client, b = req.body;
  if (!String(b.street || '').trim() || !db.zones.find(z => z.name === b.zone)) { req.flash('error', 'Completá la dirección y la zona.'); return res.redirect('/mi-cuenta/direcciones'); }
  const z = db.zones.find(x => x.name === b.zone), data = { label: (b.label || 'Casa').trim(), street: b.street.trim(), zone: b.zone, notes: (b.notes || '').trim() };
  if (b.id) { const a = c.addresses.find(x => x.id === +b.id); if (a) Object.assign(a, data); }
  else { const id = Math.max(0, ...db.clients.flatMap(x => x.addresses.map(a => a.id))) + 1; c.addresses.push({ id, ...data, lat: z.lat + (Math.random() - .5) * .006, lng: z.lng + (Math.random() - .5) * .006 }); }
  if (b.main) { const i = c.addresses.findIndex(a => a.street === data.street); if (i > 0) c.addresses.unshift(c.addresses.splice(i, 1)[0]); }
  req.flash('ok', 'Dirección guardada.'); res.redirect('/mi-cuenta/direcciones');
};
exports.deleteAddress = (req, res) => { const c = req.client; c.addresses = c.addresses.filter(a => a.id !== +req.params.id); req.flash('ok', 'Eliminamos la dirección.'); res.redirect('/mi-cuenta/direcciones'); };
exports.favorites = (req, res) => res.render('account/favorites', ctx(req, { section: 'favoritos', products: db.products.filter(p => req.client.favorites.includes(p.id)) }));
exports.inquiries = (req, res) => res.render('account/inquiries', ctx(req, { section: 'consultas', items: db.inquiries.filter(i => i.clientId === req.client.id || (i.email && i.email.toLowerCase() === (req.client.email || '').toLowerCase())).sort((a, b) => b.id - a.id) }));
