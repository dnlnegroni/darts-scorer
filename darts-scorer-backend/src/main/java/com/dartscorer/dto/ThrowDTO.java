package com.dartscorer.dto;

import com.dartscorer.model.Throw;

/**
 * DTO for Throw entity
 */
public class ThrowDTO {
    
    public Long id;
    public Integer sector;
    public Integer multiplier;
    public Integer score;
    public Integer throwNumber;
    
    public ThrowDTO() {
    }
    
    public ThrowDTO(Long id, Integer sector, Integer multiplier, Integer score, Integer throwNumber) {
        this.id = id;
        this.sector = sector;
        this.multiplier = multiplier;
        this.score = score;
        this.throwNumber = throwNumber;
    }
    
    /**
     * Create DTO from entity
     */
    public static ThrowDTO from(Throw dartThrow) {
        if (dartThrow == null) {
            return null;
        }
        return new ThrowDTO(
            dartThrow.id,
            dartThrow.sector,
            dartThrow.multiplier,
            dartThrow.score,
            dartThrow.throwNumber
        );
    }
}