/* Administración Dulce29 */
const fs = require('fs'), path = require('path');
const db = require('../data/demo');
const O = require('../services/orderService'), A = require('../services/authService'), cart = require('../services/cartService');
const wa = require('../services/whatsappService'), chart = require('../services/chartService');
const { STATUS, FLOW, LEAD, money, today, slug, TZ } = require('../utils/format');
const { promoView } = require('./publicController');

const dayOf = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
const addDays = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const label = d => new Date(d + 'T12:00:00').toLocaleDateString('es-UY', { day: 'numeric', month: 'numeric' });
const valid = o => o.status !== 'cancelado';
const num = v => (v === '' || v == null ? null : Number(v));
const by = req => req.session.user.name;
const back = (req, res, fallback) => res.redirect(req.get('referer') || fallback);

// contadores para el menú lateral
exports.locals = (req, res, next) => {
  res.locals.nav = {
    nuevos: db.orders.filter(o => o.status === 'recibido').length,
    sinAsignar: db.orders.filter(o => o.delivery.method === 'envio' && !o.delivererId && ['recibido', 'preparando', 'listo'].includes(o.status)).length,
    stock: db.products.filter(p => p.active && p.stock <= p.minStock).length,
    consultas: db.inquiries.filter(i => i.kind === 'contacto' && i.status === 'nuevo').length,
    epi: db.inquiries.filter(i => i.kind === 'epigenetica' && i.status === 'nuevo').length,
    thx: db.inquiries.filter(i => i.kind === 'thermomix' && i.status === 'nuevo').length,
    lastOrderId: Math.max(0, ...db.orders.map(o => o.id))
  };
  res.locals.path = req.baseUrl + req.path; next();
};

// ---------- dashboard ----------
exports.dashboard = (req, res) => {
  const t = today(), os = db.orders, last = n => { const out = []; for (let k = n - 1; k >= 0; k--) out.push(addDays(t, -k)); return out; };
  const todays = os.filter(o => dayOf(o.createdAt) === t && valid(o));
  const d30 = last(30), prev = os.filter(o => valid(o) && d30.includes(dayOf(o.createdAt)));
  const days14 = last(14).map(d => { const v = os.filter(o => valid(o) && dayOf(o.createdAt) === d); return { label: label(d), value: v.reduce((a, o) => a + o.total, 0), title: `${label(d)}: ${money(v.reduce((a, o) => a + o.total, 0))} en ${v.length} pedidos` }; });
  const open = os.filter(o => ['recibido', 'preparando', 'listo', 'en_camino'].includes(o.status)).sort((a, b) => a.id - b.id).map(O.hydrate);
  const byStatus = FLOW.slice(0, 4).map(s => ({ s, n: os.filter(o => o.status === s).length }));
  const deliveriesToday = os.filter(o => o.delivery.method === 'envio' && o.delivery.date === t && valid(o));
  const alerts = [];
  const un = os.filter(o => o.delivery.method === 'envio' && !o.delivererId && ['preparando', 'listo'].includes(o.status)); if (un.length) alerts.push({ tone: 'warn', text: `${un.length} pedido(s) listos para salir sin repartidor asignado.`, href: '/admin/entregas' });
  const out = db.products.filter(p => p.active && p.stock <= 0); if (out.length) alerts.push({ tone: 'bad', text: `Sin stock: ${out.map(p => p.name).join(', ')}.`, href: '/admin/stock' });
  const low = db.products.filter(p => p.active && p.stock > 0 && p.stock <= p.minStock); if (low.length) alerts.push({ tone: 'warn', text: `Stock bajo en ${low.length} producto(s).`, href: '/admin/stock' });
  const unpaid = os.filter(o => o.payment.method === 'Transferencia' && o.payment.status === 'pendiente' && ['preparando', 'listo', 'en_camino'].includes(o.status)); if (unpaid.length) alerts.push({ tone: 'info', text: `${unpaid.length} transferencia(s) sin confirmar en pedidos en curso.`, href: '/admin/pedidos?pago=pendiente' });
  const leads = db.inquiries.filter(i => i.status === 'nuevo'); if (leads.length) alerts.push({ tone: 'info', text: `${leads.length} consulta(s) nueva(s) sin responder.`, href: '/admin/consultas' });
  res.render('admin/dashboard', {
    k: { salesToday: todays.reduce((a, o) => a + o.total, 0), ordersToday: todays.length, open: open.length, sales30: prev.reduce((a, o) => a + o.total, 0), orders30: prev.length,
      ticket: prev.length ? prev.reduce((a, o) => a + o.total, 0) / prev.length : 0, clients: db.clients.length, newClients: db.clients.filter(c => d30.includes(dayOf(c.createdAt))).length,
      products: db.products.filter(p => p.active).length, lowStock: low.length + out.length, deliveriesToday: deliveriesToday.length, delivered: deliveriesToday.filter(o => o.status === 'entregado').length },
    chart: chart.bars(days14), open: open.slice(0, 8), byStatus, alerts,
    riders: db.deliverers.map(d => ({ d, n: deliveriesToday.filter(o => o.delivererId === d.id).length, done: deliveriesToday.filter(o => o.delivererId === d.id && o.status === 'entregado').length })),
    lowList: db.products.filter(p => p.active && p.stock <= p.minStock).sort((a, b) => a.stock - b.stock).slice(0, 6)
  });
};
// novedades para el aviso en vivo
exports.poll = (req, res) => { const since = +req.query.since || 0; const n = db.orders.filter(o => o.id > since).map(o => ({ id: o.id, code: o.code, name: o.customer.name, total: money(o.total) })); res.json({ last: Math.max(0, ...db.orders.map(o => o.id)), orders: n }); };

