/* Bolsa de compras guardada en la sesión: [{type:'product'|'promo', id, qty}] */
const db = require('../data/demo');
const promoStock = pr => Math.min(...pr.items.map(i => { const p = db.products.find(x => x.id === i.productId); return p && p.active ? Math.floor(p.stock / i.qty) : 0; }));
function lines(cart) {
  return (cart || []).map(l => {
    if (l.type === 'promo') { const pr = db.promotions.find(x => x.id === +l.id); if (!pr || !pr.active) return null;
      return { ...l, key: 'promo-' + pr.id, name: pr.name, price: pr.price, image: pr.image, size: pr.items.length + ' productos', href: '/promociones#' + pr.slug, available: promoStock(pr), item: pr }; }
    const p = db.products.find(x => x.id === +l.id); if (!p || !p.active) return null;
    return { ...l, type: 'product', key: 'product-' + p.id, name: p.name, price: p.price, image: p.image, size: p.size, href: '/producto/' + p.slug, available: p.stock, item: p };
  }).filter(Boolean).map(l => ({ ...l, total: l.price * l.qty, short: l.qty > l.available }));
}
function totals(ls, opts = {}) {
  const s = db.settings.delivery, subtotal = ls.reduce((a, l) => a + l.total, 0);
  const zone = db.zones.find(z => z.name === opts.zone);
  const shipping = opts.method === 'retiro' || !zone ? 0 : subtotal >= s.freeFrom ? 0 : zone.cost;
  const count = ls.reduce((a, l) => a + l.qty, 0);
  return { subtotal, shipping, total: subtotal + shipping, count, missingForMin: Math.max(0, s.minOrder - subtotal), missingForFree: Math.max(0, s.freeFrom - subtotal) };
}
function add(sess, type, id, qty = 1) {
  sess.cart = sess.cart || []; const row = sess.cart.find(x => x.type === type && +x.id === +id);
  if (row) row.qty = Math.min(99, row.qty + qty); else sess.cart.push({ type, id: +id, qty: Math.max(1, Math.min(99, qty)) });
}
function setQty(sess, type, id, qty) { sess.cart = (sess.cart || []).map(x => x.type === type && +x.id === +id ? { ...x, qty: Math.max(0, Math.min(99, qty)) } : x).filter(x => x.qty > 0); }
module.exports = { lines, totals, add, setQty, promoStock };
