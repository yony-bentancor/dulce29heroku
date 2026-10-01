/* Datos de demostración de Dulce29. Se cargan en memoria al iniciar y con "Restablecer demo" en Admin.
   Cuando se conecte MongoDB, este archivo sirve como semilla inicial. */
const crypto = require('crypto');
const U = 'https://images.unsplash.com/';
const img = id => `${U}${id}?auto=format&fit=crop&w=1000&q=80`;

// generador pseudoaleatorio estable (los datos demo son siempre iguales)
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const hash = pass => { const salt = 'd29demo'; return salt + ':' + crypto.scryptSync(pass, salt, 32).toString('hex'); };
const iso = d => d.toISOString();
// fechas relativas a hoy (hora de Montevideo, UTC−3): la demo siempre se ve “al día”
const TODAY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' });
const daysAgo = (n, h = 10, m = 0) => { const d = new Date(TODAY + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - n); d.setUTCHours(h + 3, m, 0, 0); return d; };

const categories = [
  { id: 1, name: 'Leches vegetales', slug: 'leches-vegetales', description: 'De almendras, sin aditivos ni conservantes.', color: '#C9A27A' },
  { id: 2, name: 'Kéfir', slug: 'kefir', description: 'Fermentado en pequeña escala.', color: '#E9D8C4' },
  { id: 3, name: 'Jugos', slug: 'jugos', description: 'Prensados en frío, del día.', color: '#B7D38A' },
  { id: 4, name: 'Shots', slug: 'shots', description: 'Concentrados para empezar el día.', color: '#F2C230' },
  { id: 5, name: 'Detox', slug: 'detox', description: 'Planes de varios días.', color: '#8DBF6A' },
  { id: 6, name: 'Mermeladas', slug: 'mermeladas', description: 'Fruta de estación, poca azúcar.', color: '#C4415A' },
  { id: 7, name: 'Untables', slug: 'untables', description: 'Para el pan de todos los días.', color: '#E58C3A' },
  { id: 8, name: 'Almacén', slug: 'almacen', description: 'Granolas, semillas y básicos.', color: '#B48A5A' }
];
const cat = slug => categories.find(c => c.slug === slug);

const P = (id, slug, name, catSlug, price, stock, size, image, extra = {}) => ({
  id, slug, name, categoryId: cat(catSlug).id, category: cat(catSlug).name, price, compareAt: null, stock, minStock: 5, size, image, gallery: [],
  description: '', ingredients: '', conservation: 'Mantener refrigerado entre 2 y 6 °C. Consumir dentro de los 5 días de abierto.',
  tags: [], featured: false, active: true, color: cat(catSlug).color, createdAt: iso(daysAgo(60)), ...extra
});

