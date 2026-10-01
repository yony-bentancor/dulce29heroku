const router = require('express').Router();
router.use('/', require('./public'));
router.use('/', require('./auth'));
router.use('/', require('./shop'));
router.use('/mi-cuenta', require('./account'));
router.get('/mi-dulce29', (req, res) => res.redirect('/mi-cuenta'));
router.use('/repartidor', require('./delivery'));
router.use('/admin', require('./admin'));
module.exports = router;
