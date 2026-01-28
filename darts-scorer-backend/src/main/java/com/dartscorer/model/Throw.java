package com.dartscorer.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a single dart throw.
 */
@Entity
@Table(name = "dart_throw")
public class Throw extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turn_id", nullable = false)
    public Turn turn;
    
    /**
     * The sector hit (1-20 for numbers, 25 for bull)
     */
    @Column(nullable = false)
    public Integer sector;
    
    /**
     * The multiplier: 1 = single, 2 = double, 3 = triple
     */
    @Column(nullable = false)
    public Integer multiplier;
    
    /**
     * The calculated score for this throw
     */
    @Column(nullable = false)
    public Integer score;
    
    /**
     * The throw number in the turn (1, 2, or 3)
     */
    @Column(nullable = false)
    public Integer throwNumber;
    
    @Column(nullable = false)
    public LocalDateTime timestamp;
    
    /**
     * Default constructor
     */
    public Throw() {
        this.timestamp = LocalDateTime.now();
    }
    
    /**
     * Constructor with all fields
     */
    public Throw(Turn turn, Integer sector, Integer multiplier, Integer throwNumber) {
        this.turn = turn;
        this.sector = sector;
        this.multiplier = multiplier;
        this.throwNumber = throwNumber;
        this.score = calculateScore(sector, multiplier);
        this.timestamp = LocalDateTime.now();
    }
    
    /**
     * Calculate the score based on sector and multiplier
     */
    private Integer calculateScore(Integer sector, Integer multiplier) {
        return sector * multiplier;
    }
    
    /**
     * Check if this throw is a double
     */
    public boolean isDouble() {
        return multiplier == 2;
    }
    
    /**
     * Check if this throw is a triple
     */
    public boolean isTriple() {
        return multiplier == 3;
    }
    
    /**
     * Check if this throw is a bullseye (double bull - 50 points)
     */
    public boolean isBullseye() {
        return sector == 25 && multiplier == 2;
    }
    
    /**
     * Check if this throw is a bull (single bull - 25 points)
     */
    public boolean isBull() {
        return sector == 25 && multiplier == 1;
    }
}