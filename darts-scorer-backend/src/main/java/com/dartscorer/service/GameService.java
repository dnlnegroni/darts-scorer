package com.dartscorer.service;

import com.dartscorer.model.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.BadRequestException;
import java.util.List;

/**
 * Service for managing game logic
 */
@ApplicationScoped
public class GameService {
    
    /**
     * Create a new game with players
     */
    @Transactional
    public Game createGame(GameMode gameMode, List<String> playerNames) {
        if (playerNames == null || playerNames.isEmpty()) {
            throw new BadRequestException("At least one player is required");
        }
        
        if (playerNames.size() > 8) {
            throw new BadRequestException("Maximum 8 players allowed");
        }
        
        // Create game
        Game game = new Game(gameMode);
        
        // Create or find players and add to game
        for (String playerName : playerNames) {
            Player player = Player.findByName(playerName);
            if (player == null) {
                player = new Player(playerName);
                player.persist();
            }
            game.addPlayer(player);
        }
        
        // Start the game
        game.start();
        game.persist();
        
        // Create first turn for first player
        Turn firstTurn = game.createNewTurn();
        firstTurn.persist();
        
        return game;
    }
    
    /**
     * Get game by ID
     */
    public Game getGame(Long gameId) {
        Game game = Game.findById(gameId);
        if (game == null) {
            throw new NotFoundException("Game not found");
        }
        return game;
    }
    
    /**
     * Record a throw in the current turn
     */
    @Transactional
    public Game recordThrow(Long gameId, Integer sector, Integer multiplier) {
        Game game = getGame(gameId);
        
        if (!game.isInProgress()) {
            throw new BadRequestException("Game is not in progress");
        }
        
        // Validate input
        // Sector 0 is allowed for miss (no score)
        if (sector < 0 || sector > 25) {
            throw new BadRequestException("Invalid sector: must be between 0 and 25");
        }
        
        // For miss (sector 0), multiplier must be 0
        if (sector == 0 && multiplier != 0) {
            throw new BadRequestException("Miss (sector 0) must have multiplier 0");
        }
        
        // For non-miss throws, validate multiplier
        if (sector > 0 && (multiplier < 1 || multiplier > 3)) {
            throw new BadRequestException("Invalid multiplier: must be 1, 2, or 3");
        }
        
        // Bull (25) can only be single (1) or double (2)
        if (sector == 25 && multiplier == 3) {
            throw new BadRequestException("Bull cannot be triple");
        }
        
        // Get or create current turn
        Turn currentTurn = game.getCurrentTurn();
        if (currentTurn == null) {
            currentTurn = game.createNewTurn();
            currentTurn.persist();
        }
        
        // Check if turn is already complete
        if (currentTurn.isComplete()) {
            throw new BadRequestException("Current turn is already complete. Call nextPlayer first.");
        }
        
        // Create and add throw
        int throwNumber = currentTurn.getThrowCount() + 1;
        Throw dartThrow = new Throw(currentTurn, sector, multiplier, throwNumber);
        dartThrow.persist();
        
        currentTurn.addThrow(dartThrow);
        
        // Process throw based on game mode
        processThrow(game, currentTurn, dartThrow);
        
        return game;
    }
    
    /**
     * Process a throw based on game mode
     */
    private void processThrow(Game game, Turn turn, Throw dartThrow) {
        switch (game.gameMode) {
            case TRAINING:
                // In training mode, just accumulate score
                break;
                
            case STANDARD_301:
            case DOUBLE_OUT_301:
                process301Throw(game, turn, dartThrow);
                break;
        }
    }
    
    /**
     * Process a throw in 301 mode
     */
    private void process301Throw(Game game, Turn turn, Throw dartThrow) {
        // Get current score for player
        Integer currentScore = game.getPlayerScore(turn.player);
        
        // Calculate new score after this throw
        Integer newScore = currentScore - dartThrow.score;
        
        // Check for bust (went below 0 or exactly 0 without proper finish)
        if (newScore < 0) {
            turn.isBust = true;
            turn.remainingScore = currentScore; // Score remains unchanged
            return;
        }
        
        // Check for exact finish
        if (newScore == 0) {
            // In DOUBLE_OUT mode, must finish with a double
            if (game.gameMode == GameMode.DOUBLE_OUT_301 && !dartThrow.isDouble()) {
                turn.isBust = true;
                turn.remainingScore = currentScore;
                return;
            }
            
            // Valid finish!
            turn.remainingScore = 0;
            game.complete(turn.player);
            return;
        }
        
        // Valid throw, update remaining score
        turn.remainingScore = newScore;
    }
    
    /**
     * Move to next player
     */
    @Transactional
    public Game nextPlayer(Long gameId) {
        Game game = getGame(gameId);
        
        if (!game.isInProgress()) {
            throw new BadRequestException("Game is not in progress");
        }
        
        // Get the last turn for the current player
        Turn lastTurn = game.turns.stream()
            .filter(t -> t.player.id.equals(game.getCurrentPlayer().id))
            .reduce((first, second) -> second)
            .orElse(null);
        
        // Check if the last turn is complete (has 3 throws)
        if (lastTurn == null || !lastTurn.isComplete()) {
            throw new BadRequestException("Current turn is not complete");
        }
        
        // Move to next player
        game.nextPlayer();
        
        // Create new turn for next player
        Turn nextTurn = game.createNewTurn();
        
        // Set initial remaining score for 301 modes
        if (game.gameMode != GameMode.TRAINING) {
            nextTurn.remainingScore = game.getPlayerScore(game.getCurrentPlayer());
        }
        
        nextTurn.persist();
        
        return game;
    }
    
    /**
     * Delete a game
     */
    @Transactional
    public void deleteGame(Long gameId) {
        Game game = getGame(gameId);
        game.delete();
    }
    
    /**
     * Get all active games
     */
    public List<Game> getActiveGames() {
        return Game.findActiveGames();
    }
    
    /**
     * Get game history (recent turns)
     */
    public List<Turn> getGameHistory(Long gameId) {
        Game game = getGame(gameId);
        return game.turns;
    }
}