/* App del repartidor (pantallas 53–59): entregas del día, ruta, detalle y cambios de estado. */
const db = require('../data/demo');
const O = require('../services/orderService'), wa = require('../services/whatsappService'), maps = require('../services/mapsService');
const { money, today, TZ } = require('../utils/format');

const OPEN = ['recibido', 'preparando', 'listo', 'en_camino'];
const dayOf = iso => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
const doneAt = o => { const h = o.history.filter(x => ['entregado', 'no_entregado'].includes(x.status)).pop(); return h ? h.at : null; };
const dist = (a, b) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 92); // km aproximados a esta latitud

// orden de visita: vecino más cercano desde el local, empezando por lo que ya está en camino
function route(list) {
  const base = { lat: db.settings.business.lat, lng: db.settings.business.lng }, left = list.filter(o => o.delivery.lat), out = [];
  let cur = base, km = 0;
  const first = left.filter(o => o.status === 'en_camino'); const rest = left.filter(o => o.status !== 'en_camino');
  [first, rest].forEach(group => { while (group.length) { group.sort((a, b) => dist(cur, a.delivery) - dist(cur, b.delivery)); const n = group.shift(); km += dist(cur, n.delivery); cur = n.delivery; out.push(n); } });
  return { stops: out.concat(list.filter(o => !o.delivery.lat)), km: Math.round(km * 1.3 * 10) / 10, base };
}
const mine = req => db.orders.filter(o => o.delivererId === req.rider.id && o.delivery.method === 'envio');
const cashToCollect = o => o.payment.method === 'Efectivo' && o.payment.status !== 'pagado' ? o.total : 0;
const view = o => { const h = O.hydrate(o); h.collect = cashToCollect(o); h.maps = maps.mapsUrl(o.delivery); h.tel = 'tel:' + o.customer.phone.replace(/\s/g, ''); h.picked = !!o.pickedUpAt; return h; };

exports.guard = (req, res, next) => {
  const u = req.session.user, r = db.deliverers.find(d => d.id === u.delivererId);
  if (!r) return res.status(403).render('errors/403');
  req.rider = r; res.locals.rider = r; res.locals.path = req.baseUrl + req.path; res.locals.today = today();
  res.locals.pending = mine(req).filter(o => OPEN.includes(o.status) && o.delivery.date <= today()).length;
  next();
};

// 54 · inicio del repartidor
exports.dashboard = (req, res) => {
  const t = today(), all = mine(req);
  const todays = all.filter(o => o.delivery.date === t && o.status !== 'cancelado');
  const late = all.filter(o => o.delivery.date < t && OPEN.includes(o.status));
  const open = route(late.concat(todays.filter(o => OPEN.includes(o.status))));
  const delivered = todays.filter(o => o.status === 'entregado');
  const zones = req.rider.zones || [];
  const available = db.orders.filter(o => o.delivery.method === 'envio' && !o.delivererId && OPEN.includes(o.status) && o.delivery.date <= t).map(view);
  res.render('delivery/dashboard', {
    next: open.stops[0] ? view(open.stops[0]) : null, queue: open.stops.slice(1, 4).map(view), more: Math.max(0, open.stops.length - 4),
    k: { pending: open.stops.length, done: delivered.length, failed: todays.filter(o => o.status === 'no_entregado').length, km: open.km,
      cash: open.stops.reduce((a, o) => a + cashToCollect(o), 0), collected: delivered.filter(o => o.payment.method === 'Efectivo').reduce((a, o) => a + o.total, 0) },
    available: available.sort((a, b) => (zones.includes(b.delivery.zone) ? 1 : 0) - (zones.includes(a.delivery.zone) ? 1 : 0)), zones
  });
};

// 55 · mis entregas
exports.list = (req, res) => {
  const t = today(), f = req.query.ver || 'hoy', all = mine(req);
  let items;
  if (f === 'proximas') items = all.filter(o => o.delivery.date > t && OPEN.includes(o.status)).sort((a, b) => a.delivery.date.localeCompare(b.delivery.date) || a.delivery.slot.localeCompare(b.delivery.slot));
  else if (f === 'hechas') items = all.filter(o => o.delivery.date === t && ['entregado', 'no_entregado'].includes(o.status)).sort((a, b) => (doneAt(b) || '').localeCompare(doneAt(a) || ''));
  else items = route(all.filter(o => OPEN.includes(o.status) && o.delivery.date <= t)).stops;
  const counts = { hoy: all.filter(o => OPEN.includes(o.status) && o.delivery.date <= t).length, proximas: all.filter(o => o.delivery.date > t && OPEN.includes(o.status)).length, hechas: all.filter(o => o.delivery.date === t && ['entregado', 'no_entregado'].includes(o.status)).length };
  res.render('delivery/list', { items: items.map(view), f, counts, t });
};

// 56 · mapa y ruta
exports.map = (req, res) => {
  const r = route(mine(req).filter(o => OPEN.includes(o.status) && o.delivery.date <= today()));
  const stops = r.stops.map(view);
  const points = [{ lat: r.base.lat, lng: r.base.lng, label: 'Local Dulce29', color: '#0E3B2E', n: 'D' }].concat(stops.filter(o => o.delivery.lat).map((o, i) => ({ lat: o.delivery.lat, lng: o.delivery.lng, label: `#${o.code} · ${o.customer.name} · ${o.delivery.street}`, href: '/repartidor/entregas/' + o.code, color: o.status === 'en_camino' ? '#14A06E' : '#E9B92F', n: i + 1 })));
  res.render('delivery/map', { stops, points, km: r.km, gmaps: stops.length ? maps.routeUrl([r.base].concat(stops.filter(o => o.delivery.lat).map(o => o.delivery))) : null });
};