// ---------- pedidos ----------
function filterOrders(q) {
  let os = db.orders.slice();
  if (q.estado && q.estado !== 'todos') os = q.estado === 'abiertos' ? os.filter(o => ['recibido', 'preparando', 'listo', 'en_camino'].includes(o.status)) : os.filter(o => o.status === q.estado);
  if (q.q) { const t = q.q.toLowerCase(); os = os.filter(o => o.code.includes(t) || o.customer.name.toLowerCase().includes(t) || o.customer.phone.replace(/\D/g, '').includes(t.replace(/\D/g, '') || '§')); }
  const t = today();
  if (q.fecha === 'hoy') os = os.filter(o => o.delivery.date === t); else if (q.fecha === 'manana') os = os.filter(o => o.delivery.date === addDays(t, 1)); else if (q.fecha === 'semana') os = os.filter(o => o.delivery.date >= addDays(t, -6));
  if (q.pago) os = os.filter(o => o.payment.status === q.pago);
  if (q.metodo) os = os.filter(o => o.payment.method === q.metodo);
  if (q.entrega) os = os.filter(o => o.delivery.method === q.entrega);
  return os.sort((a, b) => b.id - a.id);
}
exports.orders = (req, res) => {
  const q = req.query, all = filterOrders({ ...q, estado: 'todos' }), os = filterOrders(q), per = 25, page = Math.max(1, +q.page || 1);
  const counts = Object.fromEntries(['recibido', 'preparando', 'listo', 'en_camino', 'entregado', 'no_entregado', 'cancelado'].map(s => [s, all.filter(o => o.status === s).length]));
  counts.abiertos = all.filter(o => ['recibido', 'preparando', 'listo', 'en_camino'].includes(o.status)).length;
  const qs = new URLSearchParams(Object.entries(q).filter(([k, v]) => v && k !== 'page' && k !== 'estado')).toString();
  if (q.vista === 'tablero') { const cols = ['recibido', 'preparando', 'listo', 'en_camino'].map(s => ({ s, items: db.orders.filter(o => o.status === s).sort((a, b) => a.id - b.id).map(O.hydrate) })); return res.render('admin/orders-board', { cols, q }); }
  res.render('admin/orders', { orders: os.slice((page - 1) * per, page * per).map(O.hydrate), total: os.length, sum: os.filter(valid).reduce((a, o) => a + o.total, 0), counts, q, qs, pager: { page, pages: Math.ceil(os.length / per) } });
};
exports.exportOrders = (req, res) => {
  const os = filterOrders(req.query), cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Entrega', 'Zona', 'Día', 'Horario', 'Pago', 'Estado pago', 'Estado', 'Productos', 'Total']].concat(os.map(o => [o.code, o.createdAt.slice(0, 16).replace('T', ' '), o.customer.name, o.customer.phone, o.delivery.method, o.delivery.zone, o.delivery.date, o.delivery.slot, o.payment.method, o.payment.status, STATUS[o.status].label, o.items.map(i => i.qty + 'x ' + i.name).join(' | '), o.total]));
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="pedidos-dulce29.csv"' }).send('﻿' + rows.map(r => r.map(cell).join(';')).join('\n'));
};
const findOrder = req => db.orders.find(o => String(o.id) === String(req.params.id));
exports.order = (req, res) => {
  const o = findOrder(req); if (!o) return res.status(404).render('errors/404');
  o.isNew = false; const h = O.hydrate(o), c = h.client;
  res.render('admin/order', { o: h, next: O.nextStatus(o), deliverers: db.deliverers.filter(d => d.active), wa: wa.toClientLink(o),
    waReady: wa.toClientLink(o, `Hola ${o.customer.name.split(' ')[0]}, tu pedido #${o.code} de Dulce29 ${o.delivery.method === 'retiro' ? 'está listo para retirar en ' + db.settings.delivery.pickupAddress : 'ya salió'}. Total ${money(o.total)}.`),
    clientOrders: c ? db.orders.filter(x => x.clientId === c.id).length : 0, zones: db.zones, slots: db.settings.delivery.slots, dates: O.deliveryDates(8) });
};
exports.orderStatus = (req, res) => { const o = findOrder(req); if (o) { O.setStatus(o, req.body.status, by(req), req.body.note); req.flash('ok', `Pedido #${o.code}: ${STATUS[req.body.status].label}.`); } back(req, res, '/admin/pedidos'); };
exports.orderAssign = (req, res) => {
  const ids = [].concat(req.body.ids || req.params.id || []), d = db.deliverers.find(x => x.id === +req.body.delivererId);
  ids.forEach(id => { const o = db.orders.find(x => String(x.id) === String(id)); if (!o) return; o.delivererId = d ? d.id : null; o.history.push({ at: new Date().toISOString(), status: o.status, by: by(req), note: d ? `Asignado a ${d.name}` : 'Sin repartidor' }); });
  req.flash('ok', d ? `${ids.length} pedido(s) asignado(s) a ${d.name}.` : 'Quitamos el repartidor.'); back(req, res, '/admin/entregas');
};
exports.orderPayment = (req, res) => { const o = findOrder(req); if (o) { o.payment.status = req.body.status === 'pagado' ? 'pagado' : 'pendiente'; if (req.body.method) o.payment.method = req.body.method; o.history.push({ at: new Date().toISOString(), status: o.status, by: by(req), note: `Pago ${o.payment.status} (${o.payment.method})` }); req.flash('ok', 'Pago actualizado.'); } back(req, res, '/admin/pedidos'); };
exports.orderNote = (req, res) => { const o = findOrder(req); if (o && String(req.body.note || '').trim()) { o.history.push({ at: new Date().toISOString(), status: o.status, by: by(req), note: req.body.note.trim(), internal: true }); req.flash('ok', 'Nota agregada.'); } back(req, res, '/admin/pedidos'); };
exports.orderDelivery = (req, res) => {
  const o = findOrder(req), b = req.body; if (!o) return back(req, res, '/admin/pedidos');
  Object.assign(o.delivery, { method: b.method || o.delivery.method, street: b.street ?? o.delivery.street, zone: b.zone ?? o.delivery.zone, date: b.date || o.delivery.date, slot: b.slot || o.delivery.slot, notes: b.notes ?? o.delivery.notes });
  const z = db.zones.find(x => x.name === o.delivery.zone); if (z && b.street) { o.delivery.lat = z.lat + (Math.random() - .5) * .006; o.delivery.lng = z.lng + (Math.random() - .5) * .006; }
  o.history.push({ at: new Date().toISOString(), status: o.status, by: by(req), note: `Entrega modificada: ${o.delivery.date} ${o.delivery.slot}` }); req.flash('ok', 'Datos de entrega actualizados.'); back(req, res, '/admin/pedidos');
};
// pedido manual (teléfono / WhatsApp / local)
exports.newOrder = (req, res) => res.render('admin/order-new', { values: { channel: 'whatsapp', method: 'envio', payment: 'Efectivo', clientId: req.query.cliente || '' }, ...manualCtx() });
const manualCtx = () => ({ products: db.products.filter(p => p.active), promos: db.promotions.filter(p => p.active).map(promoView), clients: db.clients.slice().sort((a, b) => a.name.localeCompare(b.name)), zones: db.zones.filter(z => z.active), dates: O.deliveryDates(8), slots: db.settings.delivery.slots });
exports.createOrder = (req, res) => {
  const b = req.body, c = b.clientId ? db.clients.find(x => x.id === +b.clientId) : null;
  const items = []; Object.entries(b.qty || {}).forEach(([k, v]) => { const q = +v; if (q > 0) { const [type, id] = k.split('-'); items.push(type === 'promo' ? { type, promoId: +id, qty: q } : { type: 'product', productId: +id, qty: q }); } });
  const r = O.create({ customer: { name: b.name || (c && c.name), phone: b.phone || (c && c.phone), email: b.email || (c && c.email) || '' }, clientId: c ? c.id : null, channel: b.channel || 'manual', by: by(req),
    delivery: { method: b.method, street: b.street, zone: b.zone, notes: b.addrNotes, date: b.date, slot: b.slot }, payment: { method: b.payment }, notes: b.notes, items });
  if (r.errors) return res.status(422).render('admin/order-new', { values: b, errors: r.errors, ...manualCtx() });
  const o = r.order;
  if (!c) { let cl = db.clients.find(x => x.phone.replace(/\D/g, '') === o.customer.phone.replace(/\D/g, '')); if (!cl) { cl = { id: db.nextId('clients'), name: o.customer.name, email: o.customer.email, phone: o.customer.phone, notes: '', createdAt: o.createdAt, favorites: [], addresses: [] }; db.clients.push(cl); } o.clientId = cl.id; }
  if (b.paid) o.payment.status = 'pagado'; o.isNew = false;
  req.flash('ok', `Pedido #${o.code} creado (${money(o.total)}).`); res.redirect('/admin/pedidos/' + o.id);
};

