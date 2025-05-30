const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config();

// Esquema de parque
const parqueSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  calificacion: Number,
  ubicacion: String,
});

const Parque = mongoose.model('Parque', parqueSchema);

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'TurismoApp',
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err);
  process.exit(1);
});

// Leer archivo Excel
const filePath = path.join(__dirname, '../ArchivosInfo/InfoParques.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// Transformar y guardar en MongoDB
async function importar() {
  try {
    await Parque.deleteMany(); // Limpiar si ya hay datos previos
    const parques = data.map(p => ({
      nombre: p.Nombre,
      descripcion: p.Descripcion,
      calificacion: parseFloat(p['Calificación']),
      ubicacion: p.Ubicación,
    }));
    await Parque.insertMany(parques);
    console.log('✅ Datos importados exitosamente.');
  } catch (error) {
    console.error('❌ Error al importar:', error);
  } finally {
    mongoose.connection.close();
  }
}

importar();
