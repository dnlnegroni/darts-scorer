# 📱 Guida Completa: Darts Scorer Mobile App

## 🎯 Panoramica

Questa guida ti aiuterà a completare l'implementazione dell'app mobile Darts Scorer per il tuo Samsung S25 Ultra, con backend Node.js embedded completamente offline.

## 📋 Stato Attuale dell'Implementazione

### ✅ Completato

1. **Backend Node.js + Express + SQLite**
   - Tutti i modelli (Game, Player, Turn, Throw)
   - Servizi di gioco con logica completa
   - API REST compatibili con il frontend
   - Database SQLite embedded

2. **Integrazione Capacitor**
   - Configurazione base
   - Plugin installati (App, Filesystem, Haptics, StatusBar, SplashScreen)
   - Piattaforma Android aggiunta

3. **Adattamenti Mobile**
   - CSS ottimizzato per touch
   - Safe area insets per notch
   - Responsive design
   - Servizio backend mobile

### 🔄 Da Completare

1. **Plugin Nativo Android per Node.js**
2. **Configurazione Android avanzata**
3. **Build e test**
4. **Deployment su dispositivo**

---

## 🚀 Prossimi Passi

### Fase 1: Creare Plugin Nativo Android per Node.js

Per far girare Node.js nell'app Android, hai **due opzioni**:

#### Opzione A: Usare nodejs-mobile (Consigliato)

```bash
cd darts-scorer-frontend
npm install nodejs-mobile-react-native
```

Poi crea un bridge nativo Android che:
1. Avvia il server Node.js all'avvio dell'app
2. Copia il backend nella directory dell'app
3. Gestisce il lifecycle (start/stop)

#### Opzione B: Soluzione Semplificata (Per Test Rapidi)

Invece di Node.js embedded, usa una soluzione più semplice:

1. **Converti il backend in un servizio JavaScript puro**
   - Usa `sql.js` (SQLite in WebAssembly) invece di better-sqlite3
   - Esegui tutto nel contesto JavaScript di Capacitor
   - Nessun server HTTP, chiamate dirette

2. **Vantaggi**:
   - Più semplice da implementare
   - Nessun plugin nativo necessario
   - Funziona immediatamente

3. **Svantaggi**:
   - Meno performante per grandi dataset
   - Architettura diversa dall'originale

### Fase 2: Configurare AndroidManifest.xml

