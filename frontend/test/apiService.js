// Importamos la URL base y las credenciales desde api.js
import { API_URL, API_HEADERS } from "/frontend/services/api.js"; 

/**
 * Busca hoteles reales utilizando la API de Booking.com
 * @param {string} destino - El nombre de la ciudad o destino (Por defecto: "Miami")
 * @returns {Promise<Object>} - La respuesta de la API con el listado de hoteles
 */
export async function buscarPropiedades(destino = "Miami") {
  
  // Construimos la URL final inyectando el destino dinámicamente y configurando idioma y moneda
  const urlFinal = `${API_URL}?name=${encodeURIComponent(destino)}&locale=es&currency=USD`;
  
  const options = {
    method: 'GET',
    headers: API_HEADERS
  };

  try {
    const response = await fetch(urlFinal, options);
    
    if (!response.ok) {
      throw new Error(`Error en la respuesta del servidor de Booking: ${response.status}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Error crítico en buscarPropiedades (Booking):", error);
    throw error; // Re-lanzamos el error para que resultados.js sepa que falló
  }
}