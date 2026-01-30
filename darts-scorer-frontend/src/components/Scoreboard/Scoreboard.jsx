import './Scoreboard.css';

const Scoreboard = ({ game, currentTurn }) => {
  if (!game) return null;

  const getPlayerScore = (player) => {
    // Il punteggio è già nell'oggetto player
    return player.score;
  };

  const isCurrentPlayer = (player) => {
    // Il giocatore corrente è quello all'indice currentPlayerIndex
    const currentPlayer = game.players[game.currentPlayerIndex];
    return currentPlayer?.id === player.id;
  };

  const getWinner = () => {
    if (game.status === 'COMPLETED' && game.winnerId) {
      return game.players.find(p => p.id === game.winnerId);
    }
    return null;
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
        {game.status === 'COMPLETED' && getWinner() && (
          <div className="winner-banner">
            🏆 Vincitore: {getWinner().name}!
          </div>
        )}
      </div>

      <div className="players-list">
        {game.players.map((player) => {
          const winner = getWinner();
          return (
            <div
              key={player.id}
              className={`player-card ${isCurrentPlayer(player) ? 'active' : ''} ${
                winner?.id === player.id ? 'winner' : ''
              }`}
            >
              <div className="player-info">
                <div className="player-name">
                  {isCurrentPlayer(player) && <span className="current-indicator">▶</span>}
                  {player.name}
                  {winner?.id === player.id && <span className="trophy">🏆</span>}
                </div>
                <div className="player-score">
                  <div className="score-value">{getPlayerScore(player)}</div>
                  {game.gameMode !== 'TRAINING' && <span className="score-label">rimanenti</span>}
                  {game.gameMode === 'TRAINING' && <span className="score-label">punti</span>}
                </div>
              </div>
            </div>
          );
        })}
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