# Darts Scorer Frontend

Frontend React per l'applicazione Darts Scorer.

## Tecnologie

- React 18
- Vite
- React Router DOM
- CSS3

## Installazione

```bash
npm install
```

## Avvio in Sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## Build per Produzione

```bash
npm run build
```

## Struttura del Progetto

```
src/
├── components/
│   ├── Dartboard/       # Componente dartboard interattivo
│   ├── Game/            # Componente principale del gioco
│   ├── GameSetup/       # Setup iniziale della partita
│   └── Scoreboard/      # Visualizzazione punteggi
├── services/
│   └── api.js           # Servizio per chiamate API
├── App.jsx              # Componente principale con routing
└── main.jsx             # Entry point
```

## Funzionalità

- Setup partita con selezione modalità e giocatori
- Dartboard interattivo con touch/click
- Visualizzazione punteggi in tempo reale
- Supporto per 3 modalità di gioco:
  - Training (allenamento)
  - 301 Standard
  - 301 Double Out
- Design responsive per mobile e desktop

## Note

Assicurati che il backend sia in esecuzione su `http://localhost:8080` prima di avviare il frontend.
