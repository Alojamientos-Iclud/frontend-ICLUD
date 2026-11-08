/* ==========================================================================
   CATÁLOGO + FAVORITOS
   Este mismo script maneja catalogo.html y favoritos.html
   (favoritos.html tiene <body data-vista="favoritos">).
   Requiere sesion.js cargado antes.
   ========================================================================== */
const IMAGEN_PREDETERMINADA = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200";

let favoritosIds = new Set();
let SOLO_FAVORITOS = false;

document.addEventListener("DOMContentLoaded", () => {
    SOLO_FAVORITOS = document.body.dataset.vista === "favoritos";

    if (SOLO_FAVORITOS) {
        cargarVistaFavoritos();
    } else {
        cargarCatalogoCompleto();
    }

    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Reservar requiere sesión (el backend también lo exige)
            if (!obtenerSesion()) {
                closeModal("reserva");
                abrirModalLoginRequerido("Para reservar un alojamiento necesitás iniciar sesión o registrarte.");
                return;
            }

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
                const response = await fetch(`${ICLUD_API}/api/checkout`, {
                    method: "POST",
                    headers: cabecerasAuth({ "Content-Type": "application/json" }),
                    body: JSON.stringify(datosReserva),
                });

                if (response.status === 401) {
                    manejarSesionExpirada();
                    return;
                }
                if (!response.ok) throw new Error("Error en el servidor.");

                await response.json();

                // Cerramos el modal de reserva y mostramos el de confirmación
                closeModal('reserva');
                bookingForm.reset();
                abrirModalConfirmacion(datosReserva.gmail);

            } catch (error) {
                console.error("Error al procesar la reserva:", error);
                mostrarToast("❌ Hubo un problema. Intentalo de nuevo.", true);
            } finally {
                btnSubmit.innerHTML = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }
});

/* ==========================================================================
   TARJETAS
   ========================================================================== */
function textoFavorito(esFavorito) {
    return esFavorito ? "♥ Quitar de favoritos" : "♡ Agregar a favoritos";
}

function crearTarjetaHotel(hotel) {
    const imagenUrl = hotel.imagen_h || IMAGEN_PREDETERMINADA;
    const esFavorito = favoritosIds.has(hotel.id);

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.hotelId = hotel.id;

    card.innerHTML = `
        <img src="${escaparHtml(imagenUrl)}" alt="${escaparHtml(hotel.nombre)}"
             onerror="this.onerror=null;this.src='${IMAGEN_PREDETERMINADA}'">
        <div class="card-content">
            <h3>${escaparHtml(hotel.nombre)}</h3>
            <p>📍 ${escaparHtml(hotel.localizacion)}</p>
            <p>🛏️ ${escaparHtml(hotel.cantidad_habitaciones)} Hab.</p>
            <p class="hotel-desc">${escaparHtml(hotel.descripcion || 'Sin descripción disponible.')}</p>
            <div class="price">$${hotel.precio?.toLocaleString('es-AR') || '---'} ARS / noche</div>
            <button class="btn-favorito ${esFavorito ? 'activo' : ''}" onclick="event.stopPropagation(); alternarFavorito(${hotel.id}, this)">
                ${textoFavorito(esFavorito)}
            </button>
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

    return card;
}

/* ==========================================================================
   CATÁLOGO COMPLETO
   ========================================================================== */
async function cargarCatalogoCompleto() {
    const cardsContainer = document.getElementById("cards-container");
    if (!cardsContainer) return;

    cardsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666;'>Cargando catálogo disponible...</p>";

    try {
        // Si hay sesión, traemos los favoritos para marcar los botones (si falla, el catálogo igual se muestra)
        if (obtenerSesion()) {
            try {
                const favoritos = await obtenerFavoritos();
                favoritosIds = new Set(favoritos.map(h => h.id));
            } catch (e) {
                if (e.sesionExpirada) renderizarNavSesion();
                else console.error("No se pudieron cargar los favoritos:", e);
            }
        }

        const response = await fetch(`${ICLUD_API}/api/hoteles`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const hoteles = await response.json();
        cardsContainer.innerHTML = "";

        if (hoteles.length === 0) {
            cardsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>No hay alojamientos disponibles.</p>";
            return;
        }

        hoteles.forEach(hotel => cardsContainer.appendChild(crearTarjetaHotel(hotel)));

    } catch (error) {
        console.error("Error:", error);
        cardsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error al conectar con la base de datos.</p>`;
    }
}

/* ==========================================================================
   FAVORITOS
   ========================================================================== */
async function obtenerFavoritos() {
    const response = await fetch(`${ICLUD_API}/api/favoritos`, { headers: cabecerasAuth() });

    if (response.status === 401) {
        cerrarSesion();
        const err = new Error("Sesión expirada");
        err.sesionExpirada = true;
        throw err;
    }
    if (!response.ok) throw new Error(`Error al obtener favoritos: ${response.status}`);

    return response.json();
}

