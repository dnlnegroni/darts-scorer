package com.dartscorer.model;

/**
 * Enum representing the different game modes available in the darts scorer application.
 */
public enum GameMode {
    /**
     * Training mode - free scoring without rules
     */
    TRAINING,
    
    /**
     * Standard 301 game - start from 301 and subtract scores
     */
    STANDARD_301,
    
    /**
     * 301 with double out - must finish with a double
     */
    DOUBLE_OUT_301
}