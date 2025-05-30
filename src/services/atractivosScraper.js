const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const atractivoSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String
});

const Atractivo = mongoose.model('Atractivo', atractivoSchema);

(async () => {
  // Conexión a MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'TurismoApp',
    });
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err);
    return;
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const url = 'https://www.cultura.gob.mx/turismocultural/destino_mes/guanajuato/celaya.html';

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const atractivos = await page.evaluate(() => {
    const celdas = Array.from(document.querySelectorAll('td.Estilo1'));
    const datos = [];

    celdas.forEach(td => {
      const texto = td.innerText.trim();
      const partes = texto.split('\n').filter(t => t.trim() !== '');

      for (let i = 0; i < partes.length; i += 2) {
        const nombre = partes[i]?.trim();
        const descripcion = partes[i + 1]?.trim();

        if (nombre && descripcion) {
          datos.push({ nombre, descripcion });
        }
      }
    });

    return datos;
  });

  const rutaJson = './atractivos.json';

  if (atractivos.length > 0) {
    // Guardar archivo JSON local
    //fs.writeFileSync(rutaJson, JSON.stringify(atractivos, null, 2), 'utf-8');
    console.log(`📁 Archivo JSON guardado: ${rutaJson}`);
  } else {
    console.warn('⚠️ No se encontraron datos para guardar en archivo JSON.');
  }

  // Leer archivo y subir a MongoDB
  try {
    const contenido = fs.readFileSync(rutaJson, 'utf-8');
    const datosJson = JSON.parse(contenido);

    const count = await Atractivo.countDocuments();
    if (count > 0) {
      await Atractivo.deleteMany({});
      console.log(`🗑️ Colección limpiada (${count} documentos eliminados)`);
    }

    //Se insertan los datos del JSON
    await Atractivo.insertMany(datosJson);
    console.log('✅ Datos insertados en MongoDB desde JSON');
  } catch (err) {
    console.error('❌ Error al leer archivo JSON o insertar en MongoDB:', err);
  }

  await browser.close();
  mongoose.connection.close();
})();
