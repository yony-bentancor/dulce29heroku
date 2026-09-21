const db=require('../data/demo');
exports.home=(req,res)=>res.render('home/index',{featured:db.products.filter(p=>p.featured).slice(0,6),content:db.content});
exports.about=(req,res)=>res.render('info/about',{content:db.content});
exports.service=(req,res)=>res.render('info/service',{kind:req.params.kind});
exports.courses=(req,res)=>res.render('info/courses',{courses:db.courses});
exports.contact=(req,res)=>res.render('info/contact');
