const crypto = require('crypto');
const db = require('../data/demo');
const hash = (pass, salt = crypto.randomBytes(8).toString('hex')) => salt + ':' + crypto.scryptSync(pass, salt, 32).toString('hex');
const verify = (pass, stored) => { if (!stored) return false; const [salt, h] = stored.split(':'); const a = Buffer.from(h, 'hex'), b = crypto.scryptSync(String(pass), salt, 32); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const findByEmail = email => db.users.find(u => u.email.toLowerCase() === String(email || '').trim().toLowerCase());
function sessionUser(u) { return { id: u.id, name: u.name, email: u.email, role: u.role, clientId: u.clientId || null, delivererId: u.delivererId || null }; }
module.exports = { hash, verify, findByEmail, sessionUser };
