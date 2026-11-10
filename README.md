# Lingo

Lingo ist eine kostenlose Sprachlern-App für das iPhone, gebaut mit Expo und React Native.

- Keine Registrierung, kein Login, keine Benutzerkonten
- Keine Abos, keine In-App-Käufe, keine Werbung, keine Premium-Version
- Alle Lektionen sind frei zugänglich
- Der Lernfortschritt wird nur lokal auf dem Gerät gespeichert
- Die App funktioniert offline und braucht keine API-Schlüssel

## Tech-Stack

Expo (SDK 54) · React Native · TypeScript · Expo Router · NativeWind · Zustand · AsyncStorage

## Projekt starten

Voraussetzung: [Node.js](https://nodejs.org/) (LTS) auf deinem Computer.

```bash
npm install
npm start
```

### Auf dem iPhone mit Expo Go (kostenlos, am einfachsten)

1. Installiere **Expo Go** aus dem App Store.
2. Starte am Computer `npm run start:go`.
3. iPhone und Computer müssen im selben WLAN sein.
4. Scanne den QR-Code mit der Kamera-App des iPhones.

Expo Go unterstützt immer nur die aktuelle Expo-SDK-Version. Meldet Expo Go,
dass das Projekt eine andere SDK-Version nutzt, muss das Projekt aktualisiert werden.

### Auf dem iPhone mit eigenem Development Build

Ein Development Build ist eine eigene Version der App mit dem Expo Dev Client.
Er wird später für Funktionen gebraucht, die Expo Go nicht enthält
(z. B. Spracherkennung für das Aussprachetraining).

- **Mit Mac und Xcode (kostenlos):** iPhone per Kabel anschließen und `npm run ios:device` ausführen.
  Eine kostenlose Apple-ID reicht. Die App läuft dann 7 Tage und muss danach neu installiert werden.
- **Mit EAS Build (ohne Mac):** `npx eas-cli build --profile development --platform ios`.
  Das braucht ein kostenpflichtiges Apple-Developer-Konto (99 $/Jahr).

Danach `npm start` ausführen und den QR-Code mit der installierten Lingo-App öffnen.

## Prüfen

```bash
npm run lint
npm run typecheck
```

## Projektstruktur

```txt
app/          Bildschirme und Routen (Expo Router)
components/   wiederverwendbare UI-Bausteine
constants/    Farben, Schriften, Bilder
data/         Sprachen, Einheiten und Lektionen
store/        Zustand-Stores mit lokaler Speicherung
types/        TypeScript-Typen
```
