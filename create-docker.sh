
#!/bin/bash

# Dieses Skript erstellt das Dockerfile für den Dynamic Entity Manager v4 (Flask 1.1.4 Version)
echo "Generiere Python 3.9-basiertes Dockerfile für Flask 1.1.4..."

cat <<EOF > Dockerfile
# Nutze Python 3.9 für optimale Kompatibilität mit Flask 1.1.4
FROM python:3.9-slim

# Arbeitsverzeichnis im Container festlegen
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Den Rest des Anwendungscodes kopieren
COPY . .

# Port 3000 exponieren
EXPOSE 3000

# Anwendung mit Python starten
CMD ["python", "app.py"]
EOF

echo "Dockerfile für Python 3.9 / Flask 1.1.4 wurde erfolgreich erstellt."
chmod +x Dockerfile
