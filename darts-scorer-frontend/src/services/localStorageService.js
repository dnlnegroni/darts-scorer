/**
 * Servizio di storage locale per gestire i dati del gioco senza backend
 * Usa IndexedDB per persistenza dei dati su mobile
 */

class LocalStorageService {
  constructor() {
    this.dbName = 'DartsScorerDB';
    this.dbVersion = 1;
    this.db = null;
  }

  /**
   * Inizializza il database IndexedDB
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Errore apertura database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database locale inizializzato');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store per i giochi
        if (!db.objectStoreNames.contains('games')) {
          const gamesStore = db.createObjectStore('games', { keyPath: 'id', autoIncrement: true });
          gamesStore.createIndex('status', 'status', { unique: false });
          gamesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Store per i giocatori
        if (!db.objectStoreNames.contains('players')) {
          const playersStore = db.createObjectStore('players', { keyPath: 'id', autoIncrement: true });
          playersStore.createIndex('name', 'name', { unique: false });
        }

        // Store per i turni
        if (!db.objectStoreNames.contains('turns')) {
          const turnsStore = db.createObjectStore('turns', { keyPath: 'id', autoIncrement: true });
          turnsStore.createIndex('gameId', 'gameId', { unique: false });
          turnsStore.createIndex('playerId', 'playerId', { unique: false });
        }

        // Store per i lanci
        if (!db.objectStoreNames.contains('throws')) {
          const throwsStore = db.createObjectStore('throws', { keyPath: 'id', autoIncrement: true });
          throwsStore.createIndex('turnId', 'turnId', { unique: false });
        }

        console.log('Database schema creato');
      };
    });
  }

  /**
   * Crea un nuovo gioco
   */
  async createGame(gameMode, playerNames) {
    const transaction = this.db.transaction(['games', 'players'], 'readwrite');
    const gamesStore = transaction.objectStore('games');
    const playersStore = transaction.objectStore('players');

    // Crea i giocatori
    const players = [];
    for (const name of playerNames) {
      const player = {
        name: name,
        createdAt: new Date().toISOString()
      };
      const playerId = await this._addToStore(playersStore, player);
      players.push({ id: playerId, name: name });
    }

    // Determina il punteggio iniziale in base alla modalità
    const initialScore = gameMode === 'TRAINING' ? 0 : 301;

    // Crea il gioco
    const game = {
      gameMode: gameMode,
      status: 'IN_PROGRESS',
      currentPlayerIndex: 0,
      currentThrowCount: 0,
      createdAt: new Date().toISOString(),
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        score: initialScore,
        totalThrows: 0
      })),
      currentTurn: {
        playerId: players[0].id,
        playerName: players[0].name,
        dartThrows: [],
        totalScore: 0
      }
    };

    const gameId = await this._addToStore(gamesStore, game);
    game.id = gameId;

    return game;
  }

  /**
   * Ottieni un gioco per ID
   */
  async getGame(gameId) {
    // Converti gameId in numero se è una stringa
    const numericId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    
    const transaction = this.db.transaction(['games'], 'readonly');
    const store = transaction.objectStore('games');
    
    return new Promise((resolve, reject) => {
      const request = store.get(numericId);
      request.onsuccess = () => {
        console.log('getGame result for ID', numericId, ':', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Registra un lancio
   */
  async recordThrow(gameId, sector, multiplier) {
    // Converti gameId in numero se è una stringa
    const numericId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    const game = await this.getGame(numericId);
    if (!game) {
      throw new Error('Gioco non trovato');
    }

    const currentPlayer = game.players[game.currentPlayerIndex];
    const points = sector * multiplier;

    console.log('recordThrow - Before:', {
      currentThrowCount: game.currentThrowCount,
      currentPlayerIndex: game.currentPlayerIndex,
      currentTurnDartThrows: game.currentTurn?.dartThrows?.length
    });

    // Se currentThrowCount è 0 e currentTurn ha lanci, significa che dobbiamo resettare per il nuovo giocatore
    if (game.currentThrowCount === 0 && game.currentTurn && game.currentTurn.dartThrows.length > 0) {
      console.log('Resetting currentTurn for new player');
      const nextPlayer = game.players[game.currentPlayerIndex];
      game.currentTurn = {
        playerId: nextPlayer.id,
        playerName: nextPlayer.name,
        dartThrows: [],
        totalScore: 0
      };
    }

    // Assicurati che currentTurn esista
    if (!game.currentTurn) {
      game.currentTurn = {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        dartThrows: [],
        totalScore: 0
      };
    }
    
    // Aggiungi il lancio a currentTurn PRIMA di controllare il cambio turno
    game.currentTurn.dartThrows.push({
      sector: sector,
      multiplier: multiplier,
      points: points
    });
    game.currentTurn.totalScore += points;
    currentPlayer.totalThrows++;

    console.log('recordThrow - After adding throw:', {
      dartThrowsLength: game.currentTurn.dartThrows.length,
      currentThrowCount: game.currentThrowCount
    });

    // Aggiorna il punteggio in base alla modalità
    if (game.gameMode === 'TRAINING') {
      currentPlayer.score += points;
      game.currentThrowCount++;
      console.log('TRAINING mode - currentThrowCount:', game.currentThrowCount);
      
      // NON resettiamo currentTurn qui! Lo faremo al prossimo lancio
      // Così il frontend può vedere tutti e 3 i lanci
      if (game.currentThrowCount >= 3) {
        console.log('TRAINING mode - Turn complete, will change player on next throw');
        // Cambiamo giocatore ma NON resettiamo currentTurn ancora
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        game.currentThrowCount = 0;
      }
    } else {
      // Modalità 301
      const newScore = currentPlayer.score - points;
      
      // Verifica se il lancio è valido
      if (newScore < 0) {
        // Bust - punteggio non valido
        game.currentThrowCount++;
        if (game.currentThrowCount >= 3) {
          // Fine turno, passa al prossimo giocatore
          game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
          game.currentThrowCount = 0;
          // NON resettiamo currentTurn qui
        }
      } else if (newScore === 0) {
        // Vittoria!
        if (game.gameMode === 'DOUBLE_OUT_301' && multiplier !== 2) {
          // Deve finire con un doppio
          game.currentThrowCount++;
          if (game.currentThrowCount >= 3) {
            game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
            game.currentThrowCount = 0;
            // NON resettiamo currentTurn qui
          }
        } else {
          // Vittoria valida
          currentPlayer.score = 0;
          game.status = 'COMPLETED';
          game.winnerId = currentPlayer.id;
        }
      } else {
        // Lancio valido
        currentPlayer.score = newScore;
        game.currentThrowCount++;
        if (game.currentThrowCount >= 3) {
          game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
          game.currentThrowCount = 0;
          // NON resettiamo currentTurn qui
        }
      }
    }

    // Salva il lancio
    const transaction = this.db.transaction(['throws', 'turns'], 'readwrite');
    const throwsStore = transaction.objectStore('throws');
    
    const throwData = {
      gameId: numericId,
      playerId: currentPlayer.id,
      sector: sector,
      multiplier: multiplier,
      points: points,
      timestamp: new Date().toISOString()
    };
    
    await this._addToStore(throwsStore, throwData);

    // Aggiorna il gioco
    await this._updateGame(game);

    return game;
  }

  /**
   * Passa al prossimo giocatore
   */
  async nextPlayer(gameId) {
    // Converti gameId in numero se è una stringa
    const numericId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    const game = await this.getGame(numericId);
    if (!game) {
      throw new Error('Gioco non trovato');
    }

    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    game.currentThrowCount = 0;
    
    const nextPlayer = game.players[game.currentPlayerIndex];
    game.currentTurn = {
      playerId: nextPlayer.id,
      playerName: nextPlayer.name,
      dartThrows: [],
      totalScore: 0
    };

    await this._updateGame(game);
    return game;
  }

  /**
   * Ottieni tutti i giochi attivi
   */
  async getActiveGames() {
    const transaction = this.db.transaction(['games'], 'readonly');
    const store = transaction.objectStore('games');
    const index = store.index('status');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll('IN_PROGRESS');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Ottieni tutti i giocatori
   */
  async getPlayers() {
    const transaction = this.db.transaction(['players'], 'readonly');
    const store = transaction.objectStore('players');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Elimina un gioco
   */
  async deleteGame(gameId) {
    // Converti gameId in numero se è una stringa
    const numericId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    
    const transaction = this.db.transaction(['games'], 'readwrite');
    const store = transaction.objectStore('games');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(numericId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Ottieni la cronologia di un gioco
   */
  async getGameHistory(gameId) {
    // Converti gameId in numero se è una stringa
    const numericId = typeof gameId === 'string' ? parseInt(gameId, 10) : gameId;
    
    const transaction = this.db.transaction(['throws'], 'readonly');
    const store = transaction.objectStore('throws');
    const index = store.index('gameId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(numericId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Metodi helper privati

  _addToStore(store, data) {
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async _updateGame(game) {
    const transaction = this.db.transaction(['games'], 'readwrite');
    const store = transaction.objectStore('games');
    
    return new Promise((resolve, reject) => {
      const request = store.put(game);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Elimina tutti i giochi completati più vecchi di N giorni
   * @param {number} daysOld - Numero di giorni (default: 30)
   */
  async cleanupOldGames(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffTimestamp = cutoffDate.toISOString();

    const transaction = this.db.transaction(['games', 'throws'], 'readwrite');
    const gamesStore = transaction.objectStore('games');
    const throwsStore = transaction.objectStore('throws');

    return new Promise((resolve, reject) => {
      const request = gamesStore.openCursor();
      let deletedCount = 0;

      request.onsuccess = async (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const game = cursor.value;
          // Elimina solo giochi completati più vecchi della data limite
          if (game.status === 'COMPLETED' && game.createdAt < cutoffTimestamp) {
            // Elimina i lanci associati
            const throwsIndex = throwsStore.index('gameId');
            const throwsRequest = throwsIndex.openCursor(IDBKeyRange.only(game.id));
            
            throwsRequest.onsuccess = (e) => {
              const throwCursor = e.target.result;
              if (throwCursor) {
                throwCursor.delete();
                throwCursor.continue();
              }
            };

            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          console.log(`Cleanup completato: ${deletedCount} giochi eliminati`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Ottieni statistiche sull'utilizzo dello storage
   */
  async getStorageStats() {
    const transaction = this.db.transaction(['games', 'players', 'throws'], 'readonly');
    
    const gamesCount = await this._countRecords(transaction.objectStore('games'));
    const playersCount = await this._countRecords(transaction.objectStore('players'));
    const throwsCount = await this._countRecords(transaction.objectStore('throws'));

    // Stima approssimativa della dimensione (ogni record ~1KB)
    const estimatedSize = (gamesCount + playersCount + throwsCount) * 1024;

    return {
      games: gamesCount,
      players: playersCount,
      throws: throwsCount,
      estimatedSizeBytes: estimatedSize,
      estimatedSizeMB: (estimatedSize / (1024 * 1024)).toFixed(2)
    };
  }

  /**
   * Elimina tutti i dati (reset completo)
   */
  async clearAllData() {
    const transaction = this.db.transaction(['games', 'players', 'throws', 'turns'], 'readwrite');
    
    await Promise.all([
      this._clearStore(transaction.objectStore('games')),
      this._clearStore(transaction.objectStore('players')),
      this._clearStore(transaction.objectStore('throws')),
      this._clearStore(transaction.objectStore('turns'))
    ]);

    console.log('Tutti i dati sono stati eliminati');
  }

  _countRecords(store) {
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _clearStore(store) {
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
const localStorageService = new LocalStorageService();

export default localStorageService;

// Made with Bob

