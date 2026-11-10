/* ==========================================================================
   PANEL DEL HOTELERO (Envío de ofertas + Gestión de hoteles publicados)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("hotelForm");

    // 1. Manejo del envío del formulario (Propuestas a pendientes)
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            const textoOriginal = btn.innerHTML;

            btn.disabled = true;
            btn.textContent = "Enviando oferta...";

            const ofertaHotel = {
                nombre: document.getElementById("nombre").value.trim(),
                localizacion: document.getElementById("localizacion").value.trim(),
                cantidad_habitaciones: Number(document.getElementById("habitaciones").value),
                precio: Number(document.getElementById("precio").value),
                imagen_h: document.getElementById("imagen").value.trim() || null,
                descripcion: document.getElementById("descripcion").value.trim() || "Sin descripción"
            };

            try {
                const response = await fetch("http://localhost:3000/api/ofertas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ofertaHotel)
                });

                if (!response.ok) {
                    throw new Error("Ocurrió un error en el servidor al guardar la oferta.");
                }

                form.reset();
                // Sin await: el botón se rehabilita enseguida (finally) mientras el aviso está abierto
                mostrarAlerta({
                    icono: "✅",
                    titulo: "¡Oferta enviada!",
                    mensaje: "Quedó registrada en pendientes para ser evaluada por el administrador."
                });

            } catch (error) {
                console.error("Error al enviar la oferta:", error);
                mostrarAlerta({
                    icono: "❌",
                    titulo: "No se pudo enviar la oferta",
                    mensaje: "Verificá que el servidor backend esté corriendo e intentá de nuevo."
                });
            } finally {
                btn.disabled = false;
                btn.innerHTML = textoOriginal;
            }
        });
    }

    // 2. Carga inicial de hoteles publicados
    cargarHoteles();
});

// Referencias a los elementos de la interfaz de hoteles del hotelero
const listaHoteles = document.getElementById("listaHoteles");

// Hoteles publicados en pantalla (para nombrarlos en el aviso de confirmación)
let hotelesCargados = [];

/* ==========================================================================
   ÍCONOS SVG REUTILIZABLES
   ========================================================================== */
function iconoEdificio() {
    return `<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4"/></svg>`;
}

function iconoPin() {
    return `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>`;
}

function iconoPuerta() {
    return `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>`;
}

function iconoTrash() {
    return `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
}

/* ==========================================================================
   ESTADÍSTICAS E INTERFAZ DE HOTELES PUBLICADOS
   ========================================================================== */
function actualizarStats(hoteles) {
    const total = hoteles.length;
    const totalHab = hoteles.reduce((sum, h) => sum + Number(h.cantidad_habitaciones || 0), 0);
    const promedio = total > 0 ? Math.round(totalHab / total) : 0;

    const elHoteles = document.getElementById("statHoteles");
    const elHabitaciones = document.getElementById("statHabitaciones");
    const elPromedio = document.getElementById("statPromedio");
    const elCountLabel = document.getElementById("countLabel");

    if (elHoteles) elHoteles.textContent = total;
    if (elHabitaciones) elHabitaciones.textContent = totalHab;
    if (elPromedio) elPromedio.textContent = total > 0 ? promedio : "—";
    if (elCountLabel) {
        elCountLabel.textContent = total === 1 ? "1 propiedad" : `${total} propiedades`;
    }
}

/* ==========================================================================
   CARGAR HOTELES ACEPTADOS
   ========================================================================== */
async function cargarHoteles() {
    if (!listaHoteles) return;

    try {
        const response = await fetch("http://localhost:3000/api/hoteles");
        if (!response.ok) throw new Error("Error al obtener los hoteles de la base de datos.");

        const hoteles = await response.json();
        hotelesCargados = hoteles;

        actualizarStats(hoteles);
        listaHoteles.innerHTML = "";

        if (hoteles.length === 0) {
            listaHoteles.innerHTML = `
                <div class="empty-state">
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

    } catch (error) {
        console.error("Error al cargar hoteles:", error);
        listaHoteles.innerHTML = `<p style="text-align: center; color: #dc2626;">Error al conectar con la base de datos.</p>`;
    }
}

