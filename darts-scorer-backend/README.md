# Darts Scorer Application

Applicazione web per il conteggio dei punti nel gioco delle freccette (darts).

## Architettura

- **Backend**: Quarkus (Java 21)
- **Frontend**: React + Vite (da creare)
- **Database**: H2 (development), PostgreSQL (production)

## Funzionalità

### Modalità di Gioco

1. **Training**: Modalità allenamento per praticare senza regole specifiche
2. **301 Standard**: Partenza da 301 punti, si sottraggono i punteggi fino ad arrivare a 0
3. **301 Double Out**: Come il 301 standard ma per chiudere è necessario fare un double

## Backend API

### Avvio del Backend

```bash
./mvnw quarkus:dev
```

Il backend sarà disponibile su `http://localhost:8080`

### Swagger UI

Documentazione interattiva delle API disponibile su:
- Swagger UI: http://localhost:8080/swagger-ui
- OpenAPI Spec: http://localhost:8080/openapi

### Endpoints Principali

#### Games

- `POST /api/games` - Crea una nuova partita
  ```json
  {
    "gameMode": "TRAINING|STANDARD_301|DOUBLE_OUT_301",
    "playerNames": ["Giocatore 1", "Giocatore 2"]
  }
  ```

- `GET /api/games/{id}` - Ottieni lo stato di una partita
- `GET /api/games` - Lista delle partite attive
- `POST /api/games/{id}/throw` - Registra un lancio
  ```json
  {
    "sector": 20,
    "multiplier": 3
  }
  ```
- `POST /api/games/{id}/next-player` - Passa al giocatore successivo
- `GET /api/games/{id}/history` - Storico dei turni
- `DELETE /api/games/{id}` - Elimina una partita

#### Players

- `GET /api/players` - Lista di tutti i giocatori
- `GET /api/players/{id}` - Dettagli di un giocatore

### Modello Dati

#### Settori del Dartboard
- Settori: 1-20 (numeri standard)
- Settore 25: Bull (centro)

#### Moltiplicatori
- 1: Single (area normale)
- 2: Double (anello esterno o bullseye)
- 3: Triple (anello centrale)

**Nota**: Il bull (25) può essere solo single (25 punti) o double (50 punti, bullseye)

## Frontend (Da Implementare)

Il frontend React includerà:

1. **Setup Game**: Selezione modalità e giocatori
2. **Dartboard Interattivo**: Rappresentazione grafica del bersaglio
3. **Scoreboard**: Visualizzazione punteggi in tempo reale
4. **Game History**: Storico dei lanci

### Struttura Prevista

```
darts-scorer-frontend/
├── src/
│   ├── components/
│   │   ├── Dartboard/
│   │   ├── Scoreboard/
│   │   ├── GameSetup/
│   │   └── GameHistory/
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Sviluppo

### Requisiti

- Java 21+
- Maven 3.8+
- Node.js 18+ (per il frontend)

### Database

In modalità development viene utilizzato H2 in-memory. I dati vengono persi al riavvio.

Per production, configurare PostgreSQL in `application.properties`.

## Testing

### Test Backend

```bash
./mvnw test
```

### Test delle API con curl

Creare una partita:
```bash
curl -X POST http://localhost:8080/api/games \
  -H "Content-Type: application/json" \
  -d '{
    "gameMode": "TRAINING",
    "playerNames": ["Mario", "Luigi"]
  }'
```

Registrare un lancio (sostituire {id} con l'ID della partita):
```bash
curl -X POST http://localhost:8080/api/games/{id}/throw \
  -H "Content-Type: application/json" \
  -d '{
    "sector": 20,
    "multiplier": 3
  }'
```

## Licenza

Progetto personale, vietata la riproduzione parziale o completa senza autorizzazione scritta.
