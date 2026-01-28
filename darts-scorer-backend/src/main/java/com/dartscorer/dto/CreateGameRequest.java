package com.dartscorer.dto;

import com.dartscorer.model.GameMode;
import java.util.List;

/**
 * Request DTO for creating a new game
 */
public class CreateGameRequest {
    
    public GameMode gameMode;
    public List<String> playerNames;
    
    public CreateGameRequest() {
    }
    
    public CreateGameRequest(GameMode gameMode, List<String> playerNames) {
        this.gameMode = gameMode;
        this.playerNames = playerNames;
    }
}