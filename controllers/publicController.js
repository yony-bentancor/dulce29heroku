const db = require('../data/demo');
const cartSvc = require('../services/cartService');
const promoView = pr => { const lines = pr.items.map(i => { const p = db.products.find(x => x.id === i.productId); return { ...i, name: p ? p.name : '—', price: p ? p.price : 0 }; });
  return { ...pr, lines, regular: lines.reduce((a, l) => a + l.price * l.qty, 0), stock: cartSvc.promoStock(pr) }; };
exports.promoView = promoView;

exports.home = (req, res) => {
  const active = db.products.filter(p => p.active);
  res.render('home/index', {
    featured: active.filter(p => p.featured).slice(0, 8), productCount: active.length,
    promos: db.promotions.filter(p => p.active && p.featured).slice(0, 3).map(promoView),
    flavorProducts: db.content.flavors.map(f => db.products.find(p => p.id === f.productId))
  });
};
exports.about = (req, res) => res.render('info/about');
exports.faq = (req, res) => { const topics = [...new Set(db.content.faq.map(f => f.topic))]; res.render('info/faq', { topics, faq: db.content.faq }); };
exports.legal = kind => (req, res) => res.render('info/legal', { kind, title: kind === 'terms' ? 'Términos y condiciones' : 'Política de privacidad', paras: db.content.legal[kind] });
exports.courses = (req, res) => res.render('info/courses', { courses: db.courses });
exports.contact = (req, res) => res.render('info/contact', { sent: req.query.enviado === '1', values: {} });
exports.service = kind => (req, res) => res.render('info/service', { kind, page: db.content[kind], sent: req.query.enviado === '1', values: {} });

// formularios de contacto y de interesados (Epigenética / Thermomix) → quedan en Admin
exports.inquiry = kind => (req, res) => {
  const b = req.body, errors = [];
  if (!String(b.name || '').trim()) errors.push('Falta tu nombre.');
  if (!String(b.phone || '').trim() && !String(b.email || '').trim()) errors.push('Dejanos un teléfono o un email para responderte.');
  if (!String(b.message || '').trim() && kind === 'contacto') errors.push('Escribí tu consulta.');
  const view = kind === 'contacto' ? 'info/contact' : 'info/service';
  if (errors.length) return res.status(422).render(view, { kind, page: db.content[kind], errors, values: b });
  const u = req.session.user;
  db.inquiries.push({ id: db.nextId('inquiries'), kind, name: b.name.trim(), email: (b.email || '').trim(), phone: (b.phone || '').trim(), message: (b.message || '').trim(),
    preferred: b.preferred || '', status: 'nuevo', clientId: u && u.clientId || null, createdAt: new Date().toISOString(), notes: [] });
  res.redirect((kind === 'contacto' ? '/contacto' : '/' + kind) + '?enviado=1#form');
};
