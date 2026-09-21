const Product=require('../models/Product');
function rows(req){return (req.session.cart||[]).map(x=>({...x,p:Product.find(x.id)})).filter(x=>x.p)}
exports.add=(req,res)=>{req.session.cart=req.session.cart||[];let row=req.session.cart.find(x=>String(x.id)===String(req.params.id));row?row.qty++:req.session.cart.push({id:Number(req.params.id),qty:1});res.redirect('/carrito')};
exports.view=(req,res)=>{let r=rows(req);res.render('shop/cart',{rows:r,total:r.reduce((s,x)=>s+x.p.price*x.qty,0)})};
exports.remove=(req,res)=>{req.session.cart=(req.session.cart||[]).filter(x=>String(x.id)!==String(req.params.id));res.redirect('/carrito')};
exports.checkout=(req,res)=>{let r=rows(req);res.render('shop/checkout',{rows:r,total:r.reduce((s,x)=>s+x.p.price*x.qty,0)})};
