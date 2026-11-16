/* Datos mínimos de ejemplo de Dulce29: un caso de cada cosa para que todas las pantallas funcionen.
   - Sin MongoDB: se cargan en memoria al iniciar y con "Restablecer datos de demo".
   - Con MongoDB: se guardan en la base solo la primera vez (base vacía). Después se editan o borran desde el panel. */
const crypto = require('crypto');
const U = 'https://images.unsplash.com/';
const img = id => `${U}${id}?auto=format&fit=crop&w=1000&q=80`;

// generador pseudoaleatorio estable (los datos demo son siempre iguales)
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const hash = pass => { const salt = 'd29demo'; return salt + ':' + crypto.scryptSync(pass, salt, 32).toString('hex'); };
const iso = d => d.toISOString();
// fechas relativas a hoy (hora de Montevideo, UTC−3): la demo siempre se ve “al día”
const TODAY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' });
const inDays = n => { const d = new Date(TODAY + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const daysAgo = (n, h = 10, m = 0) => { const d = new Date(TODAY + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - n); d.setUTCHours(h + 3, m, 0, 0); return d; };

const categories = [
  { id: 1, name: 'Leches vegetales', slug: 'leches-vegetales', description: 'De almendras, sin aditivos ni conservantes.', color: '#C9A27A' },
  { id: 2, name: 'Kéfir', slug: 'kefir', description: 'Fermentado en pequeña escala.', color: '#E9D8C4' },
  { id: 3, name: 'Jugos', slug: 'jugos', description: 'Prensados en frío, del día.', color: '#B7D38A' },
  { id: 4, name: 'Shots', slug: 'shots', description: 'Concentrados para empezar el día.', color: '#F2C230' }
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
  P(7, 'jugo-verde', 'Jugo verde', 'jugos', 260, 20, '500 ml', img('photo-1610970881699-44a5587cabec'), { featured: true, tags: ['Vegano', 'Prensado en frío'], description: 'Manzana verde, pepino, apio, espinaca, limón y jengibre.', ingredients: 'Manzana verde, pepino, apio, espinaca, limón, jengibre.' }),
  P(11, 'shot-jengibre', 'Shot jengibre y limón', 'shots', 160, 30, '60 ml', img('photo-1623065422902-30a2d299bbe4'), { featured: true, tags: ['Vegano'], description: 'Jengibre, limón y pimienta de cayena. Pica, despierta.', ingredients: 'Jengibre, limón, cayena.' })
];
products.find(p => p.id === 3).compareAt = 360; products.find(p => p.id === 11).compareAt = 190;
products.find(p => p.id === 4).stock = 3; // ejemplo de stock bajo

const promotions = [
  { id: 1, slug: 'pack-leches', name: 'Pack tres sabores', kind: 'pack', description: 'Cacao, matcha y dorada: una semana de leches vegetales.', items: [{ productId: 1, qty: 1 }, { productId: 2, qty: 1 }, { productId: 3, qty: 1 }], price: 890, image: '/images/hero/botellas.jpg', badge: 'Ahorrás $90', active: true, until: inDays(45), featured: true },
  { id: 2, slug: 'semana-verde', name: 'Semana verde', kind: 'semanal', description: 'Cinco jugos verdes y cinco shots de jengibre para arrancar la semana.', items: [{ productId: 7, qty: 5 }, { productId: 11, qty: 5 }], price: 1890, image: img('photo-1610970881699-44a5587cabec'), badge: 'Pack semanal', active: true, until: '', featured: true }
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
    addresses: [{ id: 1, label: 'Casa', street: 'Av. General Flores 312', zone: 'Centro', notes: 'Portón verde', lat: -34.4698, lng: -57.8442 }, { id: 2, label: 'Trabajo', street: '18 de Julio 210', zone: 'Barrio Histórico', notes: 'Oficina 2', lat: -34.4712, lng: -57.8498 }] }
];

const deliverers = [
  { id: 1, name: 'Martín Silva', phone: '095 111 222', vehicle: 'Moto', zones: ['Centro', 'Barrio Histórico', 'El General', 'Ferrando', 'Real de San Carlos', 'Las Delicias'], active: true }
];

const users = [
  { id: 1, name: 'Natalia', email: 'natalia@dulce29.uy', role: 'admin', pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(200)) },
  { id: 2, name: 'Sofía Martínez', email: 'sofia@dulce29.demo', role: 'client', clientId: 1, pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(120)) },
  { id: 4, name: 'Martín Silva', email: 'martin@dulce29.demo', role: 'delivery', delivererId: 1, pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(150)) },
  { id: 6, name: 'Paula (atención)', email: 'paula@dulce29.uy', role: 'admin', pass: hash('dulce29'), active: true, createdAt: iso(daysAgo(30)) }
];

