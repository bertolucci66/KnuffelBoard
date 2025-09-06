# KnuffelBoard – Startanleitung

Diese Anleitung beschreibt, wie du das Backend (Express + SQLite) und das Frontend (Angular) lokal startest.

## Voraussetzungen
- Node.js 18+ (empfohlen LTS) und npm
- Betriebssystem: macOS, Linux oder Windows

Prüfe die Versionen:
- macOS/Linux/Windows PowerShell: `node -v` und `npm -v`

## Projektstruktur (relevant)
```
KnuffelBoard/
├─ backend/    # Express + SQLite API (Port 3000)
└─ frontend/   # Angular 18 App (Port 4200)
```

## 1) Backend starten (Express + SQLite)

1. Abhängigkeiten installieren
   - macOS/Linux/PowerShell:
     ```bash
     cd backend
     npm install
     ```
2. Entwicklungsstart (mit automatischem Neustart via nodemon)
   ```bash
   npm run dev
   ```
   Alternativ ohne nodemon:
   ```bash
   npm start
   ```

3. URL & Healthcheck
   - API läuft unter: http://localhost:3000
   - Healthcheck: http://localhost:3000/api/health → `{ ok: true }`

4. Datenbank
   - SQLite-Datei wird automatisch erstellt: `backend/knuffelboard.db`

Hinweis: Der Backend-Port ist per `PORT`-Umgebungsvariable änderbar, Standard ist `3000`.

## 2) Frontend starten (Angular 18)

1. Abhängigkeiten installieren
   ```bash
   cd frontend
   npm install
   ```
2. Starten des Dev-Servers
   ```bash
   npm start
   ```
   - Öffnet automatisch den Browser: http://localhost:4200

3. Proxy zur API
   - Der Angular-Dev-Server proxyt Aufrufe auf `/api` an http://localhost:3000 (siehe `frontend/proxy.conf.json`).
   - Das Backend muss daher parallel laufen.

## Typischer Ablauf (zwei Terminals)

Terminal A (Backend):
```bash
cd backend
npm run dev
```

Terminal B (Frontend):
```bash
cd frontend
npm start
```

Dann im Browser: http://localhost:4200

## Troubleshooting

- Port 3000 schon belegt (Backend):
  - Finde Prozess und beende ihn oder starte Backend auf einem anderen Port:
    ```bash
    PORT=3100 npm start
    ```
  - Passe für abweichenden Port die Datei `frontend/proxy.conf.json` entsprechend an (z. B. `http://localhost:3100`) und starte das Frontend neu.

- Port 4200 schon belegt (Frontend):
  - Angular fragt nach einem alternativen Port oder verwende
    ```bash
    npx ng serve --port 4300 --open --proxy-config proxy.conf.json
    ```

- API nicht erreichbar aus dem Frontend:
  - Prüfe, ob das Backend läuft: http://localhost:3000/api/health
  - Prüfe Proxy-Datei: `frontend/proxy.conf.json`
  - Starte Frontend neu, nachdem Proxy geändert wurde.

- Datenbank „resetten“:
  - Backend stoppen, Datei `backend/knuffelboard.db` sichern/löschen, Backend neu starten (Tabellen werden automatisch neu angelegt).

## Nützliche Befehle
- Backend in Produktion ohne Auto-Reload: `npm start` (im Ordner `backend`)
- Frontend Build (Production): `npm run build` (im Ordner `frontend`), Ausgabe unter `frontend/dist/knuffelboard`

## Produktion: Frontend über Backend ausliefern
Ab sofort kann der produzierte Frontend‑Build direkt vom Backend unter `/` ausgeliefert werden.

Schritte:
1. Frontend bauen
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Backend starten (liefert API unter `/api` und das Frontend unter `/`)
   ```bash
   cd ../backend
   npm install
   npm start
   ```
3. Im Browser öffnen: `http://localhost:3000`

Hinweise:
- SPA‑Fallback ist aktiv: Nicht‑API‑Routen werden auf `index.html` gemappt.
- API‑Routen bleiben unter `/api/...` erreichbar.
- Der Pfad zum Build wird erwartet unter `frontend/dist/knuffelboard` (Angular Standard in diesem Projekt).

Viel Spaß mit KnuffelBoard! 🎲
