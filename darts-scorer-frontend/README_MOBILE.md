# 🎯 Darts Scorer - App Mobile Android

App mobile per il punteggio delle freccette, ottimizzata per Samsung S25 Ultra con backend completamente offline.

## 🚀 Quick Start

### Prerequisiti

- Node.js 18+ installato
- Android Studio installato
- Samsung S25 Ultra con Debug USB abilitato
- Java JDK 17+

### Installazione Dipendenze

```bash
# Installa dipendenze frontend
npm install

# Installa dipendenze backend
cd mobile-backend
npm install
cd ..
```

### Build e Deploy

```bash
# 1. Build del frontend
npm run build

# 2. Sincronizza con Android
npx cap sync android

# 3. Apri in Android Studio
npx cap open android

# 4. In Android Studio: Run (▶️) per installare sul dispositivo
```

## 📱 Sviluppo

### Test in Browser

```bash
npm run dev
```

Apri `http://localhost:5173`

### Test Backend Standalone

```bash
cd mobile-backend
npm start
```

Il server sarà disponibile su `http://localhost:8080`

### Test su Dispositivo con Live Reload

```bash
npm run build
npx cap sync android
npx cap run android --livereload --external
```

## 🏗️ Architettura

```
Frontend (React + Vite)
    ↓
Capacitor Bridge
    ↓
Backend Node.js Embedded
    ↓
SQLite Database
```

### Componenti Principali

- **Frontend**: React app con UI ottimizzata per mobile
- **Backend**: Express server con API REST
- **Database**: SQLite per storage locale
- **Capacitor**: Bridge tra web e native Android

## 📂 Struttura Progetto

```
darts-scorer-frontend/
├── android/                 # Progetto Android nativo
├── mobile-backend/          # Backend Node.js
│   ├── models/             # Modelli dati
│   ├── routes/             # API endpoints
│   ├── services/           # Logica business
│   ├── database.js         # Setup SQLite
│   └── server.js           # Express server
├── src/
│   ├── components/         # Componenti React
│   ├── services/
│   │   ├── api.js         # Client API
│   │   └── mobileBackend.js # Gestione backend mobile
│   └── main.jsx           # Entry point
├── capacitor.config.ts     # Config Capacitor
└── package.json
```

## 🔧 Configurazione

### Capacitor Config

File: `capacitor.config.ts`

```typescript
{
  appId: 'com.dartscorer.mobile',
  appName: 'Darts Scorer',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    hostname: 'localhost'
  }
}
```

### Android Config

File: `android/app/build.gradle`

- minSdk: 26
- targetSdk: 34
- Ottimizzato per Samsung S25 Ultra

## 🎮 Modalità di Gioco

1. **Training**: Modalità allenamento, accumula punteggio
2. **Standard 301**: Partenza da 301, primo a 0 vince
3. **Double Out 301**: Come Standard ma devi finire con un doppio

## 🐛 Troubleshooting

### App non si avvia

1. Verifica che tutte le dipendenze siano installate
2. Controlla i log: `npx cap run android`
3. Pulisci build: `cd android && ./gradlew clean`

### Backend non risponde

1. Verifica che il server sia avviato
2. Controlla i permessi in AndroidManifest.xml
3. Verifica la porta 8080 sia libera

### Database non persiste

1. Verifica permessi di scrittura
2. Controlla Directory.Data in Capacitor
3. Verifica spazio disponibile sul dispositivo

## 📱 Ottimizzazioni Samsung S25 Ultra

- Display: 6.9" QHD+ (3120 x 1440)
- Safe area insets per notch
- Touch targets: minimo 48dp
- Orientamento: portrait/landscape
- Keep screen on durante il gioco

## 🔐 Permessi Android

Richiesti in `AndroidManifest.xml`:

- `INTERNET`: Per comunicazione localhost
- `WRITE_EXTERNAL_STORAGE`: Per database
- `READ_EXTERNAL_STORAGE`: Per backup

## 📦 Build Release

### Genera APK Firmato

1. Crea keystore:
```bash
keytool -genkey -v -keystore darts-scorer.keystore -alias darts-scorer -keyalg RSA -keysize 2048 -validity 10000
```

2. Configura in `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('darts-scorer.keystore')
        storePassword 'your-password'
        keyAlias 'darts-scorer'
        keyPassword 'your-password'
    }
}
```

3. Build:
```bash
cd android
./gradlew assembleRelease
```

APK in: `android/app/build/outputs/apk/release/`

## 🎨 Personalizzazione

### Icona App

Sostituisci le icone in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Splash Screen

Modifica:
- `android/app/src/main/res/drawable/splash.png`

### Colori

Modifica `capacitor.config.ts`:
```typescript
plugins: {
  SplashScreen: {
    backgroundColor: '#1a1a1a'
  },
  StatusBar: {
    backgroundColor: '#1a1a1a'
  }
}
```

## 📊 Performance

- Avvio app: < 2s
- Risposta UI: < 100ms
- Database query: < 50ms
- Build size: ~15MB

## 🔄 Aggiornamenti

Per aggiornare l'app:

1. Modifica il codice
2. Incrementa `versionCode` in `build.gradle`
3. Build nuovo APK
4. Installa sul dispositivo (sovrascrive la vecchia versione)

## 📚 Risorse

- [Capacitor Docs](https://capacitorjs.com/docs)
- [React Docs](https://react.dev/)
- [Android Developer](https://developer.android.com/)

## 🤝 Supporto

Per problemi o domande, consulta:
- `MOBILE_APP_GUIDE.md` per guida dettagliata
- Log Android: `adb logcat`
- Log Capacitor: Chrome DevTools

## 📝 Note

- App completamente offline
- Nessun server esterno richiesto
- Dati salvati localmente sul dispositivo
- Ottimizzata per uso personale

---

Buon divertimento! 🎯