// ---------- productos, categorías, stock ----------
exports.products = (req, res) => {
  const q = req.query; let ps = db.products.slice();
  if (q.q) ps = ps.filter(p => p.name.toLowerCase().includes(q.q.toLowerCase()));
  if (q.categoria) ps = ps.filter(p => p.categoryId === +q.categoria);
  if (q.estado === 'activos') ps = ps.filter(p => p.active); else if (q.estado === 'ocultos') ps = ps.filter(p => !p.active); else if (q.estado === 'sinstock') ps = ps.filter(p => p.stock <= 0);
  const sold = units30();
  res.render('admin/products', { products: ps.map(p => ({ ...p, sold: sold[p.id] || 0 })), q });
};
function units30() { const t = today(), from = addDays(t, -29), s = {}; db.orders.filter(o => valid(o) && dayOf(o.createdAt) >= from).forEach(o => Object.entries(O.units(o.items)).forEach(([id, n]) => { s[id] = (s[id] || 0) + n; })); return s; }
exports.productForm = (req, res) => { const p = req.params.id ? db.products.find(x => x.id === +req.params.id) : null; if (req.params.id && !p) return res.status(404).render('errors/404'); res.render('admin/product-form', { p: p || { active: true, stock: 0, minStock: 5, tags: [], color: '#E9DCCF', conservation: 'Mantener refrigerado entre 2 y 6 °C.' }, isNew: !p }); };
exports.saveProduct = (req, res) => {
  const b = req.body, errors = [];
  if (!String(b.name || '').trim()) errors.push('Falta el nombre.'); if (!(+b.price > 0)) errors.push('El precio tiene que ser mayor a 0.'); if (!db.categories.find(c => c.id === +b.categoryId)) errors.push('Elegí una categoría.');
  const cat = db.categories.find(c => c.id === +b.categoryId);
  const data = { name: (b.name || '').trim(), categoryId: +b.categoryId, category: cat ? cat.name : '', price: +b.price, compareAt: num(b.compareAt), stock: Math.max(0, +b.stock || 0), minStock: Math.max(0, +b.minStock || 0), size: (b.size || '').trim(), image: (b.image || '').trim(),
    description: (b.description || '').trim(), ingredients: (b.ingredients || '').trim(), conservation: (b.conservation || '').trim(), tags: String(b.tags || '').split(',').map(s => s.trim()).filter(Boolean), color: b.color || '#E9DCCF', featured: !!b.featured, active: !!b.active };
  let p = b.id ? db.products.find(x => x.id === +b.id) : null;
  const s = slug(b.slug || data.name); if (db.products.find(x => x.slug === s && (!p || x.id !== p.id))) errors.push('Ya hay un producto con esa dirección (slug).');
  if (errors.length) return res.status(422).render('admin/product-form', { p: { ...data, id: b.id, slug: s }, isNew: !p, errors });
  if (p) { if (p.stock !== data.stock) stockLog(p, data.stock - p.stock, 'Edición de producto', by(req)); Object.assign(p, data, { slug: s }); }
  else { p = { id: db.nextId('products'), slug: s, gallery: [], createdAt: new Date().toISOString(), ...data }; db.products.push(p); stockLog(p, p.stock, 'Alta de producto', by(req)); }
  req.flash('ok', `Guardamos «${p.name}».`); res.redirect(b.again ? '/admin/productos/nuevo' : '/admin/productos');
};
exports.toggleProduct = (req, res) => { const p = db.products.find(x => x.id === +req.params.id); if (p) { const f = req.body.field === 'featured' ? 'featured' : 'active'; p[f] = !p[f]; } back(req, res, '/admin/productos'); };
exports.deleteProduct = (req, res) => {
  const p = db.products.find(x => x.id === +req.params.id); if (!p) return res.redirect('/admin/productos');
  if (db.orders.some(o => o.items.some(i => i.productId === p.id))) { p.active = false; req.flash('ok', `«${p.name}» tiene pedidos: lo ocultamos de la tienda en lugar de borrarlo.`); }
  else { db.products.splice(db.products.indexOf(p), 1); req.flash('ok', `Eliminamos «${p.name}».`); }
  res.redirect('/admin/productos');
};
exports.upload = (req, res) => {
  const name = decodeURIComponent(req.get('x-filename') || 'imagen.jpg'), ext = path.extname(name).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) return res.status(400).json({ error: 'Formato no permitido (jpg, png, webp).' });
  const file = Date.now() + '-' + slug(path.basename(name, ext)).slice(0, 40) + ext;
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'uploads', file), req.body);
  res.json({ path: '/uploads/' + file });
};
exports.categories = (req, res) => res.render('admin/categories', { cats: db.categories.map(c => ({ ...c, n: db.products.filter(p => p.categoryId === c.id).length })), edit: req.query.editar ? db.categories.find(c => c.id === +req.query.editar) : null });
exports.saveCategory = (req, res) => {
  const b = req.body; if (!String(b.name || '').trim()) { req.flash('error', 'Falta el nombre.'); return res.redirect('/admin/categorias'); }
  const data = { name: b.name.trim(), slug: slug(b.name), description: (b.description || '').trim(), color: b.color || '#E9DCCF' };
  const c = b.id ? db.categories.find(x => x.id === +b.id) : null;
  if (c) { Object.assign(c, data); db.products.filter(p => p.categoryId === c.id).forEach(p => { p.category = c.name; }); } else db.categories.push({ id: db.nextId('categories'), ...data });
  req.flash('ok', `Categoría «${data.name}» guardada.`); res.redirect('/admin/categorias');
};
exports.deleteCategory = (req, res) => { const c = db.categories.find(x => x.id === +req.params.id); if (c && db.products.some(p => p.categoryId === c.id)) req.flash('error', `«${c.name}» tiene productos: movelos a otra categoría antes de eliminarla.`); else if (c) { db.categories.splice(db.categories.indexOf(c), 1); req.flash('ok', 'Categoría eliminada.'); } res.redirect('/admin/categorias'); };
function stockLog(p, delta, reason, who) { db.stockLog = db.stockLog || []; db.stockLog.unshift({ at: new Date().toISOString(), productId: p.id, name: p.name, delta, after: p.stock + (reason === 'Edición de producto' || reason === 'Alta de producto' ? 0 : 0), reason, by: who }); db.stockLog = db.stockLog.slice(0, 200); }
exports.stock = (req, res) => {
  const f = req.query.filtro || 'todos', sold = units30();
  let ps = db.products.filter(p => p.active).map(p => ({ ...p, sold: sold[p.id] || 0, days: sold[p.id] ? Math.floor(p.stock / (sold[p.id] / 30)) : null }));
  if (f === 'bajo') ps = ps.filter(p => p.stock <= p.minStock);
  ps.sort((a, b) => (a.stock - a.minStock) - (b.stock - b.minStock));
  const reserved = {}; db.orders.filter(o => ['recibido', 'preparando', 'listo'].includes(o.status)).forEach(o => Object.entries(O.units(o.items)).forEach(([id, n]) => { reserved[id] = (reserved[id] || 0) + n; }));
  res.render('admin/stock', { products: ps, f, log: (db.stockLog || []).slice(0, 25), reserved, value: db.products.filter(p => p.active).reduce((a, p) => a + p.stock * p.price, 0) });
};
exports.adjustStock = (req, res) => {
  const p = db.products.find(x => x.id === +req.params.id); if (!p) return res.redirect('/admin/stock');
  const mode = req.body.mode, n = Math.round(+req.body.amount || 0); const before = p.stock;
  p.stock = Math.max(0, mode === 'set' ? n : p.stock + (mode === 'out' ? -n : n));
  db.stockLog = db.stockLog || []; db.stockLog.unshift({ at: new Date().toISOString(), productId: p.id, name: p.name, delta: p.stock - before, after: p.stock, reason: req.body.reason || (mode === 'set' ? 'Conteo' : mode === 'out' ? 'Merma' : 'Producción'), by: by(req) });
  if (req.body.min !== undefined && req.body.min !== '') p.minStock = Math.max(0, +req.body.min);
  req.flash('ok', `${p.name}: stock ${before} → ${p.stock}.`); back(req, res, '/admin/stock');
};