const products = [
  P(1, 'leche-almendras-cacao', 'Leche de almendras · Cacao', 'leches-vegetales', 310, 22, '910 cc', '/images/products/leche-cacao.jpg', { featured: true, color: '#7A4E35', flavor: 'cacao', tags: ['Vegana', 'Sin gluten', 'Sin aditivos'],
    description: 'Almendras activadas, cacao puro y un toque de dátiles. Cremosa, intensa y sin azúcar agregada.', ingredients: 'Agua filtrada, almendras (12%), cacao amargo, dátiles, sal marina.' }),
  P(2, 'leche-almendras-matcha', 'Leche de almendras · Matcha', 'leches-vegetales', 340, 14, '910 cc', '/images/products/leche-matcha.jpg', { featured: true, color: '#A7B57E', flavor: 'matcha', tags: ['Vegana', 'Sin gluten', 'Sin aditivos'],
    description: 'Té matcha ceremonial batido con leche de almendras. Energía suave y sabor vegetal.', ingredients: 'Agua filtrada, almendras (12%), té matcha, miel de caña, sal marina.' }),
  P(3, 'leche-almendras-dorada', 'Leche de almendras · Dorada', 'leches-vegetales', 330, 9, '910 cc', '/images/products/leche-dorada.jpg', { featured: true, color: '#E9B92F', flavor: 'dorada', tags: ['Vegana', 'Sin gluten', 'Sin aditivos'],
    description: 'Cúrcuma, canela, jengibre y anís estrellado. La golden milk lista para tomar fría o tibia.', ingredients: 'Agua filtrada, almendras (12%), cúrcuma, canela, jengibre, anís estrellado, pimienta negra.' }),
  P(4, 'kefir-clasico', 'Kéfir clásico', 'kefir', 290, 18, '500 ml', img('photo-1628088062854-d1870b4553da'), { featured: true, tags: ['Probiótico'], description: 'Kéfir de leche fermentado 24 horas. Ácido, cremoso y vivo.', ingredients: 'Leche entera, gránulos de kéfir.' }),
  P(5, 'kefir-frutos-rojos', 'Kéfir frutos rojos', 'kefir', 320, 8, '500 ml', img('photo-1553530666-ba11a7da3888'), { tags: ['Probiótico'], description: 'Kéfir clásico con puré de frutillas, arándanos y moras.', ingredients: 'Kéfir de leche, frutos rojos (20%).' }),
  P(6, 'kefir-maracuya', 'Kéfir maracuyá', 'kefir', 320, 12, '500 ml', img('photo-1622597467836-f3285f2131b8'), { tags: ['Probiótico'], description: 'Kéfir con pulpa de maracuyá: ácido y tropical.', ingredients: 'Kéfir de leche, pulpa de maracuyá (18%).' }),
  P(7, 'jugo-verde', 'Jugo verde', 'jugos', 260, 20, '500 ml', img('photo-1610970881699-44a5587cabec'), { featured: true, tags: ['Vegano', 'Prensado en frío'], description: 'Manzana verde, pepino, apio, espinaca, limón y jengibre.', ingredients: 'Manzana verde, pepino, apio, espinaca, limón, jengibre.' }),
  P(8, 'jugo-naranja-zanahoria', 'Naranja y zanahoria', 'jugos', 250, 14, '500 ml', img('photo-1600271886742-f049cd451bba'), { tags: ['Vegano', 'Prensado en frío'], description: 'Naranja de Salto, zanahoria y un toque de cúrcuma.', ingredients: 'Naranja, zanahoria, cúrcuma.' }),
  P(9, 'jugo-remolacha', 'Remolacha y manzana', 'jugos', 270, 4, '500 ml', img('photo-1497534446932-c925b458314e'), { tags: ['Vegano', 'Prensado en frío'], description: 'Remolacha, manzana roja, limón y menta.', ingredients: 'Remolacha, manzana, limón, menta.' }),
  P(10, 'limonada-menta', 'Limonada con menta', 'jugos', 230, 11, '500 ml', img('photo-1523677011781-c91d1bbe2f9f'), { tags: ['Vegano'], description: 'Limón exprimido, menta fresca y miel.', ingredients: 'Agua, limón, menta, miel.' }),
  P(11, 'shot-jengibre', 'Shot jengibre y limón', 'shots', 160, 30, '60 ml', img('photo-1623065422902-30a2d299bbe4'), { featured: true, tags: ['Vegano'], description: 'Jengibre, limón y pimienta de cayena. Pica, despierta.', ingredients: 'Jengibre, limón, cayena.' }),
  P(12, 'shot-curcuma', 'Shot cúrcuma', 'shots', 170, 3, '60 ml', img('photo-1615485500704-8e990f9900f7'), { tags: ['Vegano'], description: 'Cúrcuma, naranja y pimienta negra.', ingredients: 'Cúrcuma, naranja, pimienta negra.' }),
  P(13, 'detox-3-dias', 'Detox 3 días', 'detox', 1490, 6, '18 botellas', img('photo-1610970881699-44a5587cabec'), { tags: ['Plan'], description: 'Seis jugos por día durante tres días, con guía de acompañamiento.', ingredients: 'Jugos verdes, cítricos y leches vegetales.' }),
  P(14, 'detox-5x5', 'Detox 5x5', 'detox', 2290, 2, '25 botellas', img('photo-1603569283847-aa295f0d016a'), { tags: ['Plan'], description: 'Cinco jugos por día durante cinco días.', ingredients: 'Jugos verdes, cítricos, shots y leches vegetales.' }),
  P(15, 'mermelada-frutos-rojos', 'Mermelada frutos rojos', 'mermeladas', 340, 10, '250 g', img('photo-1589135233689-60c1a50d7c8f'), { tags: ['Sin conservantes'], description: 'Frutillas, moras y arándanos cocidos lento.', ingredients: 'Frutos rojos, azúcar mascabo, limón.' }),
  P(16, 'mermelada-higo', 'Mermelada de higo', 'mermeladas', 360, 7, '250 g', img('photo-1592924357228-91a4daadcfea'), { tags: ['Sin conservantes'], description: 'Higos de Colonia con un toque de nuez.', ingredients: 'Higos, azúcar mascabo, nuez, limón.' }),
  P(17, 'untable-zanahoria', 'Untable zanahoria y castañas', 'untables', 330, 9, '200 g', img('photo-1601050690597-df0568f70950'), { tags: ['Vegano'], description: 'Zanahoria asada, castañas de cajú y comino.', ingredients: 'Zanahoria, castañas de cajú, aceite de oliva, comino, sal.' }),
  P(18, 'hummus-remolacha', 'Hummus de remolacha', 'untables', 300, 0, '200 g', img('photo-1541518763669-27fef04b14ea'), { tags: ['Vegano'], description: 'Garbanzos, remolacha asada, tahini y limón.', ingredients: 'Garbanzos, remolacha, tahini, limón, ajo, sal.' }),
  P(19, 'granola-artesanal', 'Granola artesanal', 'almacen', 390, 15, '400 g', img('photo-1517093157656-b9eccef91cb1'), { featured: true, tags: ['Sin azúcar refinada'], description: 'Avena, almendras, coco y miel tostados en horno de barro.', ingredients: 'Avena, almendras, coco, semillas de girasol, miel.' }),
  P(20, 'mix-semillas', 'Mix de semillas', 'almacen', 280, 25, '300 g', img('photo-1599909631178-4e4b0e3a2d5b'), { tags: ['Vegano'], description: 'Chía, lino, girasol, zapallo y sésamo.', ingredients: 'Chía, lino, girasol, zapallo, sésamo.' })
];
products[2].compareAt = 360; products[10].compareAt = 190;

