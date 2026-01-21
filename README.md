
# Dynamic Entity Manager v4

Ein leistungsstarkes System zur Definition benutzerdefinierter Datentypen und zur Verwaltung verknüpfter Entitäten.

## Voraussetzungen

- **Node.js**: Version 18 oder höher wird empfohlen.
- **Docker**: Optional für die containerisierte Bereitstellung.

## Lokale Installation und Start

1. **Abhängigkeiten installieren**:
   Öffnen Sie Ihr Terminal im Projektverzeichnis und führen Sie folgenden Befehl aus:
   ```bash
   npm install
   ```
   *Dies installiert Express für das Backend.*

2. **Server starten**:
   Führen Sie den Server mit Node.js aus:
   ```bash
   npm start
   ```
   *Der Server ist nun unter [http://localhost:3000](http://localhost:3000) erreichbar.*

## Bereitstellung mit Docker

Diese Anwendung kann einfach als Docker-Container bereitgestellt werden:

1. **Docker-Image erstellen**:
   ```bash
   docker build -t entity-manager-v4 .
   ```

2. **Container ausführen**:
   ```bash
   docker run -d -p 3000:3000 --name entity-manager entity-manager-v4
   ```

## Funktionsweise

- **Datenmodell**: Alle Typen und Entitäten werden in der Datei `data.xml` im Hauptverzeichnis gespeichert.
- **Backend**: Ein leichtgewichtiger Express-Server (`server.js`) stellt die API für das Lesen und Schreiben der XML-Datei bereit.
- **Frontend**: Eine React-SPA mit Tailwind CSS, die direkt vom Backend ausgeliefert wird.

## Fehlerbehebung

- **SyntaxError bei perf_hooks**: Stellen Sie sicher, dass Sie Node.js v18+ verwenden. Wenn Sie den Fehler lokal erhalten, nutzen Sie Docker, da dort automatisch die korrekte Version (Node 20) verwendet wird.
- **Fehlende Module**: Führen Sie immer zuerst `npm install` aus, bevor Sie den Server mit `node server.js` oder `npm start` starten.
