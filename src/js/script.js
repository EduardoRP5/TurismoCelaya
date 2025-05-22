// Coordenadas de Celaya (centro)
const centroCelaya = { lat: 20.5233, lng: -100.8149 };

// Puntos clave para cada ruta (coordenadas aproximadas)
const lugares = {
    gastronomica: [
        { nombre: "Cajeta La Tradicional", pos: { lat: 20.5215, lng: -100.8120 } },
        { nombre: "Mercado Morelos", pos: { lat: 20.5240, lng: -100.8175 } },
        { nombre: "Restaurante La Antigua", pos: { lat: 20.5255, lng: -100.8100 } }
    ],
    historica: [
        { nombre: "Templo del Carmen", pos: { lat: 20.5200, lng: -100.8160 } },
        { nombre: "Museo de Celaya", pos: { lat: 20.5230, lng: -100.8155 } },
        { nombre: "Plaza Principal", pos: { lat: 20.5225, lng: -100.8125 } }
    ],
    natural: [
        { nombre: "Parque Xochipilli", pos: { lat: 20.5180, lng: -100.8050 } },
        { nombre: "Jardín del Carmen", pos: { lat: 20.5205, lng: -100.8165 } },
        { nombre: "Vivero Municipal", pos: { lat: 20.5150, lng: -100.8200 } }
    ]
};

// Mostrar/ocultar mapas
function toggleMap(idMapa) {
    const mapa = document.getElementById(idMapa);
    if (mapa.style.display === "none") {
        mapa.style.display = "block";
        // Inicializar solo si no está cargado
        if (!mapa.dataset.loaded) {
            const tipoRuta = idMapa.split('-')[1];
            initMap(idMapa, tipoRuta);
            mapa.dataset.loaded = true;
        }
    } else {
        mapa.style.display = "none";
    }
}

// Inicializar todos los mapas
function inicializarMapas() {
    console.log("API de Google Maps cargada");
}

// Crear mapa específico
function initMap(idMapa, tipoRuta) {
    const mapa = new google.maps.Map(document.getElementById(idMapa), {
        zoom: 14,
        center: centroCelaya,
        mapTypeId: "terrain",
    });
    
    // Añadir marcadores y ruta
    const linePath = [];
    lugares[tipoRuta].forEach((lugar) => {
        new google.maps.Marker({
            position: lugar.pos,
            map: mapa,
            title: lugar.nombre,
        });
        linePath.push(lugar.pos);
    });
    
    // Dibujar línea de ruta
    new google.maps.Polyline({
        path: linePath,
        geodesic: true,
        strokeColor: "#3A7D44",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: mapa,
    });
}

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Manejo de comentarios
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formOpinion');
    const listaComentarios = document.getElementById('listaComentarios');
    
    // Cargar comentarios guardados
    cargarComentarios();
    
    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const comentario = document.getElementById('comentario').value;
        
        if (nombre && comentario) {
            guardarComentario(nombre, comentario);
            form.reset();
        }
    });
    
    // Guardar en localStorage
    function guardarComentario(nombre, comentario) {
        const comentarios = JSON.parse(localStorage.getItem('comentariosCelaya')) || [];
        const nuevoComentario = {
            id: Date.now(),
            nombre: nombre,
            comentario: comentario,
            fecha: new Date().toLocaleDateString('es-MX')
        };
        
        comentarios.unshift(nuevoComentario); // Agrega al inicio
        localStorage.setItem('comentariosCelaya', JSON.stringify(comentarios));
        
        cargarComentarios();
    }
    
    // Mostrar comentarios
    function cargarComentarios() {
        const comentarios = JSON.parse(localStorage.getItem('comentariosCelaya')) || [];
        listaComentarios.innerHTML = '';
        
        if (comentarios.length === 0) {
            listaComentarios.innerHTML = '<p style="text-align: center;">No hay comentarios aún. ¡Sé el primero!</p>';
            return;
        }
        
        comentarios.forEach(comentario => {
            const comentarioHTML = `
                <div style="background-color: var(--beige); padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h4 style="color: var(--verde);">${comentario.nombre}</h4>
                        <small style="color: #666;">${comentario.fecha}</small>
                    </div>
                    <p>${comentario.comentario}</p>
                </div>
            `;
            listaComentarios.innerHTML += comentarioHTML;
        });
    }
});