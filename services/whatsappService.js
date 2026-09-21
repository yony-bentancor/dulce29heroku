const { WHATSAPP } = require('../config/constants');
const enc = encodeURIComponent;
function link(message, phone=WHATSAPP){ return `https://wa.me/${phone}?text=${enc(message)}`; }
function orderLink(order, client){
  return link(`Hola ${client.name}, te escribimos de Dulce29 por tu pedido #${order.id}. Estado: ${order.status}.`);
}
module.exports={link,orderLink};