const promotions = [
  { id: 1, slug: 'pack-leches', name: 'Pack tres sabores', kind: 'pack', description: 'Cacao, matcha y dorada: una semana de leches vegetales.', items: [{ productId: 1, qty: 1 }, { productId: 2, qty: 1 }, { productId: 3, qty: 1 }], price: 890, image: '/images/hero/botellas.jpg', badge: 'Ahorrás $90', active: true, until: '2026-10-31', featured: true },
  { id: 2, slug: 'semana-verde', name: 'Semana verde', kind: 'semanal', description: 'Cinco jugos verdes y cinco shots de jengibre para arrancar la semana.', items: [{ productId: 7, qty: 5 }, { productId: 11, qty: 5 }], price: 1890, image: img('photo-1610970881699-44a5587cabec'), badge: 'Pack semanal', active: true, until: '2026-12-31', featured: true },
  { id: 3, slug: 'desayuno-completo', name: 'Desayuno completo', kind: 'combo', description: 'Granola, kéfir clásico y mermelada de frutos rojos.', items: [{ productId: 19, qty: 1 }, { productId: 4, qty: 1 }, { productId: 15, qty: 1 }], price: 920, image: img('photo-1517093157656-b9eccef91cb1'), badge: 'Combo', active: true, until: '', featured: true },
  { id: 4, slug: 'detox-amigas', name: 'Detox para dos', kind: 'oferta', description: 'Dos planes Detox 3 días con 10% de descuento.', items: [{ productId: 13, qty: 2 }], price: 2680, image: img('photo-1603569283847-aa295f0d016a'), badge: '-10%', active: true, until: '2026-10-15', featured: false }
];

const zones = [
  { id: 1, name: 'Barrio Histórico', cost: 0, eta: '30–60 min', active: true, lat: -34.4718, lng: -57.8510 },
  { id: 2, name: 'Centro', cost: 0, eta: '30–60 min', active: true, lat: -34.4670, lng: -57.8420 },
  { id: 3, name: 'Real de San Carlos', cost: 120, eta: '60–90 min', active: true, lat: -34.4400, lng: -57.8650 },
  { id: 4, name: 'El General', cost: 80, eta: '45–75 min', active: true, lat: -34.4560, lng: -57.8280 },
  { id: 5, name: 'Ferrando', cost: 80, eta: '45–75 min', active: true, lat: -34.4620, lng: -57.8180 },
  { id: 6, name: 'Las Delicias', cost: 150, eta: '60–120 min', active: true, lat: -34.4300, lng: -57.8100 }
];

