package com.dartscorer.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

/**
 * Entity representing a player in the darts game.
 */
@Entity
public class Player extends PanacheEntity {
    
    @Column(nullable = false)
    public String name;
    
    @Column(nullable = false)
    public LocalDateTime createdAt;
    
    /**
     * Default constructor required by JPA
     */
    public Player() {
        this.createdAt = LocalDateTime.now();
    }
    
    /**
     * Constructor with name
     */
    public Player(String name) {
        this.name = name;
        this.createdAt = LocalDateTime.now();
    }
    
    /**
     * Find player by name
     */
    public static Player findByName(String name) {
        return find("name", name).firstResult();
    }
}