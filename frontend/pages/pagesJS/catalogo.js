document.addEventListener("DOMContentLoaded", () => {
    cargarCatalogoCompleto();
});

async function cargarCatalogoCompleto() {
    const cardsContainer = document.getElementById("cards-container");
    if (!cardsContainer) return; 

    cardsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666;'>Cargando catálogo disponible...</p>";

    try {
        const response = await fetch("/api/hoteles");
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const hoteles = await response.json();
        cardsContainer.innerHTML = "";

        if (hoteles.length === 0) {
            cardsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>No hay alojamientos disponibles.</p>";
            return;
        }

        hoteles.forEach(hotel => {
            const imagenUrl = hotel.imagen_h || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200';
            
            const card = document.createElement("div");
            card.className = "card";
            
            card.innerHTML = `
                <img src="${imagenUrl}" alt="${hotel.nombre}">
                <div class="card-content">
                    <h3>${hotel.nombre}</h3>
                    <p>📍 ${hotel.localizacion}</p>
                    <p>🛏️ ${hotel.cantidad_habitaciones} Hab.</p>
                    
                    <!-- Campo de descripción -->
                    <p class="hotel-desc">${hotel.descripcion || 'Sin descripción disponible.'}</p>
                    
                    <div class="price">$${hotel.precio || '---'} USD</div>
                    <button class="btn-reservar" onclick="event.stopPropagation();">Reservar ahora</button>
                </div>
            `;

            card.addEventListener("click", () => {
                const anterior = document.querySelector(".card.expanded");
                if (anterior && anterior !== card) anterior.classList.remove("expanded");
                card.classList.toggle("expanded");
            });

            cardsContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        cardsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error al conectar con la base de datos.</p>`;
    }
}