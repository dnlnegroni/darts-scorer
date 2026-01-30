import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './GameSetup.css';

const GameSetup = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState('TRAINING');
  const [playerNames, setPlayerNames] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddPlayer = () => {
    if (playerNames.length < 8) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const handleRemovePlayer = (index) => {
    if (playerNames.length > 1) {
      const newPlayers = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newPlayers);
    }
  };

  const handlePlayerNameChange = (index, value) => {
    const newPlayers = [...playerNames];
    newPlayers[index] = value;
    setPlayerNames(newPlayers);
  };

  const handleStartGame = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate player names
    const validPlayers = playerNames.filter(name => name.trim() !== '');
    if (validPlayers.length === 0) {
      setError('Inserisci almeno un giocatore');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating game with mode:', gameMode, 'players:', validPlayers);
      const game = await api.createGame(gameMode, validPlayers);
      console.log('Game created:', game);
      
      if (!game || !game.id) {
        throw new Error('Gioco creato ma senza ID valido');
      }
      
      navigate(`/game/${game.id}`);
    } catch (err) {
      console.error('Error creating game:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-setup">
      <div className="game-setup-container">
        <h1>🎯 Darts Scorer</h1>
        <p className="subtitle">Configura la tua partita</p>

        <form onSubmit={handleStartGame}>
          {/* Game Mode Selection */}
          <div className="form-group">
            <label htmlFor="gameMode">Modalità di Gioco</label>
            <select
              id="gameMode"
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="form-control"
            >
              <option value="TRAINING">🎯 Allenamento</option>
              <option value="STANDARD_301">🎲 301 Standard</option>
              <option value="DOUBLE_OUT_301">🎲 301 Double Out</option>
            </select>
            <small className="form-text">
              {gameMode === 'TRAINING' && 'Modalità libera per praticare'}
              {gameMode === 'STANDARD_301' && 'Parti da 301 e arriva a 0'}
              {gameMode === 'DOUBLE_OUT_301' && 'Come 301 ma devi chiudere con un double'}
            </small>
          </div>

          {/* Players */}
          <div className="form-group">
            <label>Giocatori</label>
            {playerNames.map((name, index) => (
              <div key={index} className="player-input-group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`Giocatore ${index + 1}`}
                  className="form-control"
                  maxLength={50}
                />
                {playerNames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(index)}
                    className="btn btn-remove"
                    title="Rimuovi giocatore"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {playerNames.length < 8 && (
              <button
                type="button"
                onClick={handleAddPlayer}
                className="btn btn-secondary"
              >
                + Aggiungi Giocatore
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Creazione in corso...' : '🎯 Inizia Partita'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameSetup;
