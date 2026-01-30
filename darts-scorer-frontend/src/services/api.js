import mobileBackend from './mobileBackend';

const API_BASE_URL = mobileBackend.getApiBaseUrl();

/**
 * API service for communicating with the Darts Scorer backend
 */
class ApiService {
  /**
   * Create a new game
   * @param {string} gameMode - TRAINING, STANDARD_301, or DOUBLE_OUT_301
   * @param {string[]} playerNames - Array of player names
   * @returns {Promise<Object>} Game state
   */
  async createGame(gameMode, playerNames) {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameMode, playerNames }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create game');
    }
    
    return response.json();
  }

  /**
   * Get game state by ID
   * @param {number} gameId - Game ID
   * @returns {Promise<Object>} Game state
   */
  async getGame(gameId) {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get game');
    }
    
    return response.json();
  }

  /**
   * Record a throw
   * @param {number} gameId - Game ID
   * @param {number} sector - Sector number (1-20 or 25 for bull)
   * @param {number} multiplier - Multiplier (1=single, 2=double, 3=triple)
   * @returns {Promise<Object>} Updated game state
   */
  async recordThrow(gameId, sector, multiplier) {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/throw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sector, multiplier }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to record throw');
    }
    
    return response.json();
  }

  /**
   * Move to next player
   * @param {number} gameId - Game ID
   * @returns {Promise<Object>} Updated game state
   */
  async nextPlayer(gameId) {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/next-player`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to move to next player');
    }
    
    return response.json();
  }

  /**
   * Get game history
   * @param {number} gameId - Game ID
   * @returns {Promise<Array>} Array of turns
   */
  async getGameHistory(gameId) {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/history`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get game history');
    }
    
    return response.json();
  }

  /**
   * Delete a game
   * @param {number} gameId - Game ID
   * @returns {Promise<void>}
   */
  async deleteGame(gameId) {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete game');
    }
  }

  /**
   * Get all active games
   * @returns {Promise<Array>} Array of active games
   */
  async getActiveGames() {
    const response = await fetch(`${API_BASE_URL}/games`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get active games');
    }
    
    return response.json();
  }

  /**
   * Get all players
   * @returns {Promise<Array>} Array of players
   */
  async getPlayers() {
    const response = await fetch(`${API_BASE_URL}/players`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get players');
    }
    
    return response.json();
  }
}

export default new ApiService();