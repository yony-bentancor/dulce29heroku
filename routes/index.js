const router=require('express').Router();
router.use('/',require('./public'));
router.use('/',require('./auth'));
router.use('/',require('./shop'));
router.use('/mi-dulce29',require('./client'));
router.use('/repartidor',require('./delivery'));
router.use('/admin',require('./admin'));
module.exports=router;
