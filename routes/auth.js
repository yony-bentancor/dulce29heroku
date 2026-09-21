const r=require('express').Router(),c=require('../controllers/authController');
r.get('/login',c.login);r.get('/demo/:role',c.demo);r.get('/logout',c.logout);module.exports=r;
