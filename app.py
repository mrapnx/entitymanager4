
from flask import Flask, request, send_from_directory, jsonify
import os

app = Flask(__name__, static_folder='.', static_url_path='')

XML_PATH = 'data.xml'

# Sicherstellen, dass die data.xml existiert
if not os.path.exists(XML_PATH):
    initial_xml = '<?xml version="1.0" encoding="UTF-8"?>\n<DataManager>\n  <Types></Types>\n  <Entities></Entities>\n</DataManager>'
    with open(XML_PATH, 'w', encoding='utf-8') as f:
        f.write(initial_xml)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        with open(XML_PATH, 'r', encoding='utf-8') as f:
            xml_content = f.read()
        return xml_content, 200, {'Content-Type': 'application/xml'}
    except Exception as e:
        return str(e), 500

@app.route('/api/data', methods=['POST'])
def save_data():
    try:
        data = request.get_json()
        if not data:
            return "Keine JSON-Daten empfangen", 400
            
        xml_content = data.get('xml')
        if not xml_content:
            return "Kein XML-Inhalt empfangen", 400
        
        with open(XML_PATH, 'w', encoding='utf-8') as f:
            f.write(xml_content)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return str(e), 500

# Route für statische Dateien (tsx, ts, json etc.)
@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    # Flask 1.1.4 unterstützt host und port Parameter in run()
    app.run(host='0.0.0.0', port=3000, debug=False)
