function notFound(req,res){ res.status(404).render('errors/404'); }
function errorHandler(err,req,res,next){ console.error(err); res.status(500).render('errors/500',{error:process.env.NODE_ENV==='production'?null:err}); }
module.exports={notFound,errorHandler};
