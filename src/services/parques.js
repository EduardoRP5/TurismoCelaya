document.addEventListener('DOMContentLoaded', async () => {
  // Coordenadas manuales por nombre normalizado (sin tildes y en minúsculas)
  const coordenadasParques = {
    "parque almeda": [20.5237, -100.8110],
    "parque xochipili 1ra seccion": [20.5250, -100.8165],
    "jardin principal": [20.5230, -100.8140],
    "parque ximhai": [20.5260, -100.8125],
    "parque fundadores": [20.5245, -100.8150]
  };

  try {
    const res = await fetch('/api/parques');
    const parques = await res.json();

    const lista = document.getElementById('lista-parques');

    const mapa = L.map('mapa-parques').setView([20.5233, -100.8149], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapa);

    parques.forEach(parque => {
      const item = document.createElement('div');
      item.classList.add('parque-item');
      item.innerHTML = `
        <h3>${parque.nombre}</h3>
        <p><strong>Ubicación:</strong> ${parque.ubicacion}</p>
        <p>${parque.descripcion}</p>
      `;
      lista.appendChild(item);

      // Normalizar nombre para buscar coordenadas
      const nombreNorm = parque.nombre.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

      const coords = coordenadasParques[nombreNorm];

      if (coords) {
        L.marker(coords)
          .addTo(mapa)
          .bindPopup(`<strong>${parque.nombre}</strong><br>${parque.descripcion}`);
      } else {
        console.warn(`⚠️ Coordenadas no encontradas para: ${parque.nombre}`);
      }
    });
  } catch (err) {
    console.error('Error cargando los parques:', err);
    const lista = document.getElementById('lista-parques');
    lista.innerHTML = '<p>Error al cargar los parques.</p>';
  }
});
