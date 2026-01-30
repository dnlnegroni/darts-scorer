const dbManager = require('../database');
const Throw = require('./Throw');

class Turn {
  constructor(data) {
    this.id = data.id;
    this.gameId = data.game_id;
    this.playerId = data.player_id;
    this.turnNumber = data.turn_number;
    this.totalScore = data.total_score;
    this.remainingScore = data.remaining_score;
    this.isBust = Boolean(data.is_bust);
    this._dartThrows = null;
  }

  static create(gameId, playerId, turnNumber, remainingScore = null) {
    const db = dbManager.getDb();
    
    const stmt = db.prepare(`
      INSERT INTO turn (game_id, player_id, turn_number, remaining_score)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(gameId, playerId, turnNumber, remainingScore);
    return Turn.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM turn WHERE id = ?');
    const row = stmt.get(id);
    
    return row ? new Turn(row) : null;
  }

  static findByGameId(gameId) {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM turn WHERE game_id = ? ORDER BY turn_number ASC, id ASC');
    const rows = stmt.all(gameId);
    
    return rows.map(row => new Turn(row));
  }

  static findByGameAndPlayer(gameId, playerId) {
    const db = dbManager.getDb();
    const stmt = db.prepare(`
      SELECT * FROM turn 
      WHERE game_id = ? AND player_id = ? 
      ORDER BY turn_number ASC, id ASC
    `);
    const rows = stmt.all(gameId, playerId);
    
    return rows.map(row => new Turn(row));
  }

  getDartThrows() {
    if (!this._dartThrows) {
      this._dartThrows = Throw.findByTurnId(this.id);
    }
    return this._dartThrows;
  }

  addThrow(sector, multiplier) {
    const throws = this.getDartThrows();
    const throwNumber = throws.length + 1;
    
    if (throwNumber > 3) {
      throw new Error('Turn già completo (3 lanci)');
    }
    
    const dartThrow = Throw.create(this.id, sector, multiplier, throwNumber);
    this._dartThrows = null; // Reset cache
    
    // Ricalcola il punteggio totale
    this.recalculateTotalScore();
    
    return dartThrow;
  }

  recalculateTotalScore() {
    const throws = this.getDartThrows();
    const totalScore = throws.reduce((sum, t) => sum + t.score, 0);
    
    const db = dbManager.getDb();
    const stmt = db.prepare('UPDATE turn SET total_score = ? WHERE id = ?');
    stmt.run(totalScore, this.id);
    
    this.totalScore = totalScore;
  }

  updateRemainingScore(score) {
    const db = dbManager.getDb();
    const stmt = db.prepare('UPDATE turn SET remaining_score = ? WHERE id = ?');
    stmt.run(score, this.id);
    
    this.remainingScore = score;
  }

  setBust(isBust) {
    const db = dbManager.getDb();
    const stmt = db.prepare('UPDATE turn SET is_bust = ? WHERE id = ?');
    stmt.run(isBust ? 1 : 0, this.id);
    
    this.isBust = isBust;
  }

  isComplete() {
    return this.getDartThrows().length === 3;
  }

  getThrowCount() {
    return this.getDartThrows().length;
  }

  endsWithDouble() {
    const throws = this.getDartThrows();
    if (throws.length === 0) return false;
    
    const lastThrow = throws[throws.length - 1];
    return lastThrow.isDouble();
  }

  toJSON() {
    return {
      id: this.id,
      gameId: this.gameId,
      playerId: this.playerId,
      turnNumber: this.turnNumber,
      totalScore: this.totalScore,
      remainingScore: this.remainingScore,
      isBust: this.isBust,
      dartThrows: this.getDartThrows().map(t => t.toJSON())
    };
  }
}

module.exports = Turn;

// Made with Bob
