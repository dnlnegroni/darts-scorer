import './Scoreboard.css';

const Scoreboard = ({ game, currentTurn }) => {
  if (!game) return null;

  const getPlayerScore = (player) => {
    if (game.gameMode === 'TRAINING') {
      return game.playerScores?.[player.id] || 0;
    } else {
      return game.playerScores?.[player.id] ?? 301;
    }
  };

  const isCurrentPlayer = (player) => {
    return game.currentPlayer?.id === player.id;
  };

  const getGameModeLabel = () => {
    switch (game.gameMode) {
      case 'TRAINING':
        return '🎯 Allenamento';
      case 'STANDARD_301':
        return '🎲 301 Standard';
      case 'DOUBLE_OUT_301':
        return '🎲 301 Double Out';
      default:
        return game.gameMode;
    }
  };

  return (
    <div className="scoreboard">
      <div className="scoreboard-header">
        <h2>{getGameModeLabel()}</h2>
        {game.status === 'COMPLETED' && game.winner && (
          <div className="winner-banner">
            🏆 Vincitore: {game.winner.name}!
          </div>
        )}
      </div>

      <div className="players-list">
        {game.players.map((player) => (
          <div
            key={player.id}
            className={`player-card ${isCurrentPlayer(player) ? 'active' : ''} ${
              game.winner?.id === player.id ? 'winner' : ''
            }`}
          >
            <div className="player-info">
              <div className="player-name">
                {isCurrentPlayer(player) && <span className="current-indicator">▶</span>}
                {player.name}
                {game.winner?.id === player.id && <span className="trophy">🏆</span>}
              </div>
              <div className="player-score">
                {getPlayerScore(player)}
                {game.gameMode !== 'TRAINING' && <span className="score-label">rimanenti</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentTurn && game.status === 'IN_PROGRESS' && (
        <div className="current-turn-info">
          <h3>Turno Corrente</h3>
          <div className="turn-details">
            <div className="throws-count">
              Lanci: {currentTurn.dartThrows?.length || 0} / 3
            </div>
            {currentTurn.dartThrows && currentTurn.dartThrows.length > 0 && (
              <div className="throws-list">
                {currentTurn.dartThrows.map((dartThrow, index) => (
                  <div key={index} className="throw-item">
                    <span className="throw-number">#{index + 1}</span>
                    <span className="throw-score">
                      {dartThrow.multiplier === 1 && 'S'}
                      {dartThrow.multiplier === 2 && 'D'}
                      {dartThrow.multiplier === 3 && 'T'}
                      {dartThrow.sector} = {dartThrow.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="turn-total">
              Totale Turno: {currentTurn.totalScore || 0}
            </div>
            {currentTurn.isBust && (
              <div className="bust-indicator">
                ❌ BUST! Punteggio non valido
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;