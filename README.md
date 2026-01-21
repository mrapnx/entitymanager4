
# Dynamic Entity Manager v4 (Python/Flask)

Ein leistungsstarkes System zur Definition benutzerdefinierter Datentypen und zur Verwaltung verknüpfter Entitäten.

## Voraussetzungen

- **Python**: Version 3.9 oder höher.
- **Docker**: Optional für die containerisierte Bereitstellung.

## Lokale Installation und Start

1. **Abhängigkeiten installieren**:
   Erstellen Sie optional eine virtuelle Umgebung und installieren Sie die Pakete:
   ```bash
   pip install -r requirements.txt
   ```

2. **Server starten**:
   Führen Sie die Python-App aus:
   ```bash
   python app.py
   ```
   *Der Server ist nun unter [http://localhost:3000](http://localhost:3000) erreichbar.*

## Bereitstellung mit Docker

Diese Anwendung kann einfach als Docker-Container bereitgestellt werden:

1. **Docker-Image erstellen**:
   ```bash
   docker build -t entity-manager-py .
   ```

2. **Container ausführen**:
   ```bash
   docker run -d -p 3000:3000 --name entity-manager entity-manager-py
   ```

## Funktionsweise

- **Backend**: Ein Flask-Server (`app.py`), der die API für das XML-Handling bereitstellt und das Frontend ausliefert.
- **Datenmodell**: Alle Typen und Entitäten werden in der Datei `data.xml` im Hauptverzeichnis gespeichert.
- **Frontend**: Eine moderne React-SPA mit Tailwind CSS, die direkt im Browser via ESM/Importmaps gerendert wird.

## Fehlerbehebung

- **Berechtigungsprobleme**: Stellen Sie sicher, dass der Prozess Schreibrechte im Anwendungsverzeichnis hat, um die `data.xml` zu aktualisieren.
- **Modul nicht gefunden**: Führen Sie `pip install -r requirements.txt` aus.