function mostrarSinFavoritos(cardsContainer) {
    cardsContainer.innerHTML = `
        <div class="estado-vacio">
            <div class="estado-vacio-icono">💔</div>
            <h2>No tenés ningún hotel en favoritos</h2>
            <p>Abrí la tarjeta de un alojamiento y tocá "Agregar a favoritos" para guardarlo acá.</p>
            <a href="catalogo.html">Ver alojamientos</a>
        </div>`;
}

async function cargarVistaFavoritos() {
    const cardsContainer = document.getElementById("cards-container");
    if (!cardsContainer) return;

    // Página solo para usuarios con sesión
    if (!obtenerSesion()) {
        window.location.href = "clave.html?next=favoritos.html";
        return;
    }

    cardsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #666;'>Cargando tus favoritos...</p>";

    try {
        const hoteles = await obtenerFavoritos();
        favoritosIds = new Set(hoteles.map(h => h.id));
        cardsContainer.innerHTML = "";

        if (hoteles.length === 0) {
            mostrarSinFavoritos(cardsContainer);
            return;
        }

        hoteles.forEach(hotel => cardsContainer.appendChild(crearTarjetaHotel(hotel)));

    } catch (error) {
        if (error.sesionExpirada) {
            window.location.href = "clave.html?next=favoritos.html";
            return;
        }
        console.error("Error:", error);
        cardsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">No se pudieron cargar tus favoritos.</p>`;
    }
}

async function alternarFavorito(hotelId, boton) {
    if (!obtenerSesion()) {
        abrirModalLoginRequerido("Para guardar favoritos necesitás iniciar sesión o registrarte.");
        return;
    }

    const eraFavorito = favoritosIds.has(hotelId);
    boton.disabled = true;

    try {
        const response = await fetch(
            eraFavorito ? `${ICLUD_API}/api/favoritos/${hotelId}` : `${ICLUD_API}/api/favoritos`,
            {
                method: eraFavorito ? "DELETE" : "POST",
                headers: cabecerasAuth({ "Content-Type": "application/json" }),
                body: eraFavorito ? undefined : JSON.stringify({ hotelId })
            }
        );

        if (response.status === 401) {
            manejarSesionExpirada();
            return;
        }
        if (!response.ok) throw new Error("No se pudo actualizar favoritos");

        if (eraFavorito) favoritosIds.delete(hotelId);
        else favoritosIds.add(hotelId);

        // En la página de favoritos, al quitar uno desaparece la tarjeta
        if (SOLO_FAVORITOS && eraFavorito) {
            const card = boton.closest(".card");
            if (card) card.remove();
            const cardsContainer = document.getElementById("cards-container");
            if (cardsContainer && !cardsContainer.querySelector(".card")) mostrarSinFavoritos(cardsContainer);
            mostrarToast("Quitado de favoritos");
            return;
        }

        boton.classList.toggle("activo", !eraFavorito);
        boton.textContent = textoFavorito(!eraFavorito);
        mostrarToast(eraFavorito ? "Quitado de favoritos" : "♥ Agregado a favoritos");

    } catch (error) {
        console.error("Error al actualizar favoritos:", error);
        mostrarToast("❌ No se pudo actualizar tus favoritos.", true);
    } finally {
        boton.disabled = false;
    }
}

/* ==========================================================================
   SESIÓN
   ========================================================================== */
function manejarSesionExpirada() {
    cerrarSesion();
    renderizarNavSesion();
    if (SOLO_FAVORITOS) {
        window.location.href = "clave.html?next=favoritos.html";
        return;
    }
    favoritosIds = new Set();
    abrirModalLoginRequerido("Tu sesión expiró. Iniciá sesión de nuevo para continuar.");
}

function abrirModalLoginRequerido(mensaje) {
    const msg = document.getElementById("login-requerido-msg");
    if (msg && mensaje) msg.textContent = mensaje;

    // Después de loguearse / registrarse vuelve a esta misma página
    const paginaActual = window.location.pathname.split("/").pop() || "catalogo.html";
    const next = encodeURIComponent(paginaActual);

    const linkLogin = document.getElementById("login-requerido-login");
    const linkRegistro = document.getElementById("login-requerido-registro");
    if (linkLogin) linkLogin.href = `clave.html?next=${next}`;
    if (linkRegistro) linkRegistro.href = `registro.html?next=${next}`;

    openModal("login-requerido");
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
    // Reservar requiere sesión
    const sesion = obtenerSesion();
    if (!sesion) {
        abrirModalLoginRequerido("Para reservar un alojamiento necesitás iniciar sesión o registrarte.");
        return;
    }

    const inputId = document.getElementById("reserva-hotel-id");
    if (inputId) inputId.value = hotelId;

    // Sugerimos el correo de la cuenta (se puede cambiar)
    const inputEmail = document.getElementById("reserva-email");
    if (inputEmail && !inputEmail.value) inputEmail.value = sesion.usuario.gmail;

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
