const db=require('../data/demo'); const {mapsUrl}=require('../services/mapsService'); const {orderLink}=require('../services/whatsappService');
exports.dashboard=(req,res)=>{const orders=db.orders.filter(o=>o.delivererId===1).map(o=>{const client=db.clients.find(c=>c.id===o.clientId);return {...o,client,map:mapsUrl(client),wa:orderLink(o,client)}});res.render('delivery/dashboard',{orders})};
exports.status=(req,res)=>{const o=db.orders.find(x=>String(x.id)===String(req.params.id));if(o)o.status=req.body.status;res.redirect('/repartidor')};
