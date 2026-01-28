package com.dartscorer.model;

/**
 * Enum representing the status of a game.
 */
public enum GameStatus {
    /**
     * Game is being set up (players being added, mode being selected)
     */
    SETUP,
    
    /**
     * Game is currently in progress
     */
    IN_PROGRESS,
    
    /**
     * Game has been completed
     */
    COMPLETED,
    
    /**
     * Game has been cancelled/abandoned
     */
    CANCELLED
}