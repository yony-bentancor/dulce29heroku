const db = require('../data/demo');
class Order {
  static all() { return db.orders; }
  static find(id) { return db.orders.find(x=>String(x.id)===String(id)); }
  static nextId() { return Math.max(0,...db.orders.map(x=>Number(x.id)||0))+1; }
}
module.exports = Order;