Modifica `darts-scorer-frontend/android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permessi -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:screenOrientation="portrait"
            android:keepScreenOn="true"
            android:exported="true">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### Fase 3: Ottimizzazioni per Samsung S25 Ultra

Modifica `darts-scorer-frontend/android/app/build.gradle`:

```gradle
android {
    namespace "com.dartscorer.mobile"
    compileSdk 34
    
    defaultConfig {
        applicationId "com.dartscorer.mobile"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        
        // Ottimizzazioni per S25 Ultra
        resConfigs "it", "en"
        vectorDrawables.useSupportLibrary = true
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            
            // Firma APK (opzionale per uso personale)
            // signingConfig signingConfigs.release
        }
        debug {
            debuggable true
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

### Fase 4: Build dell'App

```bash
cd darts-scorer-frontend

# 1. Build del frontend
npm run build

# 2. Sincronizza con Capacitor
npx cap sync android

# 3. Apri in Android Studio
npx cap open android
```

In Android Studio:
1. Attendi che Gradle finisca il sync
2. Collega il Samsung S25 Ultra via USB
3. Abilita "Debug USB" sul telefono
4. Clicca su "Run" (▶️)

### Fase 5: Build APK per Installazione

In Android Studio:
1. `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. Attendi il completamento
3. Trova l'APK in: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Trasferisci sul telefono e installa

---

## 🔧 Soluzione Alternativa Semplificata

Se vuoi una soluzione più rapida senza Node.js embedded:

### 1. Installa sql.js

```bash
cd darts-scorer-frontend
npm install sql.js
```

### 2. Crea un nuovo servizio database locale

Crea `src/services/localDatabase.js`:

```javascript
import initSqlJs from 'sql.js';
import { Filesystem, Directory } from '@capacitor/filesystem';

class LocalDatabase {
  constructor() {
    this.db = null;
    this.SQL = null;
  }

  async initialize() {
    // Inizializza sql.js
    this.SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    // Carica o crea database
    try {
      const savedDb = await this.loadDatabase();
      if (savedDb) {
        this.db = new this.SQL.Database(savedDb);
      } else {
        this.db = new this.SQL.Database();
        this.createTables();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.db = new this.SQL.Database();
      this.createTables();
    }
  }

  createTables() {
    // Crea le tabelle (copia da database.js)
    this.db.run(`CREATE TABLE IF NOT EXISTS player (...)`);
    // ... altre tabelle
  }

  async saveDatabase() {
    const data = this.db.export();
    const base64 = btoa(String.fromCharCode(...data));
    
    await Filesystem.writeFile({
      path: 'darts-scorer.db',
      data: base64,
      directory: Directory.Data
    });
  }

  async loadDatabase() {
    try {
      const result = await Filesystem.readFile({
        path: 'darts-scorer.db',
        directory: Directory.Data
      });
      
      const binary = atob(result.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch {
      return null;
    }
  }

  // Metodi per query...
  query(sql, params = []) {
    return this.db.exec(sql, params);
  }

  run(sql, params = []) {
    this.db.run(sql, params);
    this.saveDatabase(); // Auto-save
  }
}

export default new LocalDatabase();
```

### 3. Adatta i servizi per usare il database locale

Modifica i servizi per usare `localDatabase` invece delle chiamate HTTP.

---

## 📱 Configurazione Samsung S25 Ultra

### Abilita Modalità Sviluppatore

1. `Impostazioni` → `Informazioni sul telefono`
2. Tocca 7 volte su "Numero build"
3. Torna indietro → `Opzioni sviluppatore`
4. Abilita "Debug USB"
5. Abilita "Installa app sconosciute" (per APK)

### Ottimizzazioni Display

L'app è ottimizzata per:
- Display: 6.9" QHD+ (3120 x 1440)
- Aspect Ratio: 19.3:9
- Densità: ~501 ppi

---

## 🧪 Testing

### Test in Browser (Sviluppo)

```bash
cd darts-scorer-frontend
npm run dev
```

Apri `http://localhost:5173`

### Test su Dispositivo

```bash
# Build e deploy
npm run build
npx cap sync android
npx cap run android
```

### Debug Remoto

1. Collega il telefono via USB
2. In Chrome: `chrome://inspect`
3. Seleziona il dispositivo
4. Clicca "inspect" sulla WebView

---

## 📦 Struttura Progetto Finale

```
darts-scorer/
├── darts-scorer-frontend/
│   ├── android/                    # Progetto Android nativo
│   ├── mobile-backend/             # Backend Node.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── database.js
│   │   ├── server.js
│   │   └── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── mobileBackend.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── capacitor.config.ts
│   └── package.json
└── MOBILE_APP_GUIDE.md
```

---

## 🐛 Troubleshooting

### Problema: Backend non si avvia

**Soluzione**: Usa l'approccio sql.js invece di Node.js embedded

### Problema: App crasha all'avvio

**Soluzione**: 
1. Controlla i log: `npx cap run android --livereload`
2. Verifica permessi in AndroidManifest.xml

### Problema: Database non persiste

**Soluzione**: Verifica i permessi di scrittura e usa Directory.Data

### Problema: UI non responsive

**Soluzione**: Controlla i CSS e le safe area insets

---

## 📚 Risorse Utili

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [sql.js Documentation](https://sql.js.org/)
- [Android Developer Guide](https://developer.android.com/)
- [React Documentation](https://react.dev/)

---

## 🎉 Prossimi Miglioramenti

1. **Backup/Restore**: Esporta/importa database
2. **Statistiche**: Grafici e analytics
3. **Multiplayer**: Sync tra dispositivi (opzionale)
4. **Temi**: Dark/Light mode
5. **Suoni**: Feedback audio per i lanci

---

## 📝 Note Finali

Questa implementazione ti fornisce una base solida per un'app completamente offline. 

**Raccomandazione**: Per la massima semplicità, usa l'approccio **sql.js** invece di Node.js embedded. È più facile da implementare e mantenere per un'app personale.

Buon divertimento con il tuo Darts Scorer! 🎯