const settings = {
  business: { name: 'Dulce29', legalName: 'Dulce29 · Inspirando hábitos', email: 'hola@dulce29.uy', phone: '095 789 647', whatsapp: '59895789647', instagram: 'dulce29.uy',
    address: 'Gral. Flores 420, Colonia del Sacramento', hours: 'Lunes a sábado de 9 a 20 h', lat: -34.4693, lng: -57.8455 },
  delivery: { minOrder: 600, freeFrom: 1500, pickup: true, pickupAddress: 'Gral. Flores 420 (local)', days: [1, 2, 3, 4, 5, 6], slots: ['9:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00'], leadDays: 0, cutoff: '18:00' },
  payments: { cash: { on: true, note: 'Pagás al recibir. Si necesitás cambio, avisanos en observaciones.' },
    transfer: { on: true, bank: 'BROU · Caja de ahorro en pesos', account: '001234567-00001', holder: 'Dulce29 SAS', note: 'Enviá el comprobante por WhatsApp.' },
    mercadopago: { on: true, link: 'https://mpago.la/dulce29-demo', note: 'Te enviamos el link de pago al confirmar.' } }
};

const clients = [
  { id: 1, name: 'Sofía Martínez', email: 'sofia@dulce29.demo', phone: '099 123 456', notes: 'Prefiere entregas a la tarde.', createdAt: iso(daysAgo(120)), favorites: [1, 3, 11],
    addresses: [{ id: 1, label: 'Casa', street: 'Av. General Flores 312', zone: 'Centro', notes: 'Portón verde', lat: -34.4698, lng: -57.8442 }, { id: 2, label: 'Trabajo', street: '18 de Julio 210', zone: 'Barrio Histórico', notes: 'Oficina 2', lat: -34.4712, lng: -57.8498 }] },
  { id: 2, name: 'Lucía Pereira', email: 'lucia@dulce29.demo', phone: '098 222 333', notes: '', createdAt: iso(daysAgo(90)), favorites: [2, 7],
    addresses: [{ id: 3, label: 'Casa', street: 'Rambla de las Américas 850', zone: 'Real de San Carlos', notes: '', lat: -34.4388, lng: -57.8742 }] },
  { id: 3, name: 'Martina Rodríguez', email: 'martina@correo.demo', phone: '091 456 789', notes: 'Alérgica a frutos secos: no ofrecer leches de almendras.', createdAt: iso(daysAgo(70)), favorites: [],
    addresses: [{ id: 4, label: 'Casa', street: 'Rivadavia 155', zone: 'Centro', notes: '', lat: -34.4662, lng: -57.8401 }] },
  { id: 4, name: 'Diego Fernández', email: 'diego@correo.demo', phone: '094 777 210', notes: '', createdAt: iso(daysAgo(55)), favorites: [],
    addresses: [{ id: 5, label: 'Casa', street: 'Av. Roosevelt 1450', zone: 'El General', notes: 'Casa con rejas negras', lat: -34.4548, lng: -57.8271 }] },
  { id: 5, name: 'Valentina Sosa', email: 'valen@correo.demo', phone: '092 318 005', notes: 'Cliente de detox mensual.', createdAt: iso(daysAgo(40)), favorites: [],
    addresses: [{ id: 6, label: 'Casa', street: 'Calle 1 n.º 44, Ferrando', zone: 'Ferrando', notes: '', lat: -34.4617, lng: -57.8172 }] },
  { id: 6, name: 'Andrés Cabrera', email: 'andres@correo.demo', phone: '093 600 112', notes: '', createdAt: iso(daysAgo(20)), favorites: [],
    addresses: [{ id: 7, label: 'Chacra', street: 'Camino Las Delicias km 3', zone: 'Las Delicias', notes: 'Entrar por la tranquera', lat: -34.4302, lng: -57.8095 }] },
  { id: 7, name: 'Carolina Núñez', email: 'caro@correo.demo', phone: '099 870 441', notes: '', createdAt: iso(daysAgo(12)), favorites: [],
    addresses: [{ id: 8, label: 'Casa', street: 'Washington Barbot 230', zone: 'Barrio Histórico', notes: '', lat: -34.4722, lng: -57.8531 }] }
];

