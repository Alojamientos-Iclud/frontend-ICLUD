// Espera a que el HTML esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    cargarAlojamientos();
});

async function cargarAlojamientos() {
    // Seleccionamos el contenedor que modificamos en el HTML
    const cardsContainer = document.getElementById("cards-container");
    
    if (!cardsContainer) return; // Validación por si estás en otra página

    try {
        // Hacemos la petición a tu API (que se conecta a tu Base de Datos)
        const response = await fetch("/api/hoteles");
        const hoteles = await response.json();

        // Limpiamos el contenedor (borra lo que haya quedado estático)
        cardsContainer.innerHTML = "";

        // Recorremos los hoteles que trajo la base de datos
        hoteles.forEach(hotel => {
            // Creamos la estructura exacta que pide tu CSS
            cardsContainer.innerHTML += `
                <div class="card">
                    <img src="${hotel.imagen_h || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200'}" alt="${hotel.nombre}">
                    <div class="card-content">
                        <h3>${hotel.nombre}</h3>
                        <p>${hotel.localizacion}</p>
                        <p><strong>Habitaciones:</strong> ${hotel.cantidad_habitaciones}</p>
                        
                        ${hotel.precio ? `<div class="price">$${hotel.precio} USD</div>` : ''}
                        ${hotel.plataforma ? `<div class="platform">Disponible en ${hotel.plataforma}</div>` : ''}
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error al cargar los alojamientos desde la base de datos:", error);
        cardsContainer.innerHTML = "<p>No se pudieron cargar los alojamientos en este momento.</p>";
    }
}