const r=require('express').Router(),c=require('../controllers/deliveryController'),{requireUser}=require('../middleware/auth'),{role}=require('../middleware/roles');
r.get('/',requireUser,role('delivery'),c.dashboard);r.post('/pedido/:id/estado',requireUser,role('delivery'),c.status);module.exports=r;
