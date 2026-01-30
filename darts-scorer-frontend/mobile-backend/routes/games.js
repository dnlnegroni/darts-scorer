const express = require('express');
const router = express.Router();
const gameService = require('../services/GameService');
const Player = require('../models/Player');

// Crea un nuovo gioco
router.post('/', (req, res) => {
  try {
    const { gameMode, playerNames } = req.body;
    
    if (!gameMode || !playerNames) {
      return res.status(400).json({ 
        message: 'gameMode e playerNames sono richiesti' 
      });
    }
    
    const game = gameService.createGame(gameMode, playerNames);
    res.status(201).json(game.toJSON());
  } catch (error) {
    console.error('Errore creazione gioco:', error);
    res.status(400).json({ message: error.message });
  }
});

// Ottieni un gioco per ID
router.get('/:id', (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const game = gameService.getGame(gameId);
    res.json(game.toJSON());
  } catch (error) {
    console.error('Errore recupero gioco:', error);
    res.status(404).json({ message: error.message });
  }
});

// Registra un lancio
router.post('/:id/throw', (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const { sector, multiplier } = req.body;
    
    if (sector === undefined || multiplier === undefined) {
      return res.status(400).json({ 
        message: 'sector e multiplier sono richiesti' 
      });
    }
    
    const game = gameService.recordThrow(gameId, sector, multiplier);
    res.json(game.toJSON());
  } catch (error) {
    console.error('Errore registrazione lancio:', error);
    res.status(400).json({ message: error.message });
  }
});

// Passa al prossimo giocatore
router.post('/:id/next-player', (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const game = gameService.nextPlayer(gameId);
    res.json(game.toJSON());
  } catch (error) {
    console.error('Errore passaggio giocatore:', error);
    res.status(400).json({ message: error.message });
  }
});

// Ottieni la cronologia del gioco
router.get('/:id/history', (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const turns = gameService.getGameHistory(gameId);
    res.json(turns.map(t => t.toJSON()));
  } catch (error) {
    console.error('Errore recupero cronologia:', error);
    res.status(404).json({ message: error.message });
  }
});

// Elimina un gioco
router.delete('/:id', (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    gameService.deleteGame(gameId);
    res.status(204).send();
  } catch (error) {
    console.error('Errore eliminazione gioco:', error);
    res.status(404).json({ message: error.message });
  }
});

// Ottieni tutti i giochi attivi
router.get('/', (req, res) => {
  try {
    const games = gameService.getActiveGames();
    res.json(games.map(g => g.toJSON()));
  } catch (error) {
    console.error('Errore recupero giochi attivi:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// Made with Bob
