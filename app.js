require('dotenv').config();
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const path = require('path');
const { connectDatabase } = require('./config/database');
const constants = require('./config/constants');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
const PORT = process.env.PORT || 3000;

nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV !== 'production'
});
app.set('view engine', 'njk');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dulce29-v2-demo',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use((req,res,next)=>{
  res.locals.user = req.session.user || null;
  res.locals.cart = req.session.cart || [];
  res.locals.brand = constants;
  res.locals.currentPath = req.path;
  next();
});

app.use(routes);
app.use(notFound);
app.use(errorHandler);

connectDatabase().finally(()=>{
  app.listen(PORT, ()=>console.log(`Dulce29 V2 · http://localhost:${PORT}`));
});