const deliverers = [
  { id: 1, name: 'Martín Silva', phone: '095 111 222', vehicle: 'Moto', zones: ['Centro', 'Barrio Histórico', 'El General', 'Ferrando'], active: true },
  { id: 2, name: 'Joaquín Méndez', phone: '095 333 444', vehicle: 'Bicicleta eléctrica', zones: ['Real de San Carlos', 'Las Delicias', 'Centro'], active: true }
];

const users = [
  { id: 1, name: 'Natalia', email: 'natalia@dulce29.uy', role: 'admin', pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(200)) },
  { id: 2, name: 'Sofía Martínez', email: 'sofia@dulce29.demo', role: 'client', clientId: 1, pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(120)) },
  { id: 3, name: 'Lucía Pereira', email: 'lucia@dulce29.demo', role: 'client', clientId: 2, pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(90)) },
  { id: 4, name: 'Martín Silva', email: 'martin@dulce29.demo', role: 'delivery', delivererId: 1, pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(150)) },
  { id: 5, name: 'Joaquín Méndez', email: 'joaquin@dulce29.demo', role: 'delivery', delivererId: 2, pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(80)) },
  { id: 6, name: 'Paula (atención)', email: 'paula@dulce29.uy', role: 'admin', pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(30)) }
];

// pedidos: 45 días de historia, con estados según antigüedad
function buildOrders() {
  const r = rng(29), out = [], pays = ['Efectivo', 'Transferencia', 'Mercado Pago'], slots = settings.delivery.slots;
  let id = 1001;
  for (let d = 44; d >= 0; d--) {
    const n = d === 0 ? 10 : 1 + Math.floor(r() * 3.2);
    for (let k = 0; k < n; k++) {
      const c = clients[Math.floor(r() * clients.length)], a = c.addresses[0], pickup = d === 0 ? k === 3 : r() < .15;
      const items = [], cnt = 1 + Math.floor(r() * 3);
      for (let j = 0; j < cnt; j++) { const p = products[Math.floor(r() * products.length)]; if (items.find(i => i.productId === p.id)) continue; items.push({ type: 'product', productId: p.id, name: p.name, price: p.price, qty: 1 + Math.floor(r() * 2) }); }
      if (r() < .12) { const pr = promotions[Math.floor(r() * 3)]; items.push({ type: 'promo', promoId: pr.id, name: pr.name, price: pr.price, qty: 1 }); }
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0), zone = zones.find(z => z.name === a.zone);
      const shipping = pickup || subtotal >= settings.delivery.freeFrom ? 0 : zone.cost;
      const created = d === 0 ? new Date(Date.now() - (n - k) * 38 * 60000) : daysAgo(d, 8 + Math.floor(r() * 11), Math.floor(r() * 60));
      let status = 'entregado';
      if (d === 0) status = ['entregado', 'entregado', 'en_camino', 'listo', 'listo', 'en_camino', 'listo', 'preparando', 'preparando', 'recibido'][k];
      else if (d === 1 && k === 0) status = 'en_camino';
      else if (r() < .05) status = 'cancelado'; else if (r() < .04) status = 'no_entregado';
      const payment = pays[Math.floor(r() * 3)], paid = status === 'entregado' || (payment !== 'Efectivo' && status !== 'recibido' && status !== 'cancelado');
      const dlv = pickup || (d === 0 && k === 6) ? null : d === 0 ? (k % 2 ? 2 : 1) : (['Real de San Carlos', 'Las Delicias'].includes(a.zone) ? 2 : 1);
      const steps = ['recibido', 'preparando', 'listo', 'en_camino', 'entregado'], history = [];
      const upto = status === 'cancelado' ? 1 : status === 'no_entregado' ? 4 : steps.indexOf(status) + 1;
      for (let s = 0; s < upto; s++) { if (pickup && steps[s] === 'en_camino') continue; history.push({ at: iso(new Date(created.getTime() + s * 50 * 60000)), status: steps[s], by: s === 0 ? 'Web' : s >= 3 ? 'Repartidor' : 'Natalia' }); }
      if (status === 'cancelado' || status === 'no_entregado') history.push({ at: iso(new Date(created.getTime() + 4 * 3600000)), status, by: 'Natalia', note: status === 'cancelado' ? 'Cancelado a pedido del cliente.' : 'No había nadie en el domicilio.' });
      out.push({
        id, code: String(id), token: crypto.createHash('sha1').update('t' + id).digest('hex').slice(0, 10), clientId: c.id, channel: r() < .2 ? 'whatsapp' : 'web',
        customer: { name: c.name, phone: c.phone, email: c.email },
        delivery: { method: pickup ? 'retiro' : 'envio', street: pickup ? '' : a.street, zone: pickup ? '' : a.zone, notes: a.notes || '', lat: a.lat, lng: a.lng, date: d === 0 ? TODAY : created.toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' }), slot: slots[Math.floor(r() * slots.length)] },
        payment: { method: payment, status: paid ? 'pagado' : 'pendiente' }, notes: d === 0 && k === 5 ? 'Portón verde, dejar con el portero si no atiendo.' : r() < .2 ? 'Tocar timbre dos veces.' : '',
        items, subtotal, shipping, discount: 0, total: subtotal + shipping, status, delivererId: status === 'recibido' ? null : dlv, history, createdAt: iso(created), stockApplied: true
      });
      id++;
    }
  }
  return out;
}

