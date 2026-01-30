import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Dartboard from '../Dartboard/Dartboard';
import Scoreboard from '../Scoreboard/Scoreboard';
import './Game.css';

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [throwsInTurn, setThrowsInTurn] = useState(0);
  const isAdvancingRef = useRef(false);

  useEffect(() => {
    loadGame();
  }, [gameId]);

  const loadGame = async () => {
    try {
      setLoading(true);
      console.log('Loading game with ID:', gameId);
      const gameData = await api.getGame(gameId);
      console.log('Game data loaded:', gameData);
      
      if (!gameData) {
        throw new Error('Gioco non trovato');
      }
      
      // Assicurati che currentTurn esista sempre
      if (!gameData.currentTurn && gameData.players && gameData.players.length > 0) {
        console.log('Creating missing currentTurn');
        const currentPlayer = gameData.players[gameData.currentPlayerIndex || 0];
        gameData.currentTurn = {
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          dartThrows: [],
          totalScore: 0
        };
      }
      
      console.log('Setting game state with currentTurn:', gameData.currentTurn);
      setGame(gameData);
      
      if (gameData.currentTurn) {
        setCurrentTurn(gameData.currentTurn);
        setThrowsInTurn(gameData.currentTurn.dartThrows?.length || 0);
      } else {
        // Fallback se ancora non c'è currentTurn
        console.warn('No currentTurn available, using fallback');
        setCurrentTurn(null);
        setThrowsInTurn(0);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading game:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThrow = async (sector, multiplier) => {
    try {
      setError(null);
      console.log('Before throw - throwsInTurn:', throwsInTurn, 'currentTurn:', currentTurn);
      const updatedGame = await api.recordThrow(gameId, sector, multiplier);
      console.log('After throw - updatedGame:', updatedGame);
      console.log('After throw - currentTurn:', updatedGame.currentTurn);
      console.log('After throw - dartThrows length:', updatedGame.currentTurn?.dartThrows?.length);
      
      setGame(updatedGame);
      
      if (updatedGame.currentTurn) {
        setCurrentTurn(updatedGame.currentTurn);
        const newThrowCount = updatedGame.currentTurn.dartThrows?.length || 0;
        console.log('Setting throwsInTurn to:', newThrowCount);
        setThrowsInTurn(newThrowCount);
      } else {
        // Fallback: incrementa manualmente se currentTurn non è presente
        console.warn('currentTurn non presente nella risposta, incremento manuale');
        setThrowsInTurn(prev => Math.min(prev + 1, 3));
      }
    } catch (err) {
      console.error('Error in handleThrow:', err);
      setError(err.message);
    }
  };

  const handleNextPlayer = async () => {
    try {
      setError(null);
      const updatedGame = await api.nextPlayer(gameId);
      setGame(updatedGame);
      
      if (updatedGame.currentTurn) {
        setCurrentTurn(updatedGame.currentTurn);
        setThrowsInTurn(0);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewGame = () => {
    navigate('/');
  };

  const handleQuitGame = async () => {
    if (window.confirm('Sei sicuro di voler abbandonare questa partita?')) {
      try {
        await api.deleteGame(gameId);
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="game-container">
        <div className="loading">Caricamento partita...</div>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="game-container">
        <div className="error-message">
          <h2>Errore</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const isGameOver = game?.status === 'COMPLETED';
  const canNextPlayer = throwsInTurn === 3 && !isGameOver;

  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="game-title">🎯 Darts Scorer</h1>
        <button onClick={handleQuitGame} className="btn btn-quit">
          ← Abbandona Partita
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {game?.bustMessage && (
        <div
          className="alert alert-bust clickable"
          onClick={handleNextPlayer}
          role="button"
          tabIndex={0}
        >
          🚫 {game.bustMessage}
          <div className="bust-action">👆 Clicca per passare al prossimo turno</div>
        </div>
      )}

      <div className="game-content">
        <div className="game-left">
          <Scoreboard game={game} currentTurn={currentTurn} />
          
          <div className="game-controls">
            {!isGameOver && (
              <>
                <div className="throws-indicator">
                  Lanci effettuati: {throwsInTurn} / 3
                  {currentTurn && throwsInTurn === 3 && (
                    <div className="turn-complete-message">
                      ✅ Turno completato! Totale: {currentTurn.totalScore || 0} punti
                    </div>
                  )}
                </div>
                <button
                  onClick={handleNextPlayer}
                  disabled={!canNextPlayer}
                  className="btn btn-primary btn-large"
                >
                  {canNextPlayer ? '➡️ Prossimo Turno' : 'Completa i 3 lanci'}
                </button>
              </>
            )}
            
            {isGameOver && (
              <button
                onClick={handleNewGame}
                className="btn btn-primary btn-large"
              >
                🎯 Nuova Partita
              </button>
            )}
          </div>
        </div>

        <div className="game-right">
          <Dartboard
            onThrow={handleThrow}
            disabled={isGameOver || throwsInTurn >= 3}
          />
        </div>
      </div>
    </div>
  );
};

export default Game;
