import requests
import json
import time

API_KEY = "AIzaSyCMgq9luSDv14b4SlNaajhFJdyJrpKGwUM"  # Reemplaza con tu clave de API de Google Places
LOCATION = "20.5235,-100.8126"
RADIUS = 5000
TIPOS = {
    "lugares_turisticos": "tourist_attraction",
    "restaurantes": "restaurant",
    "hoteles": "lodging",
    "museos": "museum",
    "transporte_publico": "transit_station",
    "que_hacer": "point_of_interest"
}
NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

def obtener_reviews(place_id):
    params = {
        "place_id": place_id,
        "fields": "reviews",
        "key": API_KEY
    }
    response = requests.get(DETAILS_URL, params=params)
    data = response.json()
    reviews = data.get("result", {}).get("reviews", [])
    return [
        {
            "text": review.get("text", "Sin comentario"),
            "rating": review.get("rating", "N/A")
        }
        for review in reviews
    ]

def obtener_lugares(tipo):
    lugares = []
    params = {
        "location": LOCATION,
        "radius": RADIUS,
        "type": tipo,
        "key": API_KEY
    }
    next_page_token = None

    while True:
        if next_page_token:
            params["pagetoken"] = next_page_token
        response = requests.get(NEARBY_URL, params=params)
        data = response.json()

        for lugar in data.get("results", []):
            geometry = lugar.get("geometry", {}).get("location", {})
            nombre = lugar.get("name")
            calificacion = lugar.get("rating", "Sin calificación")
            descripcion = ", ".join(lugar.get("types", []))
            lat = geometry.get("lat")
            lng = geometry.get("lng")
            place_id = lugar.get("place_id")

            # Obtener reseñas para este lugar
            reviews = obtener_reviews(place_id) if place_id else []

            lugares.append({
                "nombre": nombre,
                "calificacion": calificacion,
                "descripcion": descripcion,
                "lat": lat,
                "lng": lng,
                "reviews": reviews  # Agregar reseñas a los datos del lugar
            })

        next_page_token = data.get("next_page_token")
        if not next_page_token:
            break
        time.sleep(2)  # Retraso para manejar límites de tasa de la API

    return lugares

# Guardar cada tipo en su archivo correspondiente
for nombre_archivo, tipo_lugar in TIPOS.items():
    datos = obtener_lugares(tipo_lugar)
    with open(f"{nombre_archivo}.json", "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)
    print(f"Se guardaron los datos en {nombre_archivo}.json")