// server.js
const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos desde src/
app.use(express.static(path.join(__dirname, 'src')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});