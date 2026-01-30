const dbManager = require('../database');

class Player {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.created_at;
  }

  static create(name) {
    const db = dbManager.getDb();
    const stmt = db.prepare('INSERT INTO player (name) VALUES (?)');
    const result = stmt.run(name);
    
    return Player.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM player WHERE id = ?');
    const row = stmt.get(id);
    
    return row ? new Player(row) : null;
  }

  static findByName(name) {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM player WHERE name = ?');
    const row = stmt.get(name);
    
    return row ? new Player(row) : null;
  }

  static findAll() {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM player ORDER BY created_at DESC');
    const rows = stmt.all();
    
    return rows.map(row => new Player(row));
  }

  static findOrCreate(name) {
    let player = Player.findByName(name);
    if (!player) {
      player = Player.create(name);
    }
    return player;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt
    };
  }
}

module.exports = Player;

// Made with Bob
