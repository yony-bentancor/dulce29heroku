const users=require('../data/demo/users');
exports.login=(req,res)=>res.render('auth/login',{users});
exports.demo=(req,res)=>{
 const u=users.find(x=>x.role===req.params.role);
 if(!u) return res.redirect('/login');
 req.session.user={...u};
 res.redirect(u.role==='admin'?'/admin':u.role==='delivery'?'/repartidor':'/mi-dulce29');
};
exports.logout=(req,res)=>req.session.destroy(()=>res.redirect('/'));
