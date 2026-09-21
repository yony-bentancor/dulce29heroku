const db=require('../data/demo'); const {hydrate}=require('../services/orderService');
exports.dashboard=(req,res)=>{const c=db.clients.find(x=>x.id===(req.session.user.clientId||1))||db.clients[0];res.render('client/dashboard',{client:c,orders:db.orders.filter(o=>o.clientId===c.id).map(hydrate)})};
