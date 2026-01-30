#!/bin/bash

# Script per build e deployment dell'app mobile Darts Scorer
# Uso: ./build-mobile.sh [dev|build|deploy|release]

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Darts Scorer Mobile - Build Script${NC}"
echo ""

# Funzione per stampare messaggi
print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verifica prerequisiti
check_prerequisites() {
    print_step "Verifica prerequisiti..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js non trovato. Installalo da https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm non trovato."
        exit 1
    fi
    
    echo "✓ Node.js $(node --version)"
    echo "✓ npm $(npm --version)"
}

# Installa dipendenze
install_deps() {
    print_step "Installazione dipendenze..."
    
    # Frontend
    npm install
    
    # Backend
    cd mobile-backend
    npm install
    cd ..
    
    echo "✓ Dipendenze installate"
}

# Build frontend
build_frontend() {
    print_step "Build frontend..."
    npm run build
    echo "✓ Frontend compilato"
}

# Sincronizza con Capacitor
sync_capacitor() {
    print_step "Sincronizzazione Capacitor..."
    npx cap sync android
    echo "✓ Capacitor sincronizzato"
}

# Apri Android Studio
open_android_studio() {
    print_step "Apertura Android Studio..."
    npx cap open android
}

# Build APK debug
build_debug_apk() {
    print_step "Build APK debug..."
    cd android
    ./gradlew assembleDebug
    cd ..
    
    APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        echo "✓ APK creato: $APK_PATH"
        echo ""
        echo "Per installare sul dispositivo:"
        echo "  adb install $APK_PATH"
    else
        print_error "APK non trovato"
        exit 1
    fi
}

# Build APK release
build_release_apk() {
    print_step "Build APK release..."
    
    if [ ! -f "android/app/darts-scorer.keystore" ]; then
        print_error "Keystore non trovato. Crealo prima con:"
        echo "  keytool -genkey -v -keystore android/app/darts-scorer.keystore -alias darts-scorer -keyalg RSA -keysize 2048 -validity 10000"
        exit 1
    fi
    
    cd android
    ./gradlew assembleRelease
    cd ..
    
    APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        echo "✓ APK release creato: $APK_PATH"
    else
        print_error "APK release non trovato"
        exit 1
    fi
}

# Deploy su dispositivo
deploy_to_device() {
    print_step "Deploy su dispositivo..."
    
    # Verifica dispositivo connesso
    if ! command -v adb &> /dev/null; then
        print_error "adb non trovato. Installa Android SDK Platform Tools"
        exit 1
    fi
    
    DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)
    if [ "$DEVICES" -eq 0 ]; then
        print_error "Nessun dispositivo Android connesso"
        echo "Collega il Samsung S25 Ultra via USB e abilita Debug USB"
        exit 1
    fi
    
    build_frontend
    sync_capacitor
    
    print_step "Installazione su dispositivo..."
    cd android
    ./gradlew installDebug
    cd ..
    
    echo "✓ App installata sul dispositivo"
    echo ""
    echo "Per avviare l'app:"
    echo "  adb shell am start -n com.dartscorer.mobile/.MainActivity"
}

# Test backend standalone
test_backend() {
    print_step "Test backend standalone..."
    cd mobile-backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    echo ""
    echo "Backend avviato su http://localhost:8080"
    echo "Premi Ctrl+C per fermare"
    
    wait $BACKEND_PID
}

# Modalità sviluppo
dev_mode() {
    print_step "Modalità sviluppo..."
    echo ""
    echo "Avvio server di sviluppo..."
    npm run dev
}

# Clean build
clean_build() {
    print_step "Pulizia build..."
    
    rm -rf dist
    rm -rf node_modules/.vite
    
    if [ -d "android" ]; then
        cd android
        ./gradlew clean
        cd ..
    fi
    
    echo "✓ Build pulita"
}

# Menu principale
show_menu() {
    echo ""
    echo "Seleziona un'opzione:"
    echo "  1) Installa dipendenze"
    echo "  2) Modalità sviluppo (browser)"
    echo "  3) Test backend standalone"
    echo "  4) Build e deploy su dispositivo"
    echo "  5) Build APK debug"
    echo "  6) Build APK release"
    echo "  7) Apri Android Studio"
    echo "  8) Pulisci build"
    echo "  9) Esci"
    echo ""
    read -p "Scelta: " choice
    
    case $choice in
        1) install_deps ;;
        2) dev_mode ;;
        3) test_backend ;;
        4) deploy_to_device ;;
        5) build_frontend && sync_capacitor && build_debug_apk ;;
        6) build_frontend && sync_capacitor && build_release_apk ;;
        7) open_android_studio ;;
        8) clean_build ;;
        9) exit 0 ;;
        *) print_error "Scelta non valida" ;;
    esac
}

# Main
main() {
    check_prerequisites
    
    if [ $# -eq 0 ]; then
        show_menu
    else
        case $1 in
            dev)
                dev_mode
                ;;
            build)
                build_frontend
                sync_capacitor
                build_debug_apk
                ;;
            deploy)
                deploy_to_device
                ;;
            release)
                build_frontend
                sync_capacitor
                build_release_apk
                ;;
            clean)
                clean_build
                ;;
            test-backend)
                test_backend
                ;;
            *)
                echo "Uso: $0 [dev|build|deploy|release|clean|test-backend]"
                echo ""
                echo "Opzioni:"
                echo "  dev          - Avvia server di sviluppo"
                echo "  build        - Build APK debug"
                echo "  deploy       - Build e installa su dispositivo"
                echo "  release      - Build APK release"
                echo "  clean        - Pulisci build"
                echo "  test-backend - Test backend standalone"
                echo ""
                echo "Senza argomenti mostra il menu interattivo"
                exit 1
                ;;
        esac
    fi
}

main "$@"

# Made with Bob