// 57 · detalle de entrega
exports.detail = (req, res, next) => {
  const o = db.orders.find(x => x.code === req.params.code);
  if (!o) return next();
  const isMine = o.delivererId === req.rider.id, free = !o.delivererId && o.delivery.method === 'envio' && OPEN.includes(o.status);
  if (!isMine && !free) return res.status(403).render('errors/403');
  const v = view(o), first = o.customer.name.split(' ')[0];
  res.render('delivery/detail', { o: v, isMine, free,
    waWay: wa.toClientLink(o, `Hola ${first}, soy ${req.rider.name.split(' ')[0]} de Dulce29. Voy en camino con tu pedido #${o.code}${v.collect ? ` (total ${money(o.total)} en efectivo)` : ''}. Llego en unos minutos.`),
    waHere: wa.toClientLink(o, `Hola ${first}, estoy en la puerta con tu pedido #${o.code} de Dulce29.`),
    waMiss: wa.toClientLink(o, `Hola ${first}, pasé por ${o.delivery.street} con tu pedido #${o.code} y no pude entregarlo. ¿Coordinamos otro horario?`),
    reasons: ['No había nadie en el domicilio', 'No atiende el teléfono', 'Dirección incorrecta o incompleta', 'El cliente pidió otro horario', 'Rechazó el pedido'] });
};

// 58 · actualizar estado
exports.status = (req, res, next) => {
  const o = db.orders.find(x => x.code === req.params.code); if (!o) return next();
  if (o.delivererId !== req.rider.id) return res.status(403).render('errors/403');
  const by = req.session.user.name, a = req.body.action, now = new Date().toISOString();
  const go = msg => { req.flash('ok', msg); res.redirect(req.body.volver === 'inicio' ? '/repartidor' : '/repartidor/entregas/' + o.code); };
  if (a === 'retirado') {
    o.pickedUpAt = now;
    if (['recibido', 'preparando'].includes(o.status)) O.setStatus(o, 'listo', by, 'Retirado del local por el repartidor');
    else o.history.push({ at: now, status: o.status, by, note: 'Retirado del local' });
    return go(`Pedido #${o.code} retirado. Cuando salgas, marcá «En camino».`);
  }
  if (a === 'en_camino') { if (!o.pickedUpAt) o.pickedUpAt = now; O.setStatus(o, 'en_camino', by, req.body.note); return go(`#${o.code} en camino. El cliente ya lo ve en su seguimiento.`); }
  if (a === 'entregado') {
    O.setStatus(o, 'entregado', by, [req.body.receivedBy ? 'Recibió: ' + req.body.receivedBy : '', req.body.note].filter(Boolean).join(' · '));
    if (req.body.cash) o.payment.status = 'pagado';
    if (+req.body.bottles > 0) o.bottlesBack = +req.body.bottles;
    return go(`#${o.code} entregado${o.payment.method === 'Efectivo' ? ` · cobraste ${money(o.total)}` : ''}.`);
  }
  if (a === 'no_entregado') {
    const note = [req.body.reason, req.body.note].filter(Boolean).join(': ');
    if (!note) { req.flash('error', 'Elegí un motivo para «No entregado».'); return res.redirect('/repartidor/entregas/' + o.code + '#no-entregado'); }
    O.setStatus(o, 'no_entregado', by, note); return go(`#${o.code} marcado como no entregado. Administración lo va a reprogramar.`);
  }
  if (a === 'reintentar' && o.status === 'no_entregado') { O.setStatus(o, 'en_camino', by, 'Segundo intento de entrega'); return go(`#${o.code} vuelve a estar en camino.`); }
  res.redirect('/repartidor/entregas/' + o.code);
};

// tomar una entrega sin asignar
exports.take = (req, res, next) => {
  const o = db.orders.find(x => x.code === req.params.code); if (!o) return next();
  if (o.delivererId) { req.flash('error', `#${o.code} ya lo tomó otro repartidor.`); return res.redirect('/repartidor'); }
  o.delivererId = req.rider.id; o.history.push({ at: new Date().toISOString(), status: o.status, by: req.session.user.name, note: 'Tomó la entrega desde la app de reparto' });
  req.flash('ok', `Tomaste el pedido #${o.code}. Ya está en tu ruta.`); res.redirect('/repartidor/entregas/' + o.code);
};

// 59 · historial
exports.history = (req, res) => {
  const days = +req.query.dias || 7, t = today(), from = new Date(Date.now() - (days - 1) * 864e5).toLocaleDateString('en-CA', { timeZone: TZ });
  const done = mine(req).filter(o => ['entregado', 'no_entregado'].includes(o.status)).map(o => ({ o, at: doneAt(o) || o.createdAt })).filter(x => dayOf(x.at) >= from && dayOf(x.at) <= t).sort((a, b) => b.at.localeCompare(a.at));
  const groups = []; done.forEach(x => { const d = dayOf(x.at); let g = groups.find(g => g.d === d); if (!g) groups.push(g = { d, items: [], ok: 0, cash: 0 }); g.items.push({ ...view(x.o), at: x.at }); if (x.o.status === 'entregado') { g.ok++; if (x.o.payment.method === 'Efectivo') g.cash += x.o.total; } });
  const ok = done.filter(x => x.o.status === 'entregado');
  res.render('delivery/history', { groups, days, k: { ok: ok.length, failed: done.length - ok.length, cash: ok.filter(x => x.o.payment.method === 'Efectivo').reduce((a, x) => a + x.o.total, 0), rate: done.length ? Math.round(ok.length / done.length * 100) : 100 } });
};
