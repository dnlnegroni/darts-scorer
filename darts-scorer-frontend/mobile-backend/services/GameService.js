const Game = require('../models/Game');
const Turn = require('../models/Turn');

class GameService {
  createGame(gameMode, playerNames) {
    return Game.create(gameMode, playerNames);
  }

  getGame(gameId) {
    const game = Game.findById(gameId);
    if (!game) {
      throw new Error('Gioco non trovato');
    }
    return game;
  }

  recordThrow(gameId, sector, multiplier) {
    const game = this.getGame(gameId);
    
    if (!game.isInProgress()) {
      throw new Error('Il gioco non è in corso');
    }

    // Validazione input
    if (sector < 0 || sector > 25) {
      throw new Error('Settore non valido: deve essere tra 0 e 25');
    }

    // Per miss (sector 0), multiplier deve essere 0
    if (sector === 0 && multiplier !== 0) {
      throw new Error('Miss (settore 0) deve avere moltiplicatore 0');
    }

    // Per lanci non-miss, valida il moltiplicatore
    if (sector > 0 && (multiplier < 1 || multiplier > 3)) {
      throw new Error('Moltiplicatore non valido: deve essere 1, 2, o 3');
    }

    // Bull (25) può essere solo singolo (1) o doppio (2)
    if (sector === 25 && multiplier === 3) {
      throw new Error('Bull non può essere triplo');
    }

    // Ottieni o crea il turno corrente
    let currentTurn = game.getCurrentTurn();
    if (!currentTurn) {
      currentTurn = game.createNewTurn();
    }

    // Verifica se il turno è già completo
    if (currentTurn.isComplete()) {
      throw new Error('Turno corrente già completo. Chiama nextPlayer prima.');
    }

    // Aggiungi il lancio
    const dartThrow = currentTurn.addThrow(sector, multiplier);

    // Processa il lancio in base alla modalità di gioco
    this.processThrow(game, currentTurn, dartThrow);

    return game;
  }

  processThrow(game, turn, dartThrow) {
    switch (game.gameMode) {
      case Game.GameMode.TRAINING:
        // In modalità training, accumula solo il punteggio
        break;
        
      case Game.GameMode.STANDARD_301:
      case Game.GameMode.DOUBLE_OUT_301:
        this.process301Throw(game, turn, dartThrow);
        break;
    }
  }

  process301Throw(game, turn, dartThrow) {
    // Ottieni il punteggio corrente del giocatore
    const currentScore = game.getPlayerScore(turn.playerId);
    
    // Calcola il nuovo punteggio dopo questo lancio
    const newScore = currentScore - dartThrow.score;
    
    // Verifica bust (andato sotto 0 o esattamente 0 senza finish corretto)
    if (newScore < 0) {
      turn.setBust(true);
      turn.updateRemainingScore(currentScore); // Il punteggio rimane invariato
      return;
    }
    
    // Verifica finish esatto
    if (newScore === 0) {
      // In modalità DOUBLE_OUT, deve finire con un doppio
      if (game.gameMode === Game.GameMode.DOUBLE_OUT_301 && !dartThrow.isDouble()) {
        turn.setBust(true);
        turn.updateRemainingScore(currentScore);
        return;
      }
      
      // Finish valido!
      turn.updateRemainingScore(0);
      game.complete(turn.playerId);
      return;
    }
    
    // Lancio valido, aggiorna il punteggio rimanente
    turn.updateRemainingScore(newScore);
  }

  nextPlayer(gameId) {
    const game = this.getGame(gameId);
    
    if (!game.isInProgress()) {
      throw new Error('Il gioco non è in corso');
    }

    // Ottieni l'ultimo turno del giocatore corrente
    const currentPlayer = game.getCurrentPlayer();
    const turns = Turn.findByGameAndPlayer(game.id, currentPlayer.id);
    const lastTurn = turns[turns.length - 1];

    // Verifica che l'ultimo turno sia completo (ha 3 lanci)
    if (!lastTurn || !lastTurn.isComplete()) {
      throw new Error('Turno corrente non completo');
    }

    // Passa al prossimo giocatore
    game.nextPlayer();

    return game;
  }

  deleteGame(gameId) {
    const game = this.getGame(gameId);
    game.delete();
  }

  getActiveGames() {
    return Game.findActiveGames();
  }

  getGameHistory(gameId) {
    const game = this.getGame(gameId);
    return game.getTurns();
  }
}

module.exports = new GameService();

// Made with Bob
