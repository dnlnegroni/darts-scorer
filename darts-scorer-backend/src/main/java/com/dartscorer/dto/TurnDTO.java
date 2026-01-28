package com.dartscorer.dto;

import com.dartscorer.model.Turn;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for Turn entity
 */
public class TurnDTO {
    
    public Long id;
    public PlayerDTO player;
    public Integer turnNumber;
    public List<ThrowDTO> dartThrows;
    public Integer totalScore;
    public Integer remainingScore;
    public Boolean isBust;
    
    public TurnDTO() {
    }
    
    /**
     * Create DTO from entity
     */
    public static TurnDTO from(Turn turn) {
        if (turn == null) {
            return null;
        }
        
        TurnDTO dto = new TurnDTO();
        dto.id = turn.id;
        dto.player = PlayerDTO.from(turn.player);
        dto.turnNumber = turn.turnNumber;
        dto.totalScore = turn.totalScore;
        dto.remainingScore = turn.remainingScore;
        dto.isBust = turn.isBust;
        dto.dartThrows = turn.dartThrows.stream()
            .map(ThrowDTO::from)
            .collect(Collectors.toList());
        
        return dto;
    }
}