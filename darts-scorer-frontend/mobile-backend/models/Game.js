const dbManager = require('../database');
const Player = require('./Player');
const Turn = require('./Turn');

const GameMode = {
  TRAINING: 'TRAINING',
  STANDARD_301: 'STANDARD_301',
  DOUBLE_OUT_301: 'DOUBLE_OUT_301'
};

const GameStatus = {
  SETUP: 'SETUP',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

class Game {
  constructor(data) {
    this.id = data.id;
    this.gameMode = data.game_mode;
    this.status = data.status;
    this.currentPlayerIndex = data.current_player_index;
    this.currentTurnNumber = data.current_turn_number;
    this.winnerId = data.winner_id;
    this.startedAt = data.started_at;
    this.completedAt = data.completed_at;
    this._players = null;
    this._turns = null;
  }

  static create(gameMode, playerNames) {
    if (!playerNames || playerNames.length === 0) {
      throw new Error('Almeno un giocatore è richiesto');
    }
    
    if (playerNames.length > 8) {
      throw new Error('Massimo 8 giocatori consentiti');
    }

    const db = dbManager.getDb();
    
    // Inizia transazione
    const transaction = db.transaction(() => {
      // Crea il gioco
      const stmt = db.prepare(`
        INSERT INTO game (game_mode, status)
        VALUES (?, ?)
      `);
      const result = stmt.run(gameMode, GameStatus.SETUP);
      const gameId = result.lastInsertRowid;
      
      // Crea o trova i giocatori e aggiungili al gioco
      playerNames.forEach((name, index) => {
        const player = Player.findOrCreate(name);
        
        const stmtGamePlayer = db.prepare(`
          INSERT INTO game_players (game_id, player_id, player_order)
          VALUES (?, ?, ?)
        `);
        stmtGamePlayer.run(gameId, player.id, index);
      });
      
      return gameId;
    });
    
    const gameId = transaction();
    const game = Game.findById(gameId);
    
    // Avvia il gioco
    game.start();
    
    return game;
  }

  static findById(id) {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM game WHERE id = ?');
    const row = stmt.get(id);
    
    return row ? new Game(row) : null;
  }

  static findActiveGames() {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM game WHERE status = ? ORDER BY started_at DESC');
    const rows = stmt.all(GameStatus.IN_PROGRESS);
    
    return rows.map(row => new Game(row));
  }

  static findByStatus(status) {
    const db = dbManager.getDb();
    const stmt = db.prepare('SELECT * FROM game WHERE status = ? ORDER BY started_at DESC');
    const rows = stmt.all(status);
    
    return rows.map(row => new Game(row));
  }

  getPlayers() {
    if (!this._players) {
      const db = dbManager.getDb();
      const stmt = db.prepare(`
        SELECT p.* FROM player p
        JOIN game_players gp ON p.id = gp.player_id
        WHERE gp.game_id = ?
        ORDER BY gp.player_order ASC
      `);
      const rows = stmt.all(this.id);
      this._players = rows.map(row => new Player(row));
    }
    return this._players;
  }

  getTurns() {
    if (!this._turns) {
      this._turns = Turn.findByGameId(this.id);
    }
    return this._turns;
  }

  getCurrentPlayer() {
    const players = this.getPlayers();
    if (players.length === 0) return null;
    return players[this.currentPlayerIndex];
  }

  getCurrentTurn() {
    const turns = this.getTurns();
    const currentPlayer = this.getCurrentPlayer();
    
    if (!currentPlayer) return null;
    
    // Trova l'ultimo turno incompleto del giocatore corrente
    const incompleteTurn = turns
      .filter(t => t.playerId === currentPlayer.id && !t.isComplete())
      .pop();
    
    return incompleteTurn || null;
  }

  start() {
    if (this.status !== GameStatus.SETUP) {
      throw new Error('Il gioco è già stato avviato');
    }
    
    const db = dbManager.getDb();
    const stmt = db.prepare(`
      UPDATE game 
      SET status = ?, started_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(GameStatus.IN_PROGRESS, this.id);
    
    this.status = GameStatus.IN_PROGRESS;
    
    // Crea il primo turno
    this.createNewTurn();
  }

  createNewTurn() {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      throw new Error('Nessun giocatore corrente');
    }
    
    let remainingScore = null;
    if (this.gameMode !== GameMode.TRAINING) {
      remainingScore = this.getPlayerScore(currentPlayer.id);
    }
    
    const turn = Turn.create(this.id, currentPlayer.id, this.currentTurnNumber, remainingScore);
    this._turns = null; // Reset cache
    
    return turn;
  }

  nextPlayer() {
    if (this.status !== GameStatus.IN_PROGRESS) {
      throw new Error('Il gioco non è in corso');
    }
    
    const players = this.getPlayers();
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % players.length;
    
    if (this.currentPlayerIndex === 0) {
      this.currentTurnNumber++;
    }
    
    const db = dbManager.getDb();
    const stmt = db.prepare(`
      UPDATE game 
      SET current_player_index = ?, current_turn_number = ?
      WHERE id = ?
    `);
    stmt.run(this.currentPlayerIndex, this.currentTurnNumber, this.id);
    
    // Crea nuovo turno per il prossimo giocatore
    this.createNewTurn();
  }

  getPlayerScore(playerId) {
    const turns = this.getTurns();
    
    if (this.gameMode === GameMode.TRAINING) {
      // In modalità training, ritorna il punteggio totale
      return turns
        .filter(t => t.playerId === playerId)
        .reduce((sum, t) => sum + t.totalScore, 0);
    } else {
      // In modalità 301, ritorna il punteggio rimanente
      const playerTurns = turns.filter(t => t.playerId === playerId);
      
      if (playerTurns.length === 0) {
        return 301; // Punteggio iniziale
      }
      
      const lastTurn = playerTurns[playerTurns.length - 1];
      return lastTurn.remainingScore !== null ? lastTurn.remainingScore : 301;
    }
  }

  complete(winnerId) {
    const db = dbManager.getDb();
    const stmt = db.prepare(`
      UPDATE game 
      SET status = ?, winner_id = ?, completed_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(GameStatus.COMPLETED, winnerId, this.id);
    
    this.status = GameStatus.COMPLETED;
    this.winnerId = winnerId;
  }

  cancel() {
    const db = dbManager.getDb();
    const stmt = db.prepare(`
      UPDATE game 
      SET status = ?, completed_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(GameStatus.CANCELLED, this.id);
    
    this.status = GameStatus.CANCELLED;
  }

  delete() {
    const db = dbManager.getDb();
    const stmt = db.prepare('DELETE FROM game WHERE id = ?');
    stmt.run(this.id);
  }

  isInProgress() {
    return this.status === GameStatus.IN_PROGRESS;
  }

  isCompleted() {
    return this.status === GameStatus.COMPLETED;
  }

  toJSON() {
    const players = this.getPlayers();
    const turns = this.getTurns();
    const currentTurn = this.getCurrentTurn();
    const currentPlayer = this.getCurrentPlayer();
    
    // Calcola i punteggi per ogni giocatore
    const playerScores = {};
    players.forEach(player => {
      playerScores[player.id] = this.getPlayerScore(player.id);
    });
    
    return {
      id: this.id,
      gameMode: this.gameMode,
      status: this.status,
      currentPlayerIndex: this.currentPlayerIndex,
      currentTurnNumber: this.currentTurnNumber,
      winnerId: this.winnerId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      players: players.map(p => ({
        ...p.toJSON(),
        score: playerScores[p.id]
      })),
      currentPlayer: currentPlayer ? currentPlayer.toJSON() : null,
      currentTurn: currentTurn ? currentTurn.toJSON() : null,
      turns: turns.map(t => t.toJSON())
    };
  }
}

Game.GameMode = GameMode;
Game.GameStatus = GameStatus;

module.exports = Game;

// Made with Bob
