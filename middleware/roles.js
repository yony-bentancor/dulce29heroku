function role(name){ return (req,res,next)=> req.session.user?.role===name ? next() : res.status(403).render('errors/403'); }
module.exports={role};
