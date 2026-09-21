const Product=require('../models/Product'); const db=require('../data/demo');
exports.list=(req,res)=>{let items=Product.all().filter(p=>p.active); if(req.query.categoria)items=items.filter(p=>p.category===req.query.categoria);res.render('shop/list',{products:items,categories:db.categories,selected:req.query.categoria||''})};
exports.detail=(req,res)=>{const p=Product.find(req.params.id); if(!p)return res.status(404).render('errors/404');res.render('shop/detail',{p})};