const inquiries = [
  { id: 1, kind: 'epigenetica', name: 'Valentina Sosa', email: 'valen@correo.demo', phone: '092 318 005', message: 'Quisiera saber cómo es el test y cuánto demoran los resultados.', status: 'agendado', clientId: 5, preferred: 'Mañanas', createdAt: iso(daysAgo(9)), notes: [{ at: iso(daysAgo(8)), text: 'Agendada para el 3/10 a las 10 h.' }] },
  { id: 2, kind: 'epigenetica', name: 'Rodrigo Álvarez', email: 'rodrigo@correo.demo', phone: '099 555 101', message: '¿Se puede hacer a domicilio?', status: 'nuevo', clientId: null, preferred: 'Tardes', createdAt: iso(daysAgo(1)), notes: [] },
  { id: 3, kind: 'epigenetica', name: 'Sofía Martínez', email: 'sofia@dulce29.demo', phone: '099 123 456', message: 'Me interesa para mi pareja y para mí.', status: 'contactado', clientId: 1, preferred: 'Fin de semana', createdAt: iso(daysAgo(4)), notes: [{ at: iso(daysAgo(3)), text: 'Le enviamos info por WhatsApp.' }] },
  { id: 4, kind: 'thermomix', name: 'Lucía Pereira', email: 'lucia@dulce29.demo', phone: '098 222 333', message: 'Quiero una demostración antes de comprar.', status: 'agendado', clientId: 2, preferred: 'Sábado', createdAt: iso(daysAgo(6)), notes: [{ at: iso(daysAgo(5)), text: 'Demo en su casa el sábado 4/10.' }] },
  { id: 5, kind: 'thermomix', name: 'Fernanda Gil', email: 'fer@correo.demo', phone: '091 202 303', message: '¿Tienen planes de financiación?', status: 'nuevo', clientId: null, preferred: '', createdAt: iso(daysAgo(0)), notes: [] },
  { id: 6, kind: 'thermomix', name: 'Diego Fernández', email: 'diego@correo.demo', phone: '094 777 210', message: 'Consulta por el curso de organización semanal.', status: 'cerrado', clientId: 4, preferred: '', createdAt: iso(daysAgo(25)), notes: [{ at: iso(daysAgo(24)), text: 'Se inscribió al curso del 24/10.' }] },
  { id: 7, kind: 'contacto', name: 'Ana Ferreira', email: 'ana@correo.demo', phone: '', message: '¿Hacen envíos a Juan Lacaze?', status: 'nuevo', clientId: null, preferred: '', createdAt: iso(daysAgo(0)), notes: [] },
  { id: 8, kind: 'contacto', name: 'Martina Rodríguez', email: 'martina@correo.demo', phone: '091 456 789', message: '¿Tienen opciones sin frutos secos?', status: 'contactado', clientId: 3, preferred: '', createdAt: iso(daysAgo(3)), notes: [{ at: iso(daysAgo(2)), text: 'Le recomendamos kéfir y jugos.' }] },
  { id: 9, kind: 'contacto', name: 'Hotel Plaza (compras)', email: 'compras@hotel.demo', phone: '4522 0000', message: 'Queremos cotizar leches vegetales para desayunos.', status: 'contactado', clientId: null, preferred: '', createdAt: iso(daysAgo(7)), notes: [] }
];

