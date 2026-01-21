
#!/bin/bash

# Dieses Skript erstellt das Dockerfile für den Dynamic Entity Manager v4 (Python Version)
echo "Generiere Python-basiertes Dockerfile..."

cat <<EOF > Dockerfile
# Nutze ein offizielles Python-Runtime-Image
FROM python:3.11-slim

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

echo "Dockerfile für Python wurde erfolgreich erstellt."
chmod +x Dockerfile
