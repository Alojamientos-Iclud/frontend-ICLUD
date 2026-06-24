import { buscarPropiedades } from "../test/apiService.js"; // Asegura la ruta a tu apiService

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const destinoBuscado = params.get("location") || "Miami";

    const titulo = document.getElementById("titulo-busqueda");
    if (titulo) titulo.innerText = `Hoteles reales en: ${destinoBuscado}`;

    cargarResultadosBooking(destinoBuscado);
});

async function cargarResultadosBooking(destino) {
    const contenedor = document.getElementById("resultados-container");
    if (!contenedor) return;

    contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666;'>Buscando hoteles reales en Booking... 🏨📡</p>";

    try {
        // Llamamos a la API real con el destino que puso el usuario
        const resultado = await buscarPropiedades(destino);
        
        // En Booking, los hoteles suelen venir en resultado.data.hotels o resultado.results
        const hoteles = resultado.data?.hotels || resultado.results;

        contenedor.innerHTML = "";

        if (!hoteles || hoteles.length === 0) {
            contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>No se encontraron hoteles reales en Booking para este destino.</p>";
            return;
        }

        hoteles.forEach(hotel => {
            const card = document.createElement("div");
            card.className = "card";

            // Estructura típica de Booking: hotel_name, max_photo_url, review_score
            const nombre = hotel.hotel_name || "Hotel Real";
            const imagenUrl = hotel.max_photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200';
            
            // Booking suele mandar el precio en un objeto de precios o directo
            const precio = hotel.price_breakdown?.gross_amount_per_night 
                           ? `$${Math.round(hotel.price_breakdown.gross_amount_per_night)} USD` 
                           : "Consultar precio";
            
            const puntuacion = hotel.review_score || "8.5";

            card.innerHTML = `
                <img src="${imagenUrl}" alt="${nombre}">
                <div class="card-content">
                    <h3>${nombre}</h3>
                    <p>📍 ${destino}</p>
                    <p>⭐ Puntuación: ${puntuacion}</p>
                    <p class="hotel-desc">Verificado por Booking.com</p>
                    <div class="price" style="margin-top: 10px; font-weight: bold; color: #635bff;">${precio} / noche</div>
                    <button class="btn-reservar" style="margin-top: 10px; width: 100%; background: #1a1a2e; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
                        Reservar ahora
                    </button>
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar Booking:", error);
        contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error al conectar con el servidor de Booking.</p>`;
    }
}