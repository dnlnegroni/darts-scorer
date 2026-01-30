# 🔨 Guida Build Locale - Darts Scorer Mobile

Guida rapida per buildare l'app mobile Android in locale.

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Java JDK 17+** - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Git** (opzionale) - [Download](https://git-scm.com/)

### Verifica Installazione

```bash
node --version    # Deve essere >= 18
npm --version     # Deve essere >= 9
java -version     # Deve essere >= 17
```

## 🚀 Build Rapido (Comando Unico)

Dalla directory `darts-scorer-frontend`:

```bash
npm run build && npx cap sync android && cd android && ./gradlew assembleDebug
```

✅ L'APK sarà in: `android/app/build/outputs/apk/debug/app-debug.apk`

## 📝 Build Step-by-Step

### 1. Installa Dipendenze (Prima Volta)

```bash
# Dalla directory darts-scorer-frontend
npm install

# Installa dipendenze backend mobile
cd mobile-backend
npm install
cd ..
```

### 2. Build Frontend

```bash
npm run build
```

Questo comando:
- Compila il codice React con Vite
- Ottimizza gli asset per produzione
- Genera i file nella cartella `dist/`

### 3. Sincronizza con Capacitor

```bash
npx cap sync android
```

Questo comando:
- Copia i file web in `android/app/src/main/assets/public/`
- Aggiorna i plugin Capacitor
- Sincronizza la configurazione

### 4. Build APK con Gradle

```bash
cd android
./gradlew assembleDebug
```

Questo comando:
- Compila il progetto Android
- Genera l'APK debug
- Salva l'APK in `app/build/outputs/apk/debug/`

**Tempo stimato**: 2-5 minuti (prima volta può richiedere più tempo per scaricare dipendenze)

## 📱 Installazione su Dispositivo

### Metodo 1: ADB (Android Debug Bridge)

```bash
# Collega il dispositivo via USB e abilita Debug USB
adb devices

# Installa l'APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Metodo 2: Android Studio

```bash
# Apri il progetto in Android Studio
npx cap open android

# Poi clicca su Run (▶️) per installare e debuggare
```

### Metodo 3: Trasferimento Manuale

1. Copia `app-debug.apk` sul dispositivo
2. Apri il file sul dispositivo
3. Conferma l'installazione (potrebbe richiedere permessi per "Origini sconosciute")

## 🔄 Workflow di Sviluppo

### Dopo Modifiche al Codice

```bash
# 1. Rebuild frontend
npm run build

# 2. Sync con Android
npx cap sync android

# 3. Rebuild APK
cd android && ./gradlew assembleDebug
```

### Test Rapido in Browser

```bash
npm run dev
# Apri http://localhost:5173
```

## 🎯 Comandi NPM Utili

```bash
# Sviluppo
npm run dev                    # Dev server (browser)
npm run build                  # Build produzione
npm run preview                # Preview build locale

# Mobile - Build
npm run mobile:sync            # Build + sync Capacitor
npm run mobile:build           # Build + sync + APK debug
npm run mobile:release         # Build + sync + APK release

# Mobile - Deploy
npm run mobile:open            # Apri Android Studio
npm run mobile:run             # Build + sync + run su dispositivo

# Backend
npm run backend:dev            # Avvia backend standalone
npm run backend:install        # Installa dipendenze backend
```

## 🐛 Troubleshooting

### Errore: "JAVA_HOME not set"

```bash
# macOS/Linux
export JAVA_HOME=$(/usr/libexec/java_home)

# Windows
set JAVA_HOME=C:\Program Files\Java\jdk-17
```

### Errore: "SDK location not found"

Crea il file `android/local.properties`:

```properties
sdk.dir=/Users/TUONOME/Library/Android/sdk
```

### Errore: "Gradle build failed"

```bash
# Pulisci la build
cd android
./gradlew clean

# Riprova
./gradlew assembleDebug
```

### Errore: "Device not found"

```bash
# Verifica dispositivi connessi
adb devices

# Riavvia ADB server
adb kill-server
adb start-server
```

## 📦 Build Release (Produzione)

### 1. Genera Keystore (Prima Volta)

```bash
keytool -genkey -v -keystore darts-scorer.keystore \
  -alias darts-scorer \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 2. Configura Signing

Crea `android/keystore.properties`:

```properties
storePassword=TUA_PASSWORD
keyPassword=TUA_PASSWORD
keyAlias=darts-scorer
storeFile=../darts-scorer.keystore
```

### 3. Build Release

```bash
npm run mobile:release
```

L'APK firmato sarà in: `android/app/build/outputs/apk/release/app-release.apk`

## 📊 Dimensioni Build

- **APK Debug**: ~15-20 MB
- **APK Release**: ~10-15 MB (ottimizzato)

## 🔐 Sicurezza

⚠️ **NON committare mai**:
- `keystore.properties`
- `*.keystore`
- Password o chiavi private

Aggiungi al `.gitignore`:

```
android/keystore.properties
*.keystore
```

## 📚 Risorse Utili

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Gradle Build Tool](https://gradle.org/guides/)

## 💡 Tips

1. **Prima build lenta?** È normale, Gradle scarica dipendenze
2. **Spazio disco**: Assicurati di avere almeno 5GB liberi
3. **RAM**: Consigliati almeno 8GB per build veloci
4. **Cache Gradle**: In `~/.gradle/caches` (può crescere, pulisci periodicamente)

---

**Ultima modifica**: 30 Gennaio 2026
**Versione App**: 1.0.0