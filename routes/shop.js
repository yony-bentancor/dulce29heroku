const r = require('express').Router(), c = require('../controllers/shopController');
r.get('/productos', c.list); r.get('/producto/:slug', c.detail); r.get('/promociones', c.promos);
r.get('/carrito', c.view); r.post('/carrito/agregar', c.add); r.post('/carrito/agregar/:id', c.add); r.post('/carrito/actualizar', c.update); r.post('/carrito/quitar/:key', c.remove);
r.get('/checkout', c.checkout); r.post('/checkout', c.placeOrder);
r.get('/pedido/:code/confirmado', c.confirmed);
r.get('/seguimiento', c.track); r.get('/seguimiento/:code', c.trackOrder); r.get('/seguimiento/:code/estado.json', c.trackJson);
r.post('/favoritos/:id', c.fav);
module.exports = r;
