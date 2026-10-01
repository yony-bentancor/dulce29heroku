const db = require('../data/demo');
const cart = require('../services/cartService');
const orders = require('../services/orderService');
const wa = require('../services/whatsappService');
const { promoView } = require('./publicController');
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

exports.list = (req, res) => {
  const q = req.query, active = db.products.filter(p => p.active);
  let items = active.slice();
  const cat = db.categories.find(c => c.slug === q.categoria);
  if (cat) items = items.filter(p => p.categoryId === cat.id);
  if (q.q) { const t = norm(q.q); items = items.filter(p => norm(p.name + ' ' + p.description + ' ' + p.category + ' ' + p.tags.join(' ')).includes(t)); }
  if (q.tag) items = items.filter(p => p.tags.includes(q.tag));
  if (q.stock === '1') items = items.filter(p => p.stock > 0);
  const sorts = { precio: (a, b) => a.price - b.price, '-precio': (a, b) => b.price - a.price, nombre: (a, b) => a.name.localeCompare(b.name), destacados: (a, b) => (b.featured - a.featured) || a.id - b.id };
  items.sort(sorts[q.orden] || sorts.destacados);
  const counts = Object.fromEntries(db.categories.map(c => [c.slug, active.filter(p => p.categoryId === c.id).length]));
  const tags = [...new Set(active.flatMap(p => p.tags))].sort();
  res.render('shop/list', { products: items, cat, counts, total: active.length, tags, q });
};
exports.detail = (req, res) => {
  const p = db.products.find(x => x.slug === req.params.slug || String(x.id) === req.params.slug);
  if (!p || !p.active) return res.status(404).render('errors/404');
  const related = db.products.filter(x => x.active && x.id !== p.id && x.categoryId === p.categoryId).slice(0, 4);
  const inPromos = db.promotions.filter(pr => pr.active && pr.items.some(i => i.productId === p.id)).map(promoView);
  res.render('shop/detail', { p, pcat: db.categories.find(c => c.id === p.categoryId) || {}, related: related.length ? related : db.products.filter(x => x.active && x.featured && x.id !== p.id).slice(0, 4), inPromos });
};
exports.promos = (req, res) => res.render('shop/promos', { promos: db.promotions.filter(p => p.active).map(promoView) });

// ---------- bolsa ----------
const wantsJson = req => (req.get('accept') || '').includes('application/json');
exports.add = (req, res) => {
  const type = req.body.type === 'promo' ? 'promo' : 'product', id = +(req.body.id || req.params.id), qty = Math.max(1, +req.body.qty || 1);
  const item = type === 'promo' ? db.promotions.find(x => x.id === id && x.active) : db.products.find(x => x.id === id && x.active);
  const avail = item ? (type === 'promo' ? cart.promoStock(item) : item.stock) : 0;
  const inCart = ((req.session.cart || []).find(l => l.type === type && l.id === id) || {}).qty || 0;
  if (!item || avail <= 0) { if (wantsJson(req)) return res.status(409).json({ error: 'Ese producto no tiene stock en este momento.' }); req.flash('error', 'Ese producto no tiene stock en este momento.'); return res.redirect('back'); }
  const n = Math.min(qty, Math.max(0, avail - inCart));
  if (n <= 0) { const m = `No hay más stock de ${item.name}: ya tenés ${inCart} en la bolsa.`; if (wantsJson(req)) return res.status(409).json({ error: m }); req.flash('error', m); return res.redirect('/carrito'); }
  cart.add(req.session, type, id, n);
  const count = cart.lines(req.session.cart).reduce((a, l) => a + l.qty, 0);
  if (wantsJson(req)) return res.json({ ok: true, name: item.name, count });
  req.flash('ok', `Agregaste ${item.name} a la bolsa.`); res.redirect(req.body.next || '/carrito');
};
exports.update = (req, res) => { const [type, id] = String(req.body.key || '').split('-'); cart.setQty(req.session, type, +id, +req.body.qty); res.redirect('/carrito'); };
exports.remove = (req, res) => { const [type, id] = String(req.params.key || '').split('-'); cart.setQty(req.session, type, +id, 0); req.flash('ok', 'Quitamos el producto de la bolsa.'); res.redirect('/carrito'); };
exports.view = (req, res) => {
  const ls = cart.lines(req.session.cart), t = cart.totals(ls);
  const suggest = db.products.filter(p => p.active && p.stock > 0 && p.featured && !ls.find(l => l.type === 'product' && l.item.id === p.id)).slice(0, 4);
  res.render('shop/cart', { lines: ls, t, suggest });
};