// ---------- promociones ----------
exports.promos = (req, res) => res.render('admin/promos', { promos: db.promotions.map(promoView) });
exports.promoForm = (req, res) => { const pr = req.params.id ? db.promotions.find(x => x.id === +req.params.id) : null; res.render('admin/promo-form', { pr: pr || { kind: 'pack', items: [{ productId: '', qty: 1 }], active: true, featured: false }, isNew: !pr, products: db.products.filter(p => p.active) }); };
exports.savePromo = (req, res) => {
  const b = req.body, items = [].concat(b.items || []).filter(i => i && +i.productId && +i.qty > 0).map(i => ({ productId: +i.productId, qty: +i.qty }));
  const errors = []; if (!String(b.name || '').trim()) errors.push('Falta el nombre.'); if (!items.length) errors.push('Agregá al menos un producto.'); if (!(+b.price > 0)) errors.push('Falta el precio del pack.');
  const data = { name: (b.name || '').trim(), slug: slug(b.name), kind: b.kind, description: (b.description || '').trim(), items, price: +b.price, image: (b.image || '').trim(), badge: (b.badge || '').trim(), until: b.until || '', active: !!b.active, featured: !!b.featured };
  if (errors.length) return res.status(422).render('admin/promo-form', { pr: { ...data, id: b.id }, isNew: !b.id, products: db.products.filter(p => p.active), errors });
  const pr = b.id ? db.promotions.find(x => x.id === +b.id) : null; if (pr) Object.assign(pr, data); else db.promotions.push({ id: db.nextId('promotions'), ...data });
  req.flash('ok', `Guardamos «${data.name}».`); res.redirect('/admin/promociones');
};
exports.togglePromo = (req, res) => { const p = db.promotions.find(x => x.id === +req.params.id); if (p) p.active = !p.active; res.redirect('/admin/promociones'); };
exports.deletePromo = (req, res) => { db.promotions = db.promotions.filter(x => x.id !== +req.params.id); req.flash('ok', 'Promoción eliminada.'); res.redirect('/admin/promociones'); };