// pedidos de ejemplo: uno por cada estado, de hoy y de días anteriores (para tablero, ventas y reportes)
const guests = {
  ana: { name: 'Ana Ferreira', phone: '091 300 400', email: '', address: { street: 'Rivadavia 155', zone: 'Centro', notes: '', lat: -34.4662, lng: -57.8401 } },
  diego: { name: 'Diego Fernández', phone: '094 777 210', email: 'diego@correo.demo', address: { street: 'Av. Roosevelt 1450', zone: 'El General', notes: 'Casa con rejas negras', lat: -34.4548, lng: -57.8271 } },
  caro: { name: 'Carolina Núñez', phone: '099 870 441', email: '', address: { street: 'Washington Barbot 230', zone: 'Barrio Histórico', notes: '', lat: -34.4722, lng: -57.8531 } }
};
function buildOrders() {
  const slots = settings.delivery.slots, steps = ['recibido', 'preparando', 'listo', 'en_camino', 'entregado'];
  //  [días atrás, hora, estado, retiro, repartidor, cliente, productos [id, cant], promo, pago]
  const plan = [
    [25, 10, 'entregado', false, 1, 'sofia', [[1, 1], [2, 1], [3, 1]], null, 'Transferencia'],
    [15, 17, 'entregado', true, null, 'caro', [[4, 1], [2, 1]], null, 'Efectivo'],
    [9, 11, 'entregado', false, 1, 'sofia', [], 2, 'Mercado Pago'],
    [6, 16, 'cancelado', false, null, 'ana', [[7, 1]], null, 'Efectivo'],
    [4, 12, 'entregado', false, 1, 'sofia', [[3, 2], [11, 3]], null, 'Transferencia'],
    [2, 18, 'no_entregado', false, 1, 'diego', [[1, 2]], null, 'Efectivo'],
    [0, 9, 'entregado', false, 1, 'diego', [[2, 1], [7, 1]], null, 'Mercado Pago'],
    [0, 10, 'en_camino', false, 1, 'sofia', [[11, 2]], 1, 'Efectivo'],
    [0, 11, 'listo', true, null, 'caro', [[4, 2]], null, 'Mercado Pago'],
    [0, 12, 'preparando', false, 1, 'sofia', [[1, 1], [3, 1]], null, 'Transferencia'],
    [0, 13, 'recibido', false, null, 'ana', [[7, 2], [11, 1]], null, 'Efectivo']
  ];
  let id = 1001;
  return plan.map(([d, h, status, pickup, dlv, who, prods, promoId, payment], k) => {
    const c = who === 'sofia' ? clients[0] : null, g = c ? { name: c.name, phone: c.phone, email: c.email, address: c.addresses[0] } : guests[who], a = g.address;
    const items = prods.map(([pid, qty]) => { const p = products.find(x => x.id === pid); return { type: 'product', productId: p.id, name: p.name, price: p.price, qty }; });
    if (promoId) { const pr = promotions.find(x => x.id === promoId); items.push({ type: 'promo', promoId: pr.id, name: pr.name, price: pr.price, qty: 1 }); }
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0), zone = zones.find(z => z.name === a.zone);
    const shipping = pickup || subtotal >= settings.delivery.freeFrom ? 0 : zone.cost;
    const created = d === 0 ? new Date(Math.min(daysAgo(0, h).getTime(), Date.now() - (11 - k) * 35 * 60000)) : daysAgo(d, h, 15);
    const paid = status === 'entregado' || (payment !== 'Efectivo' && status !== 'recibido' && status !== 'cancelado');
    const history = [], upto = status === 'cancelado' ? 1 : status === 'no_entregado' ? 4 : steps.indexOf(status) + 1;
    for (let s = 0; s < upto; s++) { if (pickup && steps[s] === 'en_camino') continue; history.push({ at: iso(new Date(created.getTime() + s * 40 * 60000)), status: steps[s], by: s === 0 ? 'Web' : s >= 3 && !pickup ? 'Repartidor' : 'Natalia' }); }
    if (status === 'cancelado' || status === 'no_entregado') history.push({ at: iso(new Date(created.getTime() + 3 * 3600000)), status, by: 'Natalia', note: status === 'cancelado' ? 'Cancelado a pedido del cliente.' : 'No había nadie en el domicilio.' });
    const n = id++;
    return {
      id: n, code: String(n), token: crypto.createHash('sha1').update('t' + n).digest('hex').slice(0, 10), clientId: c ? c.id : null, channel: who === 'ana' ? 'whatsapp' : 'web',
      customer: { name: g.name, phone: g.phone, email: g.email },
      delivery: { method: pickup ? 'retiro' : 'envio', street: pickup ? '' : a.street, zone: pickup ? '' : a.zone, notes: a.notes || '', lat: a.lat, lng: a.lng, date: d === 0 ? TODAY : created.toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' }), slot: slots[k % slots.length] },
      payment: { method: payment, status: paid ? 'pagado' : 'pendiente' }, notes: status === 'preparando' ? 'Portón verde, dejar con el portero si no atiendo.' : '',
      items, subtotal, shipping, discount: 0, total: subtotal + shipping, status, delivererId: status === 'recibido' || pickup ? null : dlv, history, createdAt: iso(created), stockApplied: true
    };
  });
}

