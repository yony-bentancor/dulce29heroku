const db = require('../data/demo');
class Product {
  static all() { return db.products; }
  static find(id) { return db.products.find(x=>String(x.id)===String(id)); }
  static nextId() { return Math.max(0,...db.products.map(x=>Number(x.id)||0))+1; }
}
module.exports = Product;