// ---------- clientes ----------
function clientStats(c) { const os = db.orders.filter(o => o.clientId === c.id), ok = os.filter(o => o.status === 'entregado'); return { orders: os.length, spent: ok.reduce((a, o) => a + o.total, 0), last: os.sort((a, b) => b.id - a.id)[0] || null }; }
exports.clients = (req, res) => {
  const q = req.query; let cs = db.clients.map(c => ({ ...c, ...clientStats(c) }));
  if (q.q) { const t = q.q.toLowerCase(); cs = cs.filter(c => (c.name + ' ' + c.email + ' ' + c.phone).toLowerCase().includes(t)); }
  if (q.tipo === 'recurrentes') cs = cs.filter(c => c.orders >= 3); else if (q.tipo === 'nuevos') cs = cs.filter(c => dayOf(c.createdAt) >= addDays(today(), -30)); else if (q.tipo === 'inactivos') cs = cs.filter(c => !c.last || dayOf(c.last.createdAt) < addDays(today(), -21));
  const sorts = { gasto: (a, b) => b.spent - a.spent, pedidos: (a, b) => b.orders - a.orders, nombre: (a, b) => a.name.localeCompare(b.name), reciente: (a, b) => (b.last ? b.last.id : 0) - (a.last ? a.last.id : 0) };
  cs.sort(sorts[q.orden] || sorts.reciente);
  res.render('admin/clients', { clients: cs, q, hasAccount: id => db.users.some(u => u.clientId === id) });
};
exports.client = (req, res) => {
  const c = db.clients.find(x => x.id === +req.params.id); if (!c) return res.status(404).render('errors/404');
  const os = db.orders.filter(o => o.clientId === c.id).sort((a, b) => b.id - a.id).map(O.hydrate), st = clientStats(c);
  const cnt = {}; os.forEach(o => o.items.forEach(i => { cnt[i.name] = (cnt[i.name] || 0) + i.qty; }));
  res.render('admin/client', { c, os, st, ticket: os.length ? os.reduce((a, o) => a + o.total, 0) / os.length : 0, top: Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 5),
    favs: db.products.filter(p => c.favorites.includes(p.id)), inq: db.inquiries.filter(i => i.clientId === c.id), account: db.users.find(u => u.clientId === c.id), wa: wa.link(`Hola ${c.name.split(' ')[0]}, te escribimos de Dulce29.`, c.phone.replace(/\D/g, '').replace(/^0?9/, '5989')), zones: db.zones });
};
exports.saveClient = (req, res) => {
  const b = req.body; let c = b.id ? db.clients.find(x => x.id === +b.id) : null;
  if (!String(b.name || '').trim() || String(b.phone || '').replace(/\D/g, '').length < 8) { req.flash('error', 'Nombre y teléfono son obligatorios.'); return back(req, res, '/admin/clientes'); }
  const data = { name: b.name.trim(), phone: b.phone.trim(), email: (b.email || '').trim(), notes: (b.notes || '').trim() };
  if (c) Object.assign(c, data); else { c = { id: db.nextId('clients'), ...data, createdAt: new Date().toISOString(), favorites: [], addresses: [] }; db.clients.push(c); }
  if (b.street && db.zones.find(z => z.name === b.zone)) { const z = db.zones.find(x => x.name === b.zone); c.addresses.push({ id: Math.max(0, ...db.clients.flatMap(x => x.addresses.map(a => a.id))) + 1, label: b.label || 'Casa', street: b.street, zone: b.zone, notes: b.addrNotes || '', lat: z.lat + (Math.random() - .5) * .006, lng: z.lng + (Math.random() - .5) * .006 }); }
  req.flash('ok', `Guardamos a ${c.name}.`); res.redirect('/admin/clientes/' + c.id);
};
exports.newClient = (req, res) => res.render('admin/client-new', { zones: db.zones });

