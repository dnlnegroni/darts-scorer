package com.dartscorer.dto;

import com.dartscorer.model.Game;
import com.dartscorer.model.GameMode;
import com.dartscorer.model.GameStatus;
import com.dartscorer.model.Turn;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * DTO representing the complete state of a game
 */
public class GameStateDTO {
    
    public Long id;
    public GameMode gameMode;
    public GameStatus status;
    public List<PlayerDTO> players;
    public PlayerDTO currentPlayer;
    public Integer currentPlayerIndex;
    public Map<Long, Integer> playerScores;
    public TurnDTO currentTurn;
    public List<TurnDTO> recentTurns;
    public PlayerDTO winner;
    
    public GameStateDTO() {
    }
    
    /**
     * Create DTO from entity
     */
    public static GameStateDTO from(Game game) {
        if (game == null) {
            return null;
        }
        
        GameStateDTO dto = new GameStateDTO();
        dto.id = game.id;
        dto.gameMode = game.gameMode;
        dto.status = game.status;
        dto.players = game.players.stream()
            .map(PlayerDTO::from)
            .collect(Collectors.toList());
        dto.currentPlayer = PlayerDTO.from(game.getCurrentPlayer());
        dto.currentPlayerIndex = game.currentPlayerIndex;
        
        // Get current turn (incomplete) or last turn (if complete)
        Turn currentTurn = game.getCurrentTurn();
        if (currentTurn == null && !game.turns.isEmpty()) {
            // If no incomplete turn, get the last turn for the current player
            currentTurn = game.turns.stream()
                .filter(t -> t.player.id.equals(game.getCurrentPlayer().id))
                .reduce((first, second) -> second)
                .orElse(null);
        }
        dto.currentTurn = TurnDTO.from(currentTurn);
        
        dto.winner = PlayerDTO.from(game.winner);
        
        // Calculate current scores for all players
        dto.playerScores = new HashMap<>();
        for (var player : game.players) {
            dto.playerScores.put(player.id, game.getPlayerScore(player));
        }
        
        // Get recent turns (last 10)
        dto.recentTurns = game.turns.stream()
            .skip(Math.max(0, game.turns.size() - 10))
            .map(TurnDTO::from)
            .collect(Collectors.toList());
        
        return dto;
    }
}