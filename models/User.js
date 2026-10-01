const db = require('../data/demo');
class User {
  static all() { return db.users; }
  static find(id) { return db.users.find(x=>String(x.id)===String(id)); }
  static nextId() { return Math.max(0,...db.users.map(x=>Number(x.id)||0))+1; }
}
module.exports = User;
