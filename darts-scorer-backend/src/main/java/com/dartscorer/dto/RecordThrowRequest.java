package com.dartscorer.dto;

/**
 * Request DTO for recording a throw
 */
public class RecordThrowRequest {
    
    public Integer sector;
    public Integer multiplier;
    
    public RecordThrowRequest() {
    }
    
    public RecordThrowRequest(Integer sector, Integer multiplier) {
        this.sector = sector;
        this.multiplier = multiplier;
    }
}