const inquiries = [
  { id: 1, kind: 'epigenetica', name: 'Sofía Martínez', email: 'sofia@dulce29.demo', phone: '099 123 456', message: 'Me interesa para mi pareja y para mí.', status: 'contactado', clientId: 1, preferred: 'Fin de semana', createdAt: iso(daysAgo(4)), notes: [{ at: iso(daysAgo(3)), text: 'Le enviamos info por WhatsApp.' }] },
  { id: 2, kind: 'thermomix', name: 'Fernanda Gil', email: 'fer@correo.demo', phone: '091 202 303', message: '¿Tienen planes de financiación?', status: 'nuevo', clientId: null, preferred: 'Sábado', createdAt: iso(daysAgo(1)), notes: [] },
  { id: 3, kind: 'contacto', name: 'Ana Ferreira', email: 'ana@correo.demo', phone: '', message: '¿Hacen envíos a Juan Lacaze?', status: 'nuevo', clientId: null, preferred: '', createdAt: iso(daysAgo(0)), notes: [] }
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
  { id: 1, name: 'Fermentos en casa', date: inDays(12), time: '18:00', price: 890, seats: 12, taken: 3, place: 'Local Dulce29', text: 'Kéfir de leche y de agua, kombucha y chucrut.' },
  { id: 2, name: 'Leches vegetales', date: inDays(26), time: '17:00', price: 790, seats: 14, taken: 0, place: 'Local Dulce29', text: 'Almendras, avena y castañas: técnica, filtrado y conservación.' }
];

module.exports = function seed() {
  return { categories, products, promotions, zones, settings, clients, deliverers, users, orders: buildOrders(), inquiries, content, courses, resets: [], seq: {} };
};
module.exports.hash = hash;
