const r=require('express').Router(),p=require('../controllers/productController'),c=require('../controllers/cartController');
r.get('/productos',p.list);r.get('/producto/:id',p.detail);r.post('/carrito/agregar/:id',c.add);r.post('/carrito/eliminar/:id',c.remove);r.get('/carrito',c.view);r.get('/checkout',c.checkout);module.exports=r;
