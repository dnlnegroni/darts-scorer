package com.dartscorer.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a darts game.
 */
@Entity
public class Game extends PanacheEntity {
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public GameMode gameMode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public GameStatus status = GameStatus.SETUP;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "game_players",
        joinColumns = @JoinColumn(name = "game_id"),
        inverseJoinColumns = @JoinColumn(name = "player_id")
    )
    @OrderColumn(name = "player_order")
    public List<Player> players = new ArrayList<>();
    
    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("turnNumber ASC")
    public List<Turn> turns = new ArrayList<>();
    
    /**
     * Index of the current player (0-based)
     */
    @Column(nullable = false)
    public Integer currentPlayerIndex = 0;
    
    /**
     * Current turn number (global counter)
     */
    @Column(nullable = false)
    public Integer currentTurnNumber = 0;
    
    /**
     * Winner of the game (if completed)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    public Player winner;
    
    @Column(nullable = false)
    public LocalDateTime startedAt;
    
    @Column
    public LocalDateTime completedAt;
    
    /**
     * Default constructor
     */
    public Game() {
        this.startedAt = LocalDateTime.now();
    }
    
    /**
     * Constructor with game mode
     */
    public Game(GameMode gameMode) {
        this.gameMode = gameMode;
        this.startedAt = LocalDateTime.now();
    }
    
    /**
     * Add a player to the game
     */
    public void addPlayer(Player player) {
        if (status != GameStatus.SETUP) {
            throw new IllegalStateException("Cannot add players after game has started");
        }
        this.players.add(player);
    }
    
    /**
     * Start the game
     */
    public void start() {
        if (players.isEmpty()) {
            throw new IllegalStateException("Cannot start game without players");
        }
        if (status != GameStatus.SETUP) {
            throw new IllegalStateException("Game has already been started");
        }
        this.status = GameStatus.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
    }
    
    /**
     * Get the current player
     */
    public Player getCurrentPlayer() {
        if (players.isEmpty()) {
            return null;
        }
        return players.get(currentPlayerIndex);
    }
    
    /**
     * Move to the next player
     */
    public void nextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
        if (currentPlayerIndex == 0) {
            // Completed a full round
            currentTurnNumber++;
        }
    }
    
    /**
     * Get the current turn for the current player
     */
    public Turn getCurrentTurn() {
        return turns.stream()
            .filter(t -> t.player.id.equals(getCurrentPlayer().id) && !t.isComplete())
            .findFirst()
            .orElse(null);
    }
    
    /**
     * Create a new turn for the current player
     */
    public Turn createNewTurn() {
        Player currentPlayer = getCurrentPlayer();
        Turn turn = new Turn(this, currentPlayer, currentTurnNumber);
        turns.add(turn);
        return turn;
    }
    
    /**
     * Get the current score for a player (for 301 modes)
     */
    public Integer getPlayerScore(Player player) {
        if (gameMode == GameMode.TRAINING) {
            // In training mode, return total score
            return turns.stream()
                .filter(t -> t.player.id.equals(player.id))
                .mapToInt(t -> t.totalScore)
                .sum();
        } else {
            // In 301 modes, return remaining score
            Turn lastTurn = turns.stream()
                .filter(t -> t.player.id.equals(player.id))
                .reduce((first, second) -> second)
                .orElse(null);
            
            if (lastTurn != null && lastTurn.remainingScore != null) {
                return lastTurn.remainingScore;
            }
            return 301; // Starting score
        }
    }
    
    /**
     * Complete the game with a winner
     */
    public void complete(Player winner) {
        this.status = GameStatus.COMPLETED;
        this.winner = winner;
        this.completedAt = LocalDateTime.now();
    }
    
    /**
     * Cancel the game
     */
    public void cancel() {
        this.status = GameStatus.CANCELLED;
        this.completedAt = LocalDateTime.now();
    }
    
    /**
     * Check if the game is in progress
     */
    public boolean isInProgress() {
        return status == GameStatus.IN_PROGRESS;
    }
    
    /**
     * Check if the game is completed
     */
    public boolean isCompleted() {
        return status == GameStatus.COMPLETED;
    }
    
    /**
     * Find active games
     */
    public static List<Game> findActiveGames() {
        return list("status", GameStatus.IN_PROGRESS);
    }
    
    /**
     * Find games by status
     */
    public static List<Game> findByStatus(GameStatus status) {
        return list("status", status);
    }
}