import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

class MobileBackendService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.serverPort = 8080;
    this.baseUrl = this.isNative ? `http://127.0.0.1:${this.serverPort}` : 'http://localhost:8080';
  }

  /**
   * Inizializza il backend mobile
   * Su piattaforme native, avvia il server Node.js embedded
   */
  async initialize() {
    if (!this.isNative) {
      console.log('Running in browser, using external backend');
      return;
    }

    try {
      console.log('Initializing mobile backend...');
      
      // Ottieni il percorso per il database
      const dbPath = await this.getDatabasePath();
      console.log('Database path:', dbPath);

      // Nota: Il server Node.js verrà avviato tramite un plugin nativo Android
      // Per ora, configuriamo solo l'URL base
      console.log('Mobile backend initialized');
      console.log('API Base URL:', this.baseUrl);
    } catch (error) {
      console.error('Error initializing mobile backend:', error);
      throw error;
    }
  }

  /**
   * Ottieni il percorso del database per la piattaforma corrente
   */
  async getDatabasePath() {
    if (!this.isNative) {
      return ':memory:';
    }

    try {
      // Usa la directory DATA per il database
      const result = await Filesystem.getUri({
        path: 'darts-scorer.db',
        directory: Directory.Data
      });
      
      return result.uri.replace('file://', '');
    } catch (error) {
      console.error('Error getting database path:', error);
      return ':memory:';
    }
  }

  /**
   * Ottieni l'URL base per le API
   */
  getApiBaseUrl() {
    return `${this.baseUrl}/api`;
  }

  /**
   * Verifica se il backend è disponibile
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Attendi che il backend sia pronto
   */
  async waitForBackend(maxAttempts = 30, delayMs = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
      const isHealthy = await this.checkHealth();
      if (isHealthy) {
        console.log('Backend is ready!');
        return true;
      }
      
      console.log(`Waiting for backend... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    throw new Error('Backend failed to start within timeout');
  }
}

// Singleton instance
const mobileBackend = new MobileBackendService();

export default mobileBackend;

// Made with Bob
