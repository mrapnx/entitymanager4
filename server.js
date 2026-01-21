
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const XML_PATH = path.join(__dirname, 'data.xml');

// Ensure data.xml exists
if (!fs.existsSync(XML_PATH)) {
  const initialXml = '<?xml version="1.0" encoding="UTF-8"?>\n<DataManager>\n  <Types></Types>\n  <Entities></Entities>\n</DataManager>';
  fs.writeFileSync(XML_PATH, initialXml);
}

app.get('/api/data', (req, res) => {
  try {
    const xml = fs.readFileSync(XML_PATH, 'utf8');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Fehler beim Lesen der XML-Datei');
  }
});

app.post('/api/data', (req, res) => {
  try {
    const { xml } = req.body;
    fs.writeFileSync(XML_PATH, xml);
    res.send({ status: 'success' });
  } catch (err) {
    res.status(500).send('Fehler beim Speichern der XML-Datei');
  }
});

// For SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Dynamic Entity Manager backend running at http://localhost:${port}`);
});