// ---------- repartidores y entregas ----------
exports.riders = (req, res) => {
  const t = today();
  res.render('admin/riders', { riders: db.deliverers.map(d => { const os = db.orders.filter(o => o.delivererId === d.id); return { ...d, user: db.users.find(u => u.delivererId === d.id), today: os.filter(o => o.delivery.date === t && valid(o)).length, done: os.filter(o => o.status === 'entregado').length, failed: os.filter(o => o.status === 'no_entregado').length, onRoute: os.filter(o => o.status === 'en_camino').length }; }),
    edit: req.query.editar ? db.deliverers.find(d => d.id === +req.query.editar) : null, zones: db.zones });
};
exports.saveRider = (req, res) => {
  const b = req.body; if (!String(b.name || '').trim()) { req.flash('error', 'Falta el nombre.'); return res.redirect('/admin/repartidores'); }
  const data = { name: b.name.trim(), phone: (b.phone || '').trim(), vehicle: b.vehicle || 'Moto', zones: [].concat(b.zones || []), active: !!b.active };
  let d = b.id ? db.deliverers.find(x => x.id === +b.id) : null; if (d) Object.assign(d, data); else { d = { id: db.nextId('deliverers'), ...data }; db.deliverers.push(d); }
  let u = db.users.find(x => x.delivererId === d.id);
  if (!u && b.email && b.password) { if (A.findByEmail(b.email)) req.flash('error', 'Ese email ya tiene usuario.'); else { db.users.push({ id: db.nextId('users'), name: d.name, email: b.email.trim(), role: 'delivery', delivererId: d.id, pass: A.hash(b.password), active: true, createdAt: new Date().toISOString() }); } }
  else if (u) { u.name = d.name; u.active = d.active; }
  if (!req.session.flash) req.flash('ok', `Guardamos a ${d.name}.`); res.redirect('/admin/repartidores');
};
exports.deliveries = (req, res) => {
  const date = req.query.dia || today();
  const os = db.orders.filter(o => o.delivery.method === 'envio' && o.delivery.date === date && valid(o)).sort((a, b) => a.delivery.slot.localeCompare(b.delivery.slot) || a.id - b.id).map(O.hydrate);
  const pickups = db.orders.filter(o => o.delivery.method === 'retiro' && o.delivery.date === date && valid(o)).map(O.hydrate);
  const days = []; for (let k = -2; k <= 4; k++) { const d = addDays(today(), k); days.push({ d, label: k === 0 ? 'Hoy' : k === 1 ? 'Mañana' : k === -1 ? 'Ayer' : label(d), n: db.orders.filter(o => o.delivery.method === 'envio' && o.delivery.date === d && valid(o)).length }); }
  res.render('admin/deliveries', { date, os, pickups, days, riders: db.deliverers.filter(d => d.active), byRider: db.deliverers.filter(d => d.active).map(r => ({ r, items: os.filter(o => o.delivererId === r.id) })), unassigned: os.filter(o => !o.delivererId && o.status !== 'entregado') });
};
exports.map = (req, res) => {
  const date = req.query.dia || today(), rid = req.query.repartidor;
  let os = db.orders.filter(o => o.delivery.method === 'envio' && o.delivery.date === date && valid(o)); if (rid) os = os.filter(o => String(o.delivererId || 0) === rid);
  const colors = ['#0E3B2E', '#C2452D', '#2F6FB0', '#B7791F'], col = o => o.delivererId ? colors[(o.delivererId - 1) % colors.length + 1] || colors[1] : '#8A958E';
  const points = os.map((o, i) => ({ lat: o.delivery.lat, lng: o.delivery.lng, label: `#${o.code} ${o.customer.name}`, sub: `${o.delivery.street} · ${o.delivery.slot} · ${STATUS[o.status].label}`, href: '/admin/pedidos/' + o.id, color: o.status === 'entregado' ? '#1F8A55' : col(o), n: i + 1 }));
  res.render('admin/map', { date, points, os: os.map(O.hydrate), riders: db.deliverers, rid, colors, zones: db.zones });
};

// ---------- consultas / leads ----------
exports.inquiries = kind => (req, res) => {
  const f = req.query.estado || 'abiertas'; let items = db.inquiries.filter(i => i.kind === kind);
  const counts = Object.fromEntries(Object.keys(LEAD).map(s => [s, items.filter(i => i.status === s).length]));
  if (f === 'abiertas') items = items.filter(i => !['cerrado', 'descartado'].includes(i.status)); else if (f !== 'todas') items = items.filter(i => i.status === f);
  res.render('admin/inquiries', { kind, items: items.sort((a, b) => b.id - a.id), f, counts, title: { contacto: 'Consultas y contactos', epigenetica: 'Epigenética · interesados', thermomix: 'Thermomix · interesados' }[kind], waFor: i => wa.link(`Hola ${i.name.split(' ')[0]}, te escribimos de Dulce29 por tu consulta.`, (i.phone || '').replace(/\D/g, '').replace(/^0?9/, '5989')) });
};
exports.updateInquiry = (req, res) => {
  const i = db.inquiries.find(x => x.id === +req.params.id); if (!i) return back(req, res, '/admin');
  if (req.body.status && LEAD[req.body.status]) i.status = req.body.status;
  if (String(req.body.note || '').trim()) i.notes.push({ at: new Date().toISOString(), text: req.body.note.trim(), by: by(req) });
  if (req.body.toClient && !i.clientId) { let c = db.clients.find(x => i.phone && x.phone.replace(/\D/g, '') === i.phone.replace(/\D/g, '')); if (!c) { c = { id: db.nextId('clients'), name: i.name, email: i.email, phone: i.phone, notes: `Desde consulta de ${i.kind}`, createdAt: new Date().toISOString(), favorites: [], addresses: [] }; db.clients.push(c); } i.clientId = c.id; }
  req.flash('ok', 'Consulta actualizada.'); back(req, res, '/admin');
};

