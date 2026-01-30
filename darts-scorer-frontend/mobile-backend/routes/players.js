const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Ottieni tutti i giocatori
router.get('/', (req, res) => {
  try {
    const players = Player.findAll();
    res.json(players.map(p => p.toJSON()));
  } catch (error) {
    console.error('Errore recupero giocatori:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ottieni un giocatore per ID
router.get('/:id', (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const player = Player.findById(playerId);
    
    if (!player) {
      return res.status(404).json({ message: 'Giocatore non trovato' });
    }
    
    res.json(player.toJSON());
  } catch (error) {
    console.error('Errore recupero giocatore:', error);
    res.status(500).json({ message: error.message });
  }
});

// Crea un nuovo giocatore
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Nome richiesto' });
    }
    
    const player = Player.create(name);
    res.status(201).json(player.toJSON());
  } catch (error) {
    console.error('Errore creazione giocatore:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// Made with Bob
