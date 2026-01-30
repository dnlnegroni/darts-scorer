const Database = require('better-sqlite3');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.db = null;
  }

  initialize(dbPath) {
    // Usa il percorso fornito o crea un database in memoria per test
    const finalPath = dbPath || ':memory:';
    this.db = new Database(finalPath, { verbose: console.log });
    
    // Abilita foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Crea le tabelle
    this.createTables();
    
    console.log('Database inizializzato:', finalPath);
  }

  createTables() {
    // Tabella Player
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS player (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Tabella Game
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_mode TEXT NOT NULL CHECK(game_mode IN ('TRAINING', 'STANDARD_301', 'DOUBLE_OUT_301')),
        status TEXT NOT NULL DEFAULT 'SETUP' CHECK(status IN ('SETUP', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
        current_player_index INTEGER NOT NULL DEFAULT 0,
        current_turn_number INTEGER NOT NULL DEFAULT 0,
        winner_id INTEGER,
        started_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT,
        FOREIGN KEY (winner_id) REFERENCES player(id)
      )
    `);

    // Tabella game_players (relazione many-to-many)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_players (
        game_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        player_order INTEGER NOT NULL,
        PRIMARY KEY (game_id, player_id),
        FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES player(id)
      )
    `);

    // Tabella Turn
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS turn (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        turn_number INTEGER NOT NULL,
        total_score INTEGER NOT NULL DEFAULT 0,
        remaining_score INTEGER,
        is_bust INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (game_id) REFERENCES game(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES player(id)
      )
    `);

    // Tabella dart_throw
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS dart_throw (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        turn_id INTEGER NOT NULL,
        sector INTEGER NOT NULL,
        multiplier INTEGER NOT NULL,
        score INTEGER NOT NULL,
        throw_number INTEGER NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (turn_id) REFERENCES turn(id) ON DELETE CASCADE
      )
    `);

    // Indici per performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_game_status ON game(status);
      CREATE INDEX IF NOT EXISTS idx_turn_game ON turn(game_id);
      CREATE INDEX IF NOT EXISTS idx_throw_turn ON dart_throw(turn_id);
    `);

    console.log('Tabelle database create con successo');
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database non inizializzato. Chiamare initialize() prima.');
    }
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('Database chiuso');
    }
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager;

// Made with Bob
