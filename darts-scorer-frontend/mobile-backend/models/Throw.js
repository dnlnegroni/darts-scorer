const dbManager = require('../database');

class Throw {
  constructor(data) {
    this.id = data.id;
    this.turnId = data.turn_id;
    this.sector = data.sector;
    this.multiplier = data.multiplier;
    this.score = data.score;
    this.throwNumber = data.throw_number;
    this.timestamp = data.timestamp;
  }

  static create(turnId, sector, multiplier, throwNumber) {
    const db = dbManager.getDb();
    const score = sector * multiplier;
    
    const stmt = db.prepare(`
      INSERT INTO dart_throw (turn_id, sector, multiplier, score, throw_number)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(turnId, sector, multiplier, score, throwNumber);
    return Throw.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM dart_throw WHERE id = ?');
    const row = stmt.get(id);
    
    return row ? new Throw(row) : null;
  }

  static findByTurnId(turnId) {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM dart_throw WHERE turn_id = ? ORDER BY throw_number ASC');
    const rows = stmt.all(turnId);
    
    return rows.map(row => new Throw(row));
  }

  isDouble() {
    return this.multiplier === 2;
  }

  isTriple() {
    return this.multiplier === 3;
  }

  isBullseye() {
    return this.sector === 25 && this.multiplier === 2;
  }

  isBull() {
    return this.sector === 25 && this.multiplier === 1;
  }

  toJSON() {
    return {
      id: this.id,
      turnId: this.turnId,
      sector: this.sector,
      multiplier: this.multiplier,
      score: this.score,
      throwNumber: this.throwNumber,
      timestamp: this.timestamp
    };
  }
}

module.exports = Throw;

// Made with Bob
