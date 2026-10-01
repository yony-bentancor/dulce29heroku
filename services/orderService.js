/* Pedidos: creación con control de stock, cambios de estado con historial, asignación de repartidor. */
const crypto = require('crypto');
const db = require('../data/demo');
const { STATUS, FLOW, money, today } = require('../utils/format');
const cart = require('./cartService');

function product(id) { return db.products.find(p => p.id === +id); }
function client(o) { return db.clients.find(c => c.id === o.clientId) || null; }
function hydrate(o) {
  if (!o) return o;
  return { ...o, st: STATUS[o.status] || { label: o.status }, client: client(o), deliverer: db.deliverers.find(d => d.id === o.delivererId) || null,
    items: o.items.map(i => ({ ...i, product: i.type === 'promo' ? null : product(i.productId), promo: i.type === 'promo' ? db.promotions.find(p => p.id === i.promoId) : null, promoLines: i.type === 'promo' ? ((db.promotions.find(p => p.id === i.promoId) || { items: [] }).items.map(x => `${x.qty}× ${(product(x.productId) || { name: '?' }).name}`).join(', ')) : '' })),
    step: (STATUS[o.status] || {}).step ?? 0, qty: o.items.reduce((a, i) => a + i.qty, 0) };
}
// unidades de producto que consume una línea (productos sueltos o packs)
function units(items) {
  const need = {};
  items.forEach(i => {
    if (i.type === 'promo') { const pr = db.promotions.find(p => p.id === +i.promoId); (pr ? pr.items : []).forEach(x => { need[x.productId] = (need[x.productId] || 0) + x.qty * i.qty; }); }
    else need[i.productId] = (need[i.productId] || 0) + i.qty;
  });
  return need;
}
function checkStock(items) {
  const need = units(items), problems = [];
  Object.entries(need).forEach(([id, q]) => { const p = product(id); if (!p || !p.active) problems.push(`${p ? p.name : 'Producto'} ya no está disponible.`); else if (p.stock < q) problems.push(`${p.name}: quedan ${p.stock} y pediste ${q}.`); });
  return problems;
}
function applyStock(items, sign = -1) { Object.entries(units(items)).forEach(([id, q]) => { const p = product(id); if (p) p.stock = Math.max(0, p.stock + sign * q); }); }

/* data: { customer:{name,phone,email}, delivery:{method,street,zone,notes,date,slot}, payment:{method}, notes, items:[{type,productId|promoId,qty}], clientId, channel, by } */
function create(data) {
  const errors = [];
  const c = data.customer || {}, d = data.delivery || {}, s = db.settings;
  if (!String(c.name || '').trim()) errors.push('Falta el nombre.');
  if (String(c.phone || '').replace(/\D/g, '').length < 8) errors.push('Revisá el teléfono: necesitamos al menos 8 números para coordinar.');
  if (!['envio', 'retiro'].includes(d.method)) errors.push('Elegí envío o retiro.');
  if (d.method === 'envio') { if (!String(d.street || '').trim()) errors.push('Falta la dirección de entrega.'); if (!db.zones.find(z => z.name === d.zone && z.active)) errors.push('Elegí una zona de entrega.'); }
  if (!d.date) errors.push('Elegí el día de entrega.'); if (!d.slot) errors.push('Elegí un horario.');
  const methods = { Efectivo: s.payments.cash.on, Transferencia: s.payments.transfer.on, 'Mercado Pago': s.payments.mercadopago.on };
  if (!methods[(data.payment || {}).method]) errors.push('Elegí una forma de pago.');
  const ls = cart.lines((data.items || []).map(i => ({ type: i.type, id: i.type === 'promo' ? i.promoId : i.productId, qty: +i.qty })));
  if (!ls.length) errors.push('La bolsa está vacía.');
  const items = ls.map(l => l.type === 'promo' ? { type: 'promo', promoId: l.item.id, name: l.name, price: l.price, qty: l.qty } : { type: 'product', productId: l.item.id, name: l.name, price: l.price, qty: l.qty });
  errors.push(...checkStock(items));
  const t = cart.totals(ls, { method: d.method, zone: d.zone });
  if (data.channel === 'web' && t.subtotal < s.delivery.minOrder && ls.length) errors.push(`El pedido mínimo es ${money(s.delivery.minOrder)}.`);
  if (errors.length) return { errors };
  applyStock(items, -1);
  const id = db.nextId('orders'), now = new Date().toISOString(), zone = db.zones.find(z => z.name === d.zone);
  const order = {
    id, code: String(id), token: crypto.randomBytes(5).toString('hex'), clientId: data.clientId || null, channel: data.channel || 'web',
    customer: { name: c.name.trim(), phone: c.phone.trim(), email: (c.email || '').trim() },
    delivery: { method: d.method, street: d.method === 'envio' ? d.street.trim() : '', zone: d.method === 'envio' ? d.zone : '', notes: d.notes || '', lat: d.lat || (zone && zone.lat + (Math.random() - .5) * .006), lng: d.lng || (zone && zone.lng + (Math.random() - .5) * .006), date: d.date, slot: d.slot },
    payment: { method: data.payment.method, status: 'pendiente' }, notes: (data.notes || '').trim(),
    items, subtotal: t.subtotal, shipping: t.shipping, discount: 0, total: t.total, status: 'recibido', delivererId: null,
    history: [{ at: now, status: 'recibido', by: data.by || 'Web' }], createdAt: now, stockApplied: true, isNew: true
  };
  db.orders.push(order);
  return { order };
}
function setStatus(o, status, by, note) {
  if (!STATUS[status] || o.status === status) return;
  if (status === 'cancelado' && o.stockApplied) { applyStock(o.items, +1); o.stockApplied = false; }
  if (o.status === 'cancelado' && status !== 'cancelado' && !o.stockApplied) { applyStock(o.items, -1); o.stockApplied = true; }
  o.status = status; o.isNew = false;
  if (status === 'entregado' && o.payment.method === 'Efectivo') o.payment.status = 'pagado';
  o.history.push({ at: new Date().toISOString(), status, by: by || 'Sistema', note: note || '' });
}
function nextStatus(o) { const i = FLOW.indexOf(o.status); if (i < 0 || i >= FLOW.length - 1) return null; let n = FLOW[i + 1]; if (n === 'en_camino' && o.delivery.method === 'retiro') n = 'entregado'; return n; }
function deliveryDates(n = 6) {
  const s = db.settings.delivery, out = [], base = new Date(), nowH = +new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Montevideo', hour: '2-digit' });
  const cut = +String(s.cutoff || '18').split(':')[0];
  for (let k = 0; out.length < n && k < 21; k++) {
    const d = new Date(base.getTime() + k * 86400000), iso = d.toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' }), dow = new Date(iso + 'T12:00:00').getDay();
    if (k === 0 && nowH >= cut) continue; if (!s.days.includes(dow)) continue;
    out.push({ iso, label: k === 0 ? 'Hoy' : k === 1 ? 'Mañana' : new Date(iso + 'T12:00:00').toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric' }) });
  }
  return out;
}
module.exports = { hydrate, create, setStatus, nextStatus, checkStock, deliveryDates, units, today };
