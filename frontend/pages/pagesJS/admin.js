const listaHoteles = document.getElementById("listaHoteles");
const form = document.getElementById("hotelForm");

/*
    Actualizar stats del header
*/
function actualizarStats(hoteles) {
    const total = hoteles.length;
    const totalHab = hoteles.reduce((sum, h) => sum + Number(h.cantidad_habitaciones || 0), 0);
    const promedio = total > 0 ? Math.round(totalHab / total) : 0;

    document.getElementById("statHoteles").textContent = total;
    document.getElementById("statHabitaciones").textContent = totalHab;
    document.getElementById("statPromedio").textContent = total > 0 ? promedio : "—";
    document.getElementById("countLabel").textContent =
        total === 1 ? "1 propiedad" : `${total} propiedades`;
}

/*
    Icono de edificio (inline SVG)
*/
function iconoEdificio() {
    return `<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4"/></svg>`;
}

/*
    Icono de ubicación
*/
function iconoPin() {
    return `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>`;
}

/*
    Icono de puerta
*/
function iconoPuerta() {
    return `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>`;
}

/*
    Icono de papelera
*/
function iconoTrash() {
    return `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
}

/*
    Cargar hoteles
*/
async function cargarHoteles() {

    const response = await fetch("/api/hoteles");
    const hoteles = await response.json();

    actualizarStats(hoteles);
    listaHoteles.innerHTML = "";

    if (hoteles.length === 0) {
        listaHoteles.innerHTML = `
            <div class="empty-state">
                <p>🏨</p>
                <p>No hay hoteles registrados todavía.</p>
            </div>
        `;
        return;
    }

    hoteles.forEach(hotel => {
        const div = document.createElement("div");
        div.className = "hotel";
        div.innerHTML = `
        
            <div class="hotel-icon">${iconoEdificio()}</div>
            <div class="hotel-body">
                <h3>${hotel.nombre}</h3>
                <div class="hotel-meta">
    <span>${iconoPin()} ${hotel.localizacion}</span>
    <span>${iconoPuerta()} ${hotel.cantidad_habitaciones} hab.</span>
    <span>💵 $${hotel.precio ?? 0} / noche</span>
</div>
            </div>
            <span class="badge-active">Activo</span>
            <button class="btn-delete" onclick="eliminarHotel(${hotel.id})" title="Eliminar hotel">
                ${iconoTrash()}
            </button>
        `;
        listaHoteles.appendChild(div);
    });

}

/*
    Crear hotel
*/
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Guardando...";

    await fetch("/api/hoteles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre:               document.getElementById("nombre").value,
            localizacion:         document.getElementById("localizacion").value,
            cantidad_habitaciones: document.getElementById("habitaciones").value,
            imagen_h:             document.getElementById("imagen").value,
            descripcion:          document.getElementById("descripcion").value,
            precio:               document.getElementById("precio").value
        })
    });

    form.reset();
    btn.disabled = false;
    btn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
        </svg>
        Crear hotel
    `;
    cargarHoteles();

});

/*
    Eliminar hotel
*/
async function eliminarHotel(id) {

    if (!confirm("¿Eliminar este hotel?")) return;

    await fetch(`/api/hoteles/${id}`, { method: "DELETE" });
    cargarHoteles();

}

cargarHoteles();