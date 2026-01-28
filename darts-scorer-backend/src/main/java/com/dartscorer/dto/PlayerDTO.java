package com.dartscorer.dto;

import com.dartscorer.model.Player;

/**
 * DTO for Player entity
 */
public class PlayerDTO {
    
    public Long id;
    public String name;
    
    public PlayerDTO() {
    }
    
    public PlayerDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }
    
    /**
     * Create DTO from entity
     */
    public static PlayerDTO from(Player player) {
        if (player == null) {
            return null;
        }
        return new PlayerDTO(player.id, player.name);
    }
    
    /**
     * Convert DTO to entity
     */
    public Player toEntity() {
        Player player = new Player(this.name);
        player.id = this.id;
        return player;
    }
}