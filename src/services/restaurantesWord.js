const mongoose = require('mongoose');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Esquema de restaurante
const restauranteSchema = new mongoose.Schema({
  nombre: String,
  calificacion: Number,
  descripcion: String,
  ubicacion: String,
});

const Restaurante = mongoose.model('Restaurante', restauranteSchema);

// Función principal
async function importarRestaurantes() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'TurismoApp'
    });
    console.log('✅ Conectado a MongoDB');

    const filePath = path.join(__dirname, '../ArchivosInfo/Restaurantes_Celaya.docx');
    const buffer = fs.readFileSync(filePath);
    const { value } = await mammoth.extractRawText({ buffer });

    const bloques = value.split('\n\n').filter(b => b.trim() !== '');

    const restaurantes = [];
    for (let i = 1; i < bloques.length; i += 4) {
      const nombre = bloques[i]?.trim();
      const calificacionText = bloques[i + 1]?.match(/(\d+\.\d+)/);
      const descripcion = bloques[i + 2]?.replace('Descripción:', '').trim();
      const ubicacion = bloques[i + 3]?.replace('Ubicación:', '').trim();

      if (nombre && calificacionText && descripcion && ubicacion) {
        restaurantes.push({
          nombre,
          calificacion: parseFloat(calificacionText[1]),
          descripcion,
          ubicacion
        });
      }
    }

    await Restaurante.deleteMany();
    await Restaurante.insertMany(restaurantes);
    console.log(`✅ Se insertaron ${restaurantes.length} restaurantes en MongoDB`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

importarRestaurantes();
