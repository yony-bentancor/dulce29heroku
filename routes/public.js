const r = require('express').Router(), c = require('../controllers/publicController');
r.get('/', c.home); r.get('/nosotros', c.about); r.get('/cursos', c.courses);
r.get('/contacto', c.contact); r.post('/contacto', c.inquiry('contacto'));
r.get('/epigenetica', c.service('epigenetica')); r.post('/epigenetica', c.inquiry('epigenetica'));
r.get('/thermomix', c.service('thermomix')); r.post('/thermomix', c.inquiry('thermomix'));
r.get('/preguntas-frecuentes', c.faq); r.get('/terminos', c.legal('terms')); r.get('/privacidad', c.legal('privacy'));
module.exports = r;
