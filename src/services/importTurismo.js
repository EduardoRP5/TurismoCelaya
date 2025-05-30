require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'TurismoApp',
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err);
  process.exit(1);
});

const db = mongoose.connection;
const excelFilePath = path.join(__dirname, '../ArchivosInfo/Turismo_Celaya_Dashboard.xlsx');

async function importExcelToMongo() {
  const workbook = xlsx.readFile(excelFilePath);

  for (const sheetName of workbook.SheetNames) {
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    if (data.length === 0) continue;

    const collectionName = sheetName.toLowerCase().replace(/\s+/g, '_');
    const Model = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));

    try {
      await Model.deleteMany({});
      await Model.insertMany(data);
      console.log(`📥 Insertados ${data.length} documentos en '${collectionName}'`);
    } catch (err) {
      console.error(`⚠️ Error insertando en '${collectionName}':`, err);
    }
  }

  await mongoose.connection.close();
  console.log('🔌 Conexión cerrada');
}

importExcelToMongo();
