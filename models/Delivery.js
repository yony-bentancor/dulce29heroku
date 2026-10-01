const db = require('../data/demo');
class Delivery {
  static all() { return db.deliverers; }
  static find(id) { return db.deliverers.find(x=>String(x.id)===String(id)); }
  static nextId() { return Math.max(0,...db.deliverers.map(x=>Number(x.id)||0))+1; }
}
module.exports = Delivery;
