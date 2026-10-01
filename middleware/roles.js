function role(...names) { return (req, res, next) => names.includes(req.session.user && req.session.user.role) ? next() : res.status(403).render('errors/403'); }
module.exports = { role };
