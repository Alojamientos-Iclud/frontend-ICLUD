document.addEventListener("DOMContentLoaded", () => {
    cargarCatalogoCompleto();

    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const datosReserva = {
                hotelId: document.getElementById("reserva-hotel-id").value,
                nombre_completo: document.getElementById("reserva-nombre").value,
                gmail: document.getElementById("reserva-email").value,
                cantidad_huespedes: Number(document.getElementById("reserva-huespedes").value),
                llegada: document.getElementById("reserva-llegada").value,
                salida: document.getElementById("reserva-salida").value,
            };

            const btnSubmit = bookingForm.querySelector(".btn-submit");
            const textoOriginal = btnSubmit.innerHTML;
            btnSubmit.innerHTML = "Enviando reserva... 🔄";
            btnSubmit.disabled = true;

            try {
                const response = await fetch("http://localhost:3000/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosReserva),
                });

                if (!response.ok) throw new Error("Error en el servidor.");

                await response.json();

                // Cerramos el modal de reserva y mostramos el de confirmación
                closeModal('reserva');
                bookingForm.reset();
                abrirModalConfirmacion(datosReserva.gmail);

            } catch (error) {
                console.error("Error al procesar la reserva:", error);
                mostrarToast("❌ Hubo un problema. Intentalo de nuevo.", true);
                btnSubmit.innerHTML = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }
});

async function cargarCatalogoCompleto() {
    const cardsContainer = document.getElementById("cards-container");
    if (!cardsContainer) return;

    cardsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666;'>Cargando catálogo disponible...</p>";

    try {
        const response = await fetch("http://localhost:3000/api/hoteles");
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
                    <p class="hotel-desc">${hotel.descripcion || 'Sin descripción disponible.'}</p>
                    <div class="price">$${hotel.precio?.toLocaleString('es-AR') || '---'} ARS / noche</div>
                    <p><strong>Catering:</strong> ${hotel.tiene_catering ? '🍽️ Disponible' : '❌ No disponible'}</p>
                    <button class="btn-reservar" style="margin-top: 10px; width: 100%;" onclick="event.stopPropagation(); abrirModalReserva(${hotel.id})">
                        Reservar ahora
                    </button>
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

/* ==========================================================================
   MODALES
   ========================================================================== */

function openModal(tipo) {
    const modal = document.getElementById(`modal-${tipo}`);
    if (modal) modal.classList.add("active");
}

function closeModal(tipo) {
    const modal = document.getElementById(`modal-${tipo}`);
    if (modal) modal.classList.remove("active");
}

function switchModal(cerrar, abrir) {
    closeModal(cerrar);
    openModal(abrir);
}

function abrirModalReserva(hotelId) {
    const inputId = document.getElementById("reserva-hotel-id");
    if (inputId) inputId.value = hotelId;
    openModal('reserva');
}

function abrirModalConfirmacion(email) {
    // Inyectamos el mail del usuario en el modal de confirmación
    const emailSpan = document.getElementById("confirmacion-email");
    if (emailSpan) emailSpan.textContent = email;
    openModal('confirmacion');
}

/* ==========================================================================
   TOAST
   ========================================================================== */

function mostrarToast(mensaje, esError = false) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.style.background = esError ? "#ef4444" : "#22c55e";
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 4000);
}