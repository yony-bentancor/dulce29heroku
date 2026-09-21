const db = require('../data/demo');
class Client {
  static all() { return db.clients; }
  static find(id) { return db.clients.find(x=>String(x.id)===String(id)); }
  static nextId() { return Math.max(0,...db.clients.map(x=>Number(x.id)||0))+1; }
}
module.exports = Client;
