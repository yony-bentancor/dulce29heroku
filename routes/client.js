const r=require('express').Router(),c=require('../controllers/clientController'),{requireUser}=require('../middleware/auth');
r.get('/',requireUser,c.dashboard);module.exports=r;
