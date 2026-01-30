const express = require('express');
const cors = require('cors');
const path = require('path');
const dbManager = require('./database');
const gamesRouter = require('./routes/games');
const playersRouter = require('./routes/players');

class MobileBackendServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.port = 8080;
  }

  initialize(dbPath) {
    // Inizializza il database
    dbManager.initialize(dbPath);

    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Routes
    this.app.use('/api/games', gamesRouter);
    this.app.use('/api/players', playersRouter);

    // Health check endpoint
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    });

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error('Errore server:', err);
      res.status(500).json({ 
        message: 'Errore interno del server',
        error: err.message 
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ message: 'Endpoint non trovato' });
    });

    console.log('Server backend mobile inizializzato');
  }

  start(port = 8080) {
    return new Promise((resolve, reject) => {
      this.port = port;
      
      this.server = this.app.listen(port, '127.0.0.1', (err) => {
        if (err) {
          console.error('Errore avvio server:', err);
          reject(err);
          return;
        }
        
        console.log(`🚀 Server backend avviato su http://127.0.0.1:${port}`);
        console.log(`📊 API disponibili su http://127.0.0.1:${port}/api`);
        resolve();
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Porta ${port} già in uso`);
        } else {
          console.error('Errore server:', err);
        }
        reject(err);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Server backend fermato');
          dbManager.close();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getApp() {
    return this.app;
  }
}

// Singleton instance
const serverInstance = new MobileBackendServer();

// Se eseguito direttamente (non come modulo)
if (require.main === module) {
  const dbPath = process.env.DB_PATH || path.join(__dirname, 'darts-scorer.db');
  const port = process.env.PORT || 8080;
  
  serverInstance.initialize(dbPath);
  serverInstance.start(port).catch(err => {
    console.error('Impossibile avviare il server:', err);
    process.exit(1);
  });

  // Gestione graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nRicevuto SIGINT, chiusura server...');
    await serverInstance.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nRicevuto SIGTERM, chiusura server...');
    await serverInstance.stop();
    process.exit(0);
  });
}

module.exports = serverInstance;

// Made with Bob
