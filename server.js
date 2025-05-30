// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

// Servir archivos estáticos desde src/
app.use(express.static(path.join(__dirname, 'src')));


app.use(cors());

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

/// Modelo restaurantes
const restauranteSchema = new mongoose.Schema({
  nombre: String,
  calificacion: Number,
  descripcion: String,
  ubicacion: String,
});
const Restaurante = mongoose.model('Restaurante', restauranteSchema);

// Ruta API Restaurantes
app.get('/api/restaurantes', async (req, res) => {
  try {
    const restaurantes = await Restaurante.find().sort({ calificacion: -1 }).limit(5);
    res.json(restaurantes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




//Historicos
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'TurismoApp',
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error:', err));

const atractivoSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  fechaCarga: Date
});

const Atractivo = mongoose.model('Atractivo', atractivoSchema);

// Ruta API para obtener atractivos
app.get('/api/atractivos', async (req, res) => {
  const datos = await Atractivo.find().limit(5); // Top 5
  res.json(datos);
});

//Modelo parques
const parqueSchema = new mongoose.Schema({
  nombre: String,
  ubicacion: String,
  descripcion: String,
  fechaCarga: Date
});

const Parque = mongoose.model('Parque', parqueSchema);

// Ruta para obtener los parques
app.get('/api/parques', async (req, res) => {
  try {
    const parques = await Parque.find().limit(5); // top 5
    res.json(parques);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});