// ---------- checkout ----------
function checkoutCtx(req, values = {}, errors = []) {
  const ls = cart.lines(req.session.cart), u = req.session.user, client = u && u.clientId ? db.clients.find(c => c.id === u.clientId) : null;
  const v = Object.assign({ method: 'envio', payment: 'Transferencia' }, values);
  if (client && !values.name) { v.name = client.name; v.phone = client.phone; v.email = client.email; const a = client.addresses[0]; if (a) { v.street = a.street; v.zone = a.zone; v.addrNotes = a.notes; v.addressId = a.id; } }
  const t = cart.totals(ls, { method: v.method, zone: v.zone });
  return { lines: ls, t, v, errors, client, zones: db.zones.filter(z => z.active), dates: orders.deliveryDates(), slots: db.settings.delivery.slots, pay: db.settings.payments, del: db.settings.delivery };
}
exports.checkout = (req, res) => { if (!cart.lines(req.session.cart).length) return res.redirect('/carrito'); res.render('shop/checkout', checkoutCtx(req, req.session.checkoutDraft || {})); };
exports.placeOrder = (req, res) => {
  const b = req.body, u = req.session.user;
  let clientId = u && u.clientId || null;
  const r = orders.create({
    customer: { name: b.name, phone: b.phone, email: b.email }, clientId, channel: 'web', by: 'Web',
    delivery: { method: b.method, street: b.street, zone: b.zone, notes: b.addrNotes, date: b.date, slot: b.slot },
    payment: { method: b.payment }, notes: b.notes,
    items: (req.session.cart || []).map(l => l.type === 'promo' ? { type: 'promo', promoId: l.id, qty: l.qty } : { type: 'product', productId: l.id, qty: l.qty })
  });
  if (r.errors) return res.status(422).render('shop/checkout', checkoutCtx(req, b, r.errors));
  const o = r.order;
  // vincular con un cliente (registrado o por teléfono) y guardar dirección nueva si se pidió
  let c = clientId ? db.clients.find(x => x.id === clientId) : db.clients.find(x => x.phone.replace(/\D/g, '') === o.customer.phone.replace(/\D/g, ''));
  if (!c) { c = { id: db.nextId('clients'), name: o.customer.name, email: o.customer.email, phone: o.customer.phone, notes: '', createdAt: o.createdAt, favorites: [], addresses: [] }; db.clients.push(c); }
  o.clientId = c.id;
  if (o.delivery.method === 'envio' && !c.addresses.find(a => a.street.toLowerCase() === o.delivery.street.toLowerCase()) && (b.saveAddress || !c.addresses.length))
    c.addresses.push({ id: Math.max(0, ...db.clients.flatMap(x => x.addresses.map(a => a.id))) + 1, label: c.addresses.length ? 'Otra' : 'Casa', street: o.delivery.street, zone: o.delivery.zone, notes: o.delivery.notes, lat: o.delivery.lat, lng: o.delivery.lng });
  req.session.cart = []; req.session.myOrders = [...(req.session.myOrders || []), o.id]; delete req.session.checkoutDraft;
  res.redirect(`/pedido/${o.code}/confirmado?t=${o.token}`);
};
exports.confirmed = (req, res) => {
  const o = db.orders.find(x => x.code === req.params.code);
  if (!o || (o.token !== req.query.t && !(req.session.myOrders || []).includes(o.id))) return res.status(404).render('errors/404');
  res.render('shop/confirmed', { o: orders.hydrate(o), wa: wa.customerLink(o), pay: db.settings.payments, trackUrl: `/seguimiento/${o.code}?t=${o.token}` });
};
// ---------- seguimiento público ----------
exports.track = (req, res) => {
  const { pedido, tel } = req.query;
  const hint = db.orders.filter(o => o.status === 'en_camino').slice(-1)[0];
  res.locals.hint = hint ? { code: hint.code, phone: hint.customer.phone } : null;
  if (!pedido) return res.render('shop/track', { o: null });
  const o = db.orders.find(x => x.code === String(pedido).replace(/\D/g, ''));
  const ok = o && o.customer.phone.replace(/\D/g, '').slice(-6) === String(tel || '').replace(/\D/g, '').slice(-6);
  if (!ok) return res.status(404).render('shop/track', { o: null, error: 'No encontramos un pedido con ese número y teléfono. Revisá los datos o escribinos por WhatsApp.', values: req.query });
  res.redirect(`/seguimiento/${o.code}?t=${o.token}`);
};
exports.trackOrder = (req, res) => {
  const o = db.orders.find(x => x.code === req.params.code);
  if (!o || (o.token !== req.query.t && !(req.session.myOrders || []).includes(o.id))) return res.status(404).render('shop/track', { o: null, error: 'Ese enlace de seguimiento no es válido.' });
  res.render('shop/track', { o: orders.hydrate(o), wa: wa.link(`Hola Dulce29, consulto por mi pedido #${o.code}.`) });
};
exports.trackJson = (req, res) => { const o = db.orders.find(x => x.code === req.params.code && x.token === req.query.t); if (!o) return res.status(404).json({}); res.json({ status: o.status, history: o.history.length }); };

// favoritos (cliente registrado o visitante en sesión)
exports.fav = (req, res) => {
  const id = +req.params.id, u = req.session.user, c = u && u.clientId ? db.clients.find(x => x.id === u.clientId) : null;
  const list = c ? c.favorites : (req.session.favs = req.session.favs || []);
  const i = list.indexOf(id), on = i < 0; if (on) list.push(id); else list.splice(i, 1);
  if (wantsJson(req)) return res.json({ on, guest: !c });
  res.redirect('back');
};
