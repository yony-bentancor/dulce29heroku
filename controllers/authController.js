const crypto = require('crypto');
const db = require('../data/demo');
const A = require('../services/authService');
const home = u => u.role === 'admin' ? '/admin' : u.role === 'delivery' ? '/repartidor' : '/mi-cuenta';
function signIn(req, u) { req.session.user = A.sessionUser(u); u.lastLogin = new Date().toISOString();
  // si tenía favoritos como visitante, se suman a su cuenta
  const c = u.clientId && db.clients.find(x => x.id === u.clientId); if (c && req.session.favs) { req.session.favs.forEach(id => { if (!c.favorites.includes(id)) c.favorites.push(id); }); delete req.session.favs; } }
const back = (req, u) => { const to = req.session.returnTo || req.body.volver || req.query.volver; delete req.session.returnTo; return to && /^\/[^/]/.test(to) ? to : home(u); };

exports.loginForm = (req, res) => res.render('auth/login', { values: { volver: req.query.volver || '' } });
exports.login = (area) => (req, res) => {
  const u = A.findByEmail(req.body.email), ok = u && u.active && A.verify(req.body.password, u.pass);
  const roleOk = !area || (u && (u.role === area));
  const view = area === 'admin' ? 'auth/staff' : area === 'delivery' ? 'auth/staff' : 'auth/login';
  if (!ok || !roleOk) return res.status(401).render(view, { area, values: req.body, error: !ok ? 'El email o la contraseña no coinciden.' : 'Este usuario no tiene acceso a esta área.' });
  signIn(req, u); res.redirect(back(req, u));
};
exports.staffForm = area => (req, res) => res.render('auth/staff', { area, values: {} });
exports.demo = (req, res) => {
  const u = db.users.find(x => x.role === req.params.role && x.active); if (!u) return res.redirect('/ingresar');
  signIn(req, u); res.redirect(back(req, u));
};
exports.logout = (req, res) => { const cart = req.session.cart; req.session.regenerate(() => { req.session.cart = cart; res.redirect('/'); }); };

exports.registerForm = (req, res) => res.render('auth/register', { values: { name: req.query.nombre || '', phone: req.query.tel || '', email: req.query.email || '' } });
exports.register = (req, res) => {
  const b = req.body, errors = [];
  if (!String(b.name || '').trim()) errors.push('Escribí tu nombre.');
  if (!/^\S+@\S+\.\S+$/.test(b.email || '')) errors.push('Revisá el email.');
  if (String(b.phone || '').replace(/\D/g, '').length < 8) errors.push('Revisá el teléfono.');
  if (String(b.password || '').length < 6) errors.push('La contraseña necesita al menos 6 caracteres.');
  if (A.findByEmail(b.email)) errors.push('Ya hay una cuenta con ese email. Probá ingresar o recuperar la contraseña.');
  if (errors.length) return res.status(422).render('auth/register', { values: b, errors });
  // si ya compró como invitado (mismo teléfono o email), se vincula a su historial
  let c = db.clients.find(x => x.phone.replace(/\D/g, '') === b.phone.replace(/\D/g, '') || (x.email && x.email.toLowerCase() === b.email.toLowerCase()));
  if (!c) { c = { id: db.nextId('clients'), name: b.name.trim(), email: b.email.trim(), phone: b.phone.trim(), notes: '', createdAt: new Date().toISOString(), favorites: [], addresses: [] }; db.clients.push(c); }
  else Object.assign(c, { name: b.name.trim(), email: b.email.trim() });
  const u = { id: db.nextId('users'), name: b.name.trim(), email: b.email.trim(), role: 'client', clientId: c.id, pass: A.hash(b.password), active: true, createdAt: new Date().toISOString() };
  db.users.push(u); signIn(req, u); req.flash('ok', `Bienvenida/o, ${u.name.split(' ')[0]}. Tu cuenta está lista.`); res.redirect(back(req, u));
};
exports.recoverForm = (req, res) => res.render('auth/recover', { values: {} });
exports.recover = (req, res) => {
  const u = A.findByEmail(req.body.email); let demoLink = null;
  if (u) { const token = crypto.randomBytes(16).toString('hex'); db.resets.push({ token, userId: u.id, exp: Date.now() + 3600e3 }); demoLink = '/recuperar/' + token; }
  // en producción se envía por email; en la demo mostramos el enlace
  res.render('auth/recover', { sent: true, demoLink, values: req.body });
};
exports.resetForm = (req, res) => { const r = db.resets.find(x => x.token === req.params.token && x.exp > Date.now()); res.render('auth/reset', { valid: !!r, token: req.params.token }); };
exports.reset = (req, res) => {
  const r = db.resets.find(x => x.token === req.params.token && x.exp > Date.now());
  if (!r) return res.render('auth/reset', { valid: false });
  if (String(req.body.password || '').length < 6 || req.body.password !== req.body.password2) return res.status(422).render('auth/reset', { valid: true, token: req.params.token, error: 'Las contraseñas no coinciden o tienen menos de 6 caracteres.' });
  const u = db.users.find(x => x.id === r.userId); u.pass = A.hash(req.body.password); db.resets = db.resets.filter(x => x !== r);
  signIn(req, u); req.flash('ok', 'Cambiaste tu contraseña.'); res.redirect(home(u));
};