/* ==========================================================================
   ELIMINAR HOTEL PUBLICADO
   ========================================================================== */
async function eliminarHotel(id) {
    const hotel = hotelesCargados.find(h => String(h.id) === String(id));

    const confirmado = await confirmarAccion({
        icono: "🗑️",
        titulo: "¿Retirar este hotel?",
        mensaje: hotel
            ? `"${hotel.nombre}" se retirará del catálogo oficial. Esta acción no se puede deshacer.`
            : "El hotel se retirará del catálogo oficial. Esta acción no se puede deshacer.",
        textoConfirmar: "Sí, retirar",
        peligro: true
    });
    if (!confirmado) return;

    try {
        const response = await fetch(`http://localhost:3000/api/hoteles/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("No se pudo eliminar el hotel.");

        cargarHoteles();

    } catch (error) {
        console.error("Error al eliminar hotel:", error);
        await mostrarAlerta({
            icono: "❌",
            titulo: "No se pudo retirar el hotel",
            mensaje: "Ocurrió un problema al intentar eliminarlo. Intentá de nuevo."
        });
    }
}

/* ==========================================================================
   ALERTAS Y CONFIRMACIONES (reemplazan a alert() y confirm())
   Misma estética que el aviso "Necesitás una cuenta" del catálogo.
   ========================================================================== */

/*
    Muestra un modal y devuelve una Promise con el valor del botón elegido.
    Si se cierra con la X, tocando afuera o con Escape, resuelve valorCancelar.
    Los textos se insertan con textContent (nada se interpreta como HTML).
*/
function mostrarModal({ icono, titulo, mensaje, botones, valorCancelar = false }) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
                <button type="button" class="modal-close" aria-label="Cerrar">×</button>
                <div class="modal-logo">ICLUD</div>
                <div class="modal-icono"></div>
                <h2 id="modal-titulo"></h2>
                <p class="modal-sub"></p>
                <div class="modal-botones"></div>
            </div>`;

        overlay.querySelector(".modal-icono").textContent = icono;
        overlay.querySelector("h2").textContent = titulo;
        overlay.querySelector(".modal-sub").textContent = mensaje;

        function cerrar(valor) {
            document.removeEventListener("keydown", alPresionarTecla);
            overlay.classList.remove("active");
            setTimeout(() => overlay.remove(), 300);
            resolve(valor);
        }

        function alPresionarTecla(e) {
            if (e.key === "Escape") cerrar(valorCancelar);
        }

        const contenedorBotones = overlay.querySelector(".modal-botones");
        botones.forEach((b) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `btn-submit ${b.clase || ""}`.trim();
            btn.textContent = b.texto;
            btn.addEventListener("click", () => cerrar(b.valor));
            contenedorBotones.appendChild(btn);
        });

        overlay.querySelector(".modal-close").addEventListener("click", () => cerrar(valorCancelar));
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) cerrar(valorCancelar);
        });
        document.addEventListener("keydown", alPresionarTecla);

        document.body.appendChild(overlay);
        overlay.offsetHeight; // fuerza el reflow para que se vea la animación de entrada
        overlay.classList.add("active");
        contenedorBotones.firstElementChild.focus();
    });
}

// Reemplazo de confirm(): devuelve true si el usuario confirma, false si cancela
function confirmarAccion({ icono, titulo, mensaje, textoConfirmar = "Confirmar", textoCancelar = "Cancelar", peligro = false }) {
    return mostrarModal({
        icono,
        titulo,
        mensaje,
        botones: [
            { texto: textoConfirmar, clase: peligro ? "peligro" : "", valor: true },
            { texto: textoCancelar, clase: "secundario", valor: false }
        ],
        valorCancelar: false
    });
}

// Reemplazo de alert(): un solo botón para cerrar
function mostrarAlerta({ icono, titulo, mensaje, textoBoton = "Entendido" }) {
    return mostrarModal({
        icono,
        titulo,
        mensaje,
        botones: [{ texto: textoBoton, valor: true }],
        valorCancelar: true
    });
}
