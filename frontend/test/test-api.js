// Apuntamos al archivo que acabas de clonar
const urlLocal = "/frontend/test/airbnb.json";

const divEstado = document.getElementById("estado");
const contenedor = document.getElementById("contenedor-hoteles");

async function probarAPI() {
    try {
        divEstado.innerText = "Cargando propiedades desde el simulador local... 📡";
        
        const response = await fetch(urlLocal);
        if (!response.ok) {
            throw new Error(`Error al leer el archivo local`);
        }

        const resultado = await response.json();
        console.log("Datos del JSON local:", resultado);

        // CORRECCIÓN CLAVE: Ahora la API los guarda en 'list'
        const propiedades = resultado.data?.list;

        if (!propiedades || propiedades.length === 0) {
            divEstado.innerText = "⚠️ No se encontraron propiedades en el archivo local.";
            return;
        }

        divEstado.innerHTML = `✅ <b>¡Éxito total!</b> Se cargaron ${propiedades.length} propiedades reales de Miami desde el JSON.`;
        contenedor.innerHTML = "";

        propiedades.forEach(item => {
            // En este endpoint, los datos vienen directo en el item o en item.listing
            const hotel = item; 
            if (!hotel) return;

            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta";

            // Adaptamos el mapeo de imágenes y precios según el nuevo objeto de la consola
            const imagen = hotel.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200";
            const precioNoche = hotel.price?.priceItems?.[0]?.title || "Consultar";

            tarjeta.innerHTML = `
                <img src="${imagen}" alt="${hotel.title || 'Alojamiento'}">
                <div class="info">
                    <h3>${hotel.title || "Alojamiento en Miami"}</h3>
                    <p>⭐ ${hotel.rating || "Sin escala"}</p>
                    <div class="precio">${precioNoche} / noche</div>
                </div>
            `;

            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error completo:", error);
        divEstado.innerHTML = `❌ <b>Error:</b> ${error.message}.`;
    }
}

document.addEventListener("DOMContentLoaded", probarAPI);