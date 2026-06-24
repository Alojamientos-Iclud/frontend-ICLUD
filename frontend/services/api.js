//export const API_URL = "http://localhost:3000";

// La URL base de Booking (la dejamos limpia sin el destino, para que se lo pasemos dinámicamente)
export const API_URL = "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels";

export const API_HEADERS = {
    "Content-Type": "application/json",
    "x-rapidapi-host": "booking-com15.p.rapidapi.com",
    "x-rapidapi-key": "a10f6cd5camshf144cfd7b81f8c7p122fb9jsn40ab087c1943" // <--- Tu llave nueva activa
};