// exige sesión; si no hay, manda al ingreso que corresponde y vuelve después
function requireUser(req, res, next) {
  if (req.session.user) return next();
  req.session.returnTo = req.originalUrl;
  const to = req.baseUrl === '/admin' ? '/admin/ingresar' : req.baseUrl === '/repartidor' ? '/repartidor/ingresar' : '/ingresar';
  res.redirect(to);
}
module.exports = { requireUser };
