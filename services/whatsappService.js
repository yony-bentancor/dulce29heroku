const db = require('../data/demo');
const { money, STATUS } = require('../utils/format');
const phone = () => (db.settings.business.whatsapp || '').replace(/\D/g, '');
const link = (message, to = phone()) => `https://wa.me/${String(to).replace(/\D/g, '').replace(/^0/, '598')}?text=${encodeURIComponent(message)}`;
// mensaje que manda el cliente después de crear el pedido
const customerLink = o => link(`Hola Dulce29, hice el pedido #${o.code} por ${money(o.total)} (${o.payment.method}). ${o.delivery.method === 'retiro' ? 'Lo retiro en el local' : 'Entrega en ' + o.delivery.street} el ${o.delivery.date} de ${o.delivery.slot}.`);
// mensaje del local/repartidor al cliente
const toClientLink = (o, text) => link(text || `Hola ${o.customer.name.split(' ')[0]}, te escribimos de Dulce29 por tu pedido #${o.code}. Estado: ${STATUS[o.status].label}.`, o.customer.phone.replace(/\D/g, '').replace(/^0?9/, '5989'));
module.exports = { link, customerLink, toClientLink, phone };
