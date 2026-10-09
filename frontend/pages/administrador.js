// Variable global para mantener las ofertas en memoria
let ofertasCargadas = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarOfertas();
});

const listaHoteles = document.getElementById("listaHoteles");

/* ==========================================================================
   1. CARGAR Y MOSTRAR OFERTAS PENDIENTES
   ========================================================================== */
async function cargarOfertas() {
    if (!listaHoteles) return;

    listaHoteles.innerHTML = "<p style='text-align: center; color: #9A9A92;'>Cargando ofertas pendientes...</p>";

    try {
        const response = await fetch("http://localhost:3000/api/ofertas");
        if (!response.ok) throw new Error("Error al obtener las ofertas.");

        // Guardamos las ofertas obtenidas en la variable global
        ofertasCargadas = await response.json();
        const ofertas = ofertasCargadas;
        
        // Actualizamos las estadísticas superiores
        actualizarStats(ofertas);

        listaHoteles.innerHTML = "";

        if (ofertas.length === 0) {
            listaHoteles.innerHTML = `
                <div class="empty-state">
                    <p>🏨</p>
                    <p>No hay ofertas pendientes de revisión.</p>
                </div>
            `;
            return;
        }

        // Renderizamos cada tarjeta con la estructura reducida
        ofertas.forEach(oferta => {
            const card = document.createElement("div");
            card.className = "hotel";

            card.innerHTML = `
                <div class="hotel-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4"/>
                    </svg>
                </div>
                <div class="hotel-body">
                    <h3>${oferta.nombre}</h3>
                    <div class="hotel-meta">
                        <span>💵 $${oferta.precio?.toLocaleString('es-AR') || '0'} / noche</span>
                        <span>🛏️ ${oferta.cantidad_habitaciones} hab.</span>
                    </div>
                </div>
                <div class="hotel-actions" style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="aceptarOferta(${oferta.id})">
                        Aceptar
                    </button>
                    <button class="btn btn-ghost" onclick="rechazarOferta(${oferta.id})" style="color: #dc2626; border-color: #fecaca;">
                        Rechazar
                    </button>
                </div>
            `;

            listaHoteles.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar las ofertas:", error);
        listaHoteles.innerHTML = `<p style="text-align: center; color: #dc2626;">Error al conectar con el servidor.</p>`;
    }
}

/* ==========================================================================
   2. ACTUALIZAR ESTADÍSTICAS DEL HEADER
   ========================================================================== */
function actualizarStats(ofertas) {
    const total = ofertas.length;
    const totalHab = ofertas.reduce((sum, o) => sum + Number(o.cantidad_habitaciones || 0), 0);
    const promedio = total > 0 ? Math.round(totalHab / total) : 0;

    const elPendientes = document.getElementById("statOfertasPendientes");
    const elHabitaciones = document.getElementById("statHabitaciones");
    const elPromedio = document.getElementById("statPromedio");
    const elCountLabel = document.getElementById("countLabel");

    if (elPendientes) elPendientes.textContent = total;
    if (elHabitaciones) elHabitaciones.textContent = totalHab;
    if (elPromedio) elPromedio.textContent = total > 0 ? promedio : "—";
    if (elCountLabel) elCountLabel.textContent = total === 1 ? "1 oferta" : `${total} ofertas`;
}

/* ==========================================================================
   3. ACEPTAR OFERTA (Sube a BD vía /api/hoteles y borra del JSON de pendientes)
   ========================================================================== */
async function aceptarOferta(id) {
    if (!confirm("¿Deseas aprobar esta oferta y agregarla al catálogo oficial?")) return;

    try {
        // 1. Buscamos la oferta en el array local guardado al cargar la página
        const oferta = ofertasCargadas.find(o => String(o.id) === String(id));

        if (!oferta) {
            alert("❌ No se encontró la información de la oferta en memoria.");
            return;
        }

        // 2. Enviamos el hotel a la base de datos usando TU RUTA OFICIAL
        const resHotel = await fetch("http://localhost:3000/api/hoteles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: oferta.nombre,
                localizacion: oferta.localizacion,
                cantidad_habitaciones: oferta.cantidad_habitaciones,
                imagen_h: oferta.imagen_h,
                descripcion: oferta.descripcion,
                precio: oferta.precio
            })
        });

        if (!resHotel.ok) {
            const errorTexto = await resHotel.text();
            console.error("Error devuelto por /api/hoteles:", errorTexto);
            throw new Error("No se pudo guardar el hotel en la base de datos.");
        }

        // 3. Si se guardó en la BD, la eliminamos de ofertas_pendientes.json
        const resDelete = await fetch(`http://localhost:3000/api/ofertas/${id}`, {
            method: "DELETE"
        });

        if (!resDelete.ok) {
            throw new Error("El hotel fue guardado en la BD, pero ocurrió un problema al quitarlo de la lista de pendientes.");
        }

        alert("✅ Oferta aprobada e ingresada al catálogo correctamente.");
        cargarOfertas();

    } catch (error) {
        console.error("Error al aceptar oferta:", error);
        alert("❌ Error: " + error.message);
    }
}

/* ==========================================================================
   4. RECHAZAR OFERTA (Se elimina únicamente del JSON)
   ========================================================================== */
async function rechazarOferta(id) {
    if (!confirm("¿Deseas rechazar y eliminar esta propuesta?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/ofertas/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("No se pudo rechazar la oferta.");

        const res = await response.json();
        alert("🗑️ " + res.mensaje);

        // Recargamos el listado
        cargarOfertas();

    } catch (error) {
        console.error("Error al rechazar oferta:", error);
        alert("❌ Ocurrió un problema al descartar la oferta.");
    }
}