const content = {
  hero: { title: 'Hábitos que te hacen bien.', text: 'Leches vegetales, kéfir y jugos hechos en Colonia, en pequeñas tandas y sin conservantes. Pedís hoy, te llega hoy.', cta: 'Hacer un pedido' },
  flavors: [
    { key: 'cacao', name: 'Cacao', title: 'Cacao, almendras y nada más.', text: 'Cacao amargo y dátiles. Cremosa como un chocolatada, sin azúcar agregada.', productId: 1, liquid: '#6B4632', bg: '#E9DCCF', accent: '#4A2E1F' },
    { key: 'matcha', name: 'Matcha', title: 'Matcha para la tarde.', text: 'Té matcha batido con leche de almendras: energía tranquila, sin café.', productId: 2, liquid: '#B9C29A', bg: '#E3E8D3', accent: '#3F5230' },
    { key: 'dorada', name: 'Dorada', title: 'Dorada, tibia o fría.', text: 'Cúrcuma, canela, jengibre y anís estrellado. La de los días de frío.', productId: 3, liquid: '#EFC53A', bg: '#F6EAC3', accent: '#7A5A0A' }
  ],
  steps: [
    { title: 'Elegí', text: 'Armá tu bolsa con productos sueltos o packs.' },
    { title: 'Confirmá', text: 'Completás tus datos y el pedido queda registrado con número.' },
    { title: 'Preparamos', text: 'Lo armamos en el día y te avisamos cuando sale.' },
    { title: 'Recibí', text: 'Entrega en tu horario o retiro en el local.' }
  ],
  about: { title: 'Más que productos, una forma de acompañarte.', text: 'Dulce29 nace en Colonia del Sacramento alrededor de la alimentación real, la producción artesanal y los hábitos posibles.',
    story: ['Empezamos haciendo leche de almendras para la familia, en una cocina de la calle General Flores. Los vecinos empezaron a pedir, y las botellas de vidrio empezaron a ir y venir.', 'Hoy elaboramos en pequeñas tandas, con ingredientes que podés nombrar, y repartimos en el día. Las botellas vuelven y se reutilizan.', 'También acompañamos con Thermomix, cursos y el test epigenético, porque cambiar hábitos es más fácil cuando no lo hacés solo.'],
    values: [{ title: 'Ingredientes que se nombran', text: 'Si no lo pondrías en tu cocina, no va en la botella.' }, { title: 'Hecho en el día', text: 'Tandas chicas, sin conservantes, para tomar fresco.' }, { title: 'Vidrio que vuelve', text: 'Devolvé tus botellas limpias y te descontamos $20 en el próximo pedido.' }] },
  banners: [{ id: 1, text: 'Envío sin costo en pedidos desde $1.500', active: true }, { id: 2, text: 'Devolvé tus botellas de vidrio y descontamos $20', active: true }],
  epigenetica: { title: 'Test epigenético', lead: 'Un análisis no invasivo que muestra cómo responde tu cuerpo a alimentos, ambiente y hábitos, para ajustar lo que comés con información.',
    points: [{ title: 'Cómo es', text: 'Se toma una muestra de cabello. No hace falta ayuno ni análisis de sangre.' }, { title: 'Qué recibís', text: 'Un informe con alimentos a priorizar y a reducir, y una guía para las próximas 12 semanas.' }, { title: 'Acompañamiento', text: 'Una charla de devolución para traducir el informe a tu rutina real.' }], price: 'Desde $3.900' },
  thermomix: { title: 'Thermomix', lead: 'Demostraciones en tu casa o en el local para conocer cómo cocinar y organizarte con Thermomix, sin compromiso.',
    points: [{ title: 'Demostración', text: 'Cocinamos juntos un menú completo en una hora.' }, { title: 'Recetas Dulce29', text: 'Nuestras leches vegetales, untables y fermentos adaptados a Thermomix.' }, { title: 'Organización semanal', text: 'Un curso para planificar la semana y cocinar en tandas.' }], price: 'Demo sin costo' },
  faq: [
    { q: '¿Hasta qué hora puedo pedir para recibir en el día?', a: 'Los pedidos confirmados antes de las 18 h se entregan en el día, en el horario que elijas. Después de esa hora se agendan para el día siguiente.', topic: 'Entregas' },
    { q: '¿A qué zonas llegan y cuánto cuesta el envío?', a: 'Repartimos en Colonia del Sacramento: Barrio Histórico y Centro sin costo; El General y Ferrando $80; Real de San Carlos $120; Las Delicias $150. Desde $1.500 el envío es sin costo.', topic: 'Entregas' },
    { q: '¿Cuánto duran las leches vegetales?', a: 'Cinco días refrigeradas entre 2 y 6 °C. Agitá antes de servir: al no tener estabilizantes, se separan naturalmente.', topic: 'Conservación' },
    { q: '¿Qué hago con las botellas?', a: 'Devolvelas limpias al repartidor o en el local. Te descontamos $20 por botella en tu próximo pedido.', topic: 'Conservación' },
    { q: '¿Cómo pago?', a: 'Efectivo al recibir, transferencia bancaria o Mercado Pago. Los datos aparecen al confirmar el pedido.', topic: 'Pagos' },
    { q: '¿Puedo cambiar o cancelar un pedido?', a: 'Sí, mientras esté en estado "Recibido". Escribinos por WhatsApp con tu número de pedido.', topic: 'Pedidos' },
    { q: '¿Qué pasa si un producto llega en mal estado?', a: 'Te lo reponemos o devolvemos el importe. Avisanos dentro de las 24 h con una foto.', topic: 'Devoluciones' },
    { q: '¿Cómo sigo mi pedido?', a: 'Con el número de pedido y tu teléfono en la página Seguimiento, o desde Mi cuenta si estás registrada/o.', topic: 'Pedidos' }
  ],
  news: [{ date: '2026-09-28', title: 'Nuevo sabor: leche Dorada', text: 'Cúrcuma, canela y anís estrellado. Ya está en la tienda.' }, { date: '2026-09-15', title: 'Curso de fermentos', text: 'El 10 de octubre aprendemos kéfir y kombucha en casa.' }],
  legal: {
    terms: ['Dulce29 vende productos alimenticios elaborados artesanalmente en Colonia del Sacramento, Uruguay.', 'Los precios incluyen IVA y pueden cambiar sin aviso previo; se respeta el precio confirmado en cada pedido.', 'Un pedido queda confirmado cuando recibís el número de pedido. Podés cancelarlo sin costo mientras esté en estado "Recibido".', 'Las entregas se realizan en las zonas y horarios publicados. Si no hay nadie para recibir, coordinamos una nueva entrega que puede tener costo de envío.', 'Por tratarse de alimentos frescos, no se aceptan devoluciones salvo productos en mal estado, reportados dentro de las 24 h de recibidos.'],
    privacy: ['Usamos tus datos (nombre, teléfono, email y dirección) solo para gestionar pedidos, entregas y consultas.', 'No compartimos tus datos con terceros, salvo el repartidor asignado a tu pedido.', 'Podés pedir la modificación o eliminación de tus datos escribiendo a hola@dulce29.uy, conforme a la Ley 18.331 de Protección de Datos Personales.', 'El sitio usa una cookie de sesión para recordar tu bolsa y tu ingreso. No usamos cookies de publicidad.']
  }
};

const courses = [
  { id: 1, name: 'Fermentos en casa', date: '2026-10-10', time: '18:00', price: 890, seats: 12, taken: 9, place: 'Local Dulce29', text: 'Kéfir de leche y de agua, kombucha y chucrut.' },
  { id: 2, name: 'Organización semanal con Thermomix', date: '2026-10-24', time: '10:00', price: 990, seats: 10, taken: 4, place: 'Local Dulce29', text: 'Planificá menús y cociná en tandas.' },
  { id: 3, name: 'Leches vegetales', date: '2026-11-07', time: '17:00', price: 790, seats: 14, taken: 2, place: 'Local Dulce29', text: 'Almendras, avena y castañas: técnica, filtrado y conservación.' }
];

module.exports = function seed() {
  return { categories, products, promotions, zones, settings, clients, deliverers, users, orders: buildOrders(), inquiries, content, courses, resets: [], seq: {} };
};
module.exports.hash = hash;