// ---------- economía y reportes ----------
function period(q) { const t = today(), n = { '7': 7, '30': 30, '90': 90 }[q.periodo] || 30; const from = q.desde || addDays(t, -(n - 1)), to = q.hasta || t; return { from, to, n: Math.round((new Date(to) - new Date(from)) / 864e5) + 1, key: q.desde ? 'custom' : String(n) }; }
const inPeriod = (p, o) => { const d = dayOf(o.createdAt); return d >= p.from && d <= p.to; };
exports.sales = (req, res) => {
  const p = period(req.query), os = db.orders.filter(o => valid(o) && inPeriod(p, o)), sum = a => a.reduce((x, o) => x + o.total, 0);
  const prevP = { from: addDays(p.from, -p.n), to: addDays(p.from, -1) }, prev = db.orders.filter(o => valid(o) && inPeriod(prevP, o));
  const days = []; for (let d = p.from; d <= p.to; d = addDays(d, 1)) { const v = os.filter(o => dayOf(o.createdAt) === d); days.push({ label: label(d), value: sum(v), title: `${label(d)}: ${money(sum(v))} · ${v.length} pedidos` }); }
  const group = (key) => { const m = {}; os.forEach(o => { const k = key(o); m[k] = m[k] || { n: 0, total: 0 }; m[k].n++; m[k].total += o.total; }); return Object.entries(m).map(([k, v]) => ({ k, ...v })).sort((a, b) => b.total - a.total); };
  const total = sum(os);
  res.render('admin/sales', { p, k: { total, orders: os.length, ticket: os.length ? total / os.length : 0, prevTotal: sum(prev), shipping: os.reduce((a, o) => a + o.shipping, 0), pending: os.filter(o => o.payment.status === 'pendiente').reduce((a, o) => a + o.total, 0), cancelled: db.orders.filter(o => o.status === 'cancelado' && inPeriod(p, o)).length },
    chart: chart.bars(days, { every: Math.ceil(days.length / 15) }), byPay: group(o => o.payment.method), byChannel: group(o => ({ web: 'Web', whatsapp: 'WhatsApp', manual: 'Manual / teléfono', local: 'Local' })[o.channel] || o.channel), byMethod: group(o => o.delivery.method === 'retiro' ? 'Retiro en local' : 'Envío'), byPaid: group(o => o.payment.status === 'pagado' ? 'Cobrado' : 'Pendiente de cobro'), total });
};
exports.reports = (req, res) => {
  const p = period(req.query), os = db.orders.filter(o => valid(o) && inPeriod(p, o)), prod = {}, cat = {}, zone = {}, dow = [0, 0, 0, 0, 0, 0, 0], slot = {};
  os.forEach(o => { o.items.forEach(i => { const k = i.name; prod[k] = prod[k] || { qty: 0, total: 0 }; prod[k].qty += i.qty; prod[k].total += i.qty * i.price; const pp = i.productId && db.products.find(x => x.id === i.productId); const c = pp ? pp.category : 'Packs'; cat[c] = (cat[c] || 0) + i.qty * i.price; });
    if (o.delivery.zone) zone[o.delivery.zone] = (zone[o.delivery.zone] || 0) + 1; dow[new Date(o.createdAt).getDay()]++; slot[o.delivery.slot] = (slot[o.delivery.slot] || 0) + 1; });
  const clientsMap = {}; os.forEach(o => { clientsMap[o.clientId] = clientsMap[o.clientId] || { n: 0, total: 0 }; clientsMap[o.clientId].n++; clientsMap[o.clientId].total += o.total; });
  const recurring = Object.entries(clientsMap).map(([id, v]) => ({ c: db.clients.find(c => c.id === +id), ...v })).filter(x => x.c).sort((a, b) => b.n - a.n || b.total - a.total);
  const sortE = (o, f = x => x) => Object.entries(o).map(([k, v]) => ({ k, v: f(v) }));
  res.render('admin/reports', { p, top: Object.entries(prod).map(([k, v]) => ({ k, ...v })).sort((a, b) => b.total - a.total).slice(0, 12), cats: sortE(cat).sort((a, b) => b.v - a.v), zones: sortE(zone).sort((a, b) => b.v - a.v),
    dow: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((k, i) => ({ k, v: dow[i] })), slots: sortE(slot), recurring: recurring.slice(0, 10), repeatRate: recurring.length ? recurring.filter(r => r.n > 1).length / recurring.length : 0, orders: os.length });
};

