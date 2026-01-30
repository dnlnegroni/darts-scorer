import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import localStorageService from './localStorageService';

class MobileBackendService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.serverPort = 8080;
    this.baseUrl = this.isNative ? `http://127.0.0.1:${this.serverPort}` : 'http://localhost:8080';
  }

  /**
   * Inizializza il backend mobile
   * Su piattaforme native, inizializza IndexedDB per storage locale
   * Su browser, usa il backend HTTP esterno
   */
  async initialize() {
    if (!this.isNative) {
      console.log('Running in browser, using external backend');
      return;
    }

    try {
      console.log('Initializing mobile backend with local storage...');
      
      // Inizializza il database locale IndexedDB
      await localStorageService.initialize();
      
      console.log('Mobile backend initialized successfully');
      console.log('Using local IndexedDB storage');
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
   * Su piattaforme native, verifica che IndexedDB sia inizializzato
   * Su browser, verifica la connessione HTTP
   */
  async checkHealth() {
    if (this.isNative) {
      // Su mobile, verifica che il database locale sia pronto
      return localStorageService.db !== null;
    }

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
    if (this.isNative) {
      // Su mobile, il database locale è già pronto dopo initialize()
      return true;
    }

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
