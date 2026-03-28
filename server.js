const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;
const distPath = path.join(__dirname, 'www');
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';

app.get('/env-config.js', (_req, res) => {
  res.type('application/javascript');
  res.send(`window.__env = ${JSON.stringify({ apiBaseUrl })};`);
});

app.use(express.static(distPath, { index: false }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`TMS UI listening on port ${port}`);
});