// ---------- configuración ----------
exports.settings = (req, res) => res.render('admin/settings', { s: db.settings, tab: req.params.tab || 'negocio', zones: db.zones });
exports.saveSettings = (req, res) => {
  const tab = req.params.tab || 'negocio', b = req.body, s = db.settings;
  if (tab === 'negocio') Object.assign(s.business, { name: b.name, legalName: b.legalName, email: b.email, phone: b.phone, whatsapp: String(b.whatsapp || '').replace(/\D/g, ''), instagram: String(b.instagram || '').replace('@', ''), address: b.address, hours: b.hours });
  if (tab === 'entregas') {
    Object.assign(s.delivery, { minOrder: +b.minOrder || 0, freeFrom: +b.freeFrom || 0, cutoff: b.cutoff || '18:00', pickup: !!b.pickup, pickupAddress: b.pickupAddress || '', days: [].concat(b.days || []).map(Number), slots: String(b.slots || '').split('\n').map(x => x.trim()).filter(Boolean) });
    const zs = [].concat(b.zones || []).filter(z => z && String(z.name || '').trim());
    db.zones = zs.map((z, i) => { const old = db.zones.find(x => x.id === +z.id); return { id: old ? old.id : Math.max(0, ...db.zones.map(x => x.id)) + 1 + i, name: z.name.trim(), cost: +z.cost || 0, eta: z.eta || '', active: !!z.active, lat: old ? old.lat : -34.465, lng: old ? old.lng : -57.84 }; });
  }
  if (tab === 'pagos') { s.payments.cash = { on: !!b.cash_on, note: b.cash_note }; s.payments.transfer = { on: !!b.transfer_on, bank: b.bank, account: b.account, holder: b.holder, note: b.transfer_note }; s.payments.mercadopago = { on: !!b.mp_on, link: b.mp_link, note: b.mp_note }; }
  req.flash('ok', 'Configuración guardada.'); res.redirect('/admin/configuracion/' + tab);
};
exports.users = (req, res) => res.render('admin/users', { users: db.users.map(u => ({ ...u, link: u.clientId ? db.clients.find(c => c.id === u.clientId) : u.delivererId ? db.deliverers.find(d => d.id === u.delivererId) : null })), riders: db.deliverers });
exports.saveUser = (req, res) => {
  const b = req.body, errors = [];
  if (!String(b.name || '').trim()) errors.push('Falta el nombre.'); if (!/^\S+@\S+\.\S+$/.test(b.email || '')) errors.push('Revisá el email.'); if (A.findByEmail(b.email)) errors.push('Ya existe un usuario con ese email.'); if (String(b.password || '').length < 6) errors.push('La contraseña necesita 6 caracteres.');
  if (errors.length) { req.flash('error', errors.join(' ')); return res.redirect('/admin/usuarios'); }
  const u = { id: db.nextId('users'), name: b.name.trim(), email: b.email.trim(), role: b.role, pass: A.hash(b.password), active: true, createdAt: new Date().toISOString() };
  if (b.role === 'delivery') { let d = db.deliverers.find(x => x.id === +b.delivererId); if (!d) { d = { id: db.nextId('deliverers'), name: u.name, phone: '', vehicle: 'Moto', zones: [], active: true }; db.deliverers.push(d); } u.delivererId = d.id; }
  if (b.role === 'client') { const c = { id: db.nextId('clients'), name: u.name, email: u.email, phone: b.phone || '', notes: '', createdAt: u.createdAt, favorites: [], addresses: [] }; db.clients.push(c); u.clientId = c.id; }
  db.users.push(u); req.flash('ok', `Creamos el usuario de ${u.name}.`); res.redirect('/admin/usuarios');
};
exports.userAction = (req, res) => {
  const u = db.users.find(x => x.id === +req.params.id); if (!u) return res.redirect('/admin/usuarios');
  if (u.id === req.session.user.id && req.body.action !== 'password') { req.flash('error', 'No podés desactivar ni cambiar el rol de tu propio usuario.'); return res.redirect('/admin/usuarios'); }
  if (req.body.action === 'toggle') u.active = !u.active;
  if (req.body.action === 'role' && ['admin', 'client', 'delivery'].includes(req.body.role)) u.role = req.body.role;
  if (req.body.action === 'password') { const p = Math.random().toString(36).slice(2, 10); u.pass = A.hash(p); req.flash('ok', `Contraseña temporal de ${u.name}: ${p}`); return res.redirect('/admin/usuarios'); }
  req.flash('ok', `Actualizamos a ${u.name}.`); res.redirect('/admin/usuarios');
};
exports.content = (req, res) => res.render('admin/content', { c: db.content, tab: req.params.tab || 'inicio', productsList: db.products.filter(p => p.active) });
exports.saveContent = (req, res) => {
  const tab = req.params.tab || 'inicio', b = req.body, c = db.content, arr = v => [].concat(v || []).filter(Boolean);
  if (tab === 'inicio') { Object.assign(c.hero, b.hero); c.banners = arr(b.banners).filter(x => String(x.text || '').trim()).map((x, i) => ({ id: i + 1, text: x.text.trim(), active: !!x.active })); c.flavors = c.flavors.map((f, i) => Object.assign(f, (b.flavors || [])[i] || {}, { productId: +((b.flavors || [])[i] || {}).productId || f.productId })); c.steps = arr(b.steps).filter(x => x.title); }
  if (tab === 'nosotros') { c.about.title = b.title; c.about.text = b.text; c.about.story = String(b.story || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean); c.about.values = arr(b.values).filter(x => x.title); }
  if (tab === 'faq') c.faq = arr(b.faq).filter(x => String(x.q || '').trim() && String(x.a || '').trim()).map(x => ({ q: x.q.trim(), a: x.a.trim(), topic: (x.topic || 'Pedidos').trim() }));
  if (tab === 'servicios') ['epigenetica', 'thermomix'].forEach(k => { Object.assign(c[k], { title: b[k].title, lead: b[k].lead, price: b[k].price }); c[k].points = arr(b[k].points).filter(x => x.title); });
  if (tab === 'legales') { c.legal.terms = String(b.terms || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean); c.legal.privacy = String(b.privacy || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean); }
  if (tab === 'novedades') c.news = arr(b.news).filter(x => x.title);
  req.flash('ok', 'Contenido publicado. Ya se ve en la web.'); res.redirect('/admin/contenido/' + tab);
};
exports.resetDemo = (req, res) => { const u = req.session.user; db.reset(); req.flash('ok', 'Restablecimos los datos de demostración.'); req.session.user = u; res.redirect('/admin'); };
exports.products_ = { products: () => db.products };
