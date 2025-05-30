document.addEventListener('DOMContentLoaded', async () => {
  const lista = document.getElementById('lista-restaurantes');

  const coordenadasRestaurantes = {
  "beef capital": [20.5240, -100.8140],
  "la casa de la paella": [20.5261, -100.8150],
  "cafe catedral": [20.5229, -100.8134],
  "trapio restaurante": [20.5237, -100.8121],
  "cafe bar 500 noches": [20.5215, -100.8122] // ya estaba
};


  const mapa = L.map('mapa-restaurantes').setView([20.5233, -100.8149], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);

  try {
    const res = await fetch('/api/restaurantes');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      lista.innerHTML = '<p>No hay restaurantes disponibles</p>';
      return;
    }

    console.log("🧪 Restaurantes recibidos:", data);

    data.forEach(rest => {
      const div = document.createElement('div');
      div.classList.add('restaurante-item');
      div.innerHTML = `
        <h3>${rest.nombre}</h3>
        <p><strong>Calificación:</strong> ${rest.calificacion}</p>
        <p><strong>Descripción:</strong> ${rest.descripcion}</p>
        <p><strong>Ubicación:</strong> ${rest.ubicacion}</p>
      `;
      lista.appendChild(div);

      const nombreNormalizado = rest.nombre.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

      console.log(`🔍 Buscando coords para: "${rest.nombre}" → "${nombreNormalizado}"`);

      const coords = coordenadasRestaurantes[nombreNormalizado];
      if (coords) {
        console.log(`✅ Coordenadas encontradas para ${rest.nombre}:`, coords);
        L.marker(coords).addTo(mapa)
          .bindPopup(`<strong>${rest.nombre}</strong><br>${rest.ubicacion}`);
      } else {
        console.warn(`⚠️ Coordenadas NO encontradas para: "${nombreNormalizado}"`);
      }
    });
  } catch (error) {
    lista.innerHTML = `<p style="color:red;">Error cargando restaurantes</p>`;
    console.error('❌ Error:', error);
  }
});
