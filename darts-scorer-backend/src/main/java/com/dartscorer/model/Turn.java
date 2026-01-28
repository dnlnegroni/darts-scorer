package com.dartscorer.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a turn in a game (3 throws per turn).
 */
@Entity
public class Turn extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    public Game game;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    public Player player;
    
    @Column(nullable = false)
    public Integer turnNumber;
    
    @OneToMany(mappedBy = "turn", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("throwNumber ASC")
    public List<Throw> dartThrows = new ArrayList<>();
    
    /**
     * Total score for this turn (sum of all throws)
     */
    @Column(nullable = false)
    public Integer totalScore = 0;
    
    /**
     * Remaining score after this turn (for 301 modes)
     */
    @Column
    public Integer remainingScore;
    
    /**
     * Flag indicating if this turn resulted in a bust (went below 0 in 301)
     */
    @Column(nullable = false)
    public Boolean isBust = false;
    
    /**
     * Default constructor
     */
    public Turn() {
    }
    
    /**
     * Constructor with game, player, and turn number
     */
    public Turn(Game game, Player player, Integer turnNumber) {
        this.game = game;
        this.player = player;
        this.turnNumber = turnNumber;
    }
    
    /**
     * Add a throw to this turn and recalculate total score
     */
    public void addThrow(Throw dartThrow) {
        this.dartThrows.add(dartThrow);
        dartThrow.turn = this;
        recalculateTotalScore();
    }
    
    /**
     * Recalculate the total score for this turn
     */
    public void recalculateTotalScore() {
        this.totalScore = dartThrows.stream()
            .mapToInt(t -> t.score)
            .sum();
    }
    
    /**
     * Check if this turn is complete (has 3 throws)
     */
    public boolean isComplete() {
        return dartThrows.size() == 3;
    }
    
    /**
     * Get the number of throws in this turn
     */
    public int getThrowCount() {
        return dartThrows.size();
    }
    
    /**
     * Check if the last throw was a double (for double out rule)
     */
    public boolean endsWithDouble() {
        if (dartThrows.isEmpty()) {
            return false;
        }
        Throw lastThrow = dartThrows.get(dartThrows.size() - 1);
        return lastThrow.isDouble();
    }
}