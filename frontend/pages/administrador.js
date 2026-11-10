// Misma imagen predeterminada que usa el catálogo (catalogo.js) cuando un hotel no tiene imagen
const IMAGEN_PREDETERMINADA = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200";

function escapeHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeAttr(texto) {
    return escapeHtml(texto).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

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
            const imagen = oferta.imagen_h || IMAGEN_PREDETERMINADA;

            card.innerHTML = `
                <img class="hotel-thumb" src="${escapeAttr(imagen)}" alt="${escapeAttr(oferta.nombre)}"
                     onerror="this.onerror=null;this.src='${IMAGEN_PREDETERMINADA}'">
                <div class="hotel-body">
                    <h3>${escapeHtml(oferta.nombre)}</h3>
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
    // 1. Buscamos la oferta en el array local guardado al cargar la página
    const oferta = ofertasCargadas.find(o => String(o.id) === String(id));

    if (!oferta) {
        await mostrarAlerta({
            icono: "❌",
            titulo: "Oferta no encontrada",
            mensaje: "No se encontró la información de la oferta. Recargá la página e intentá de nuevo."
        });
        return;
    }

    const confirmado = await confirmarAccion({
        icono: "🏨",
        titulo: "¿Aprobar esta oferta?",
        mensaje: `"${oferta.nombre}" se agregará al catálogo oficial y se quitará de las ofertas pendientes.`,
        textoConfirmar: "Sí, aprobar"
    });
    if (!confirmado) return;

    try {
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

        cargarOfertas();
        await mostrarAlerta({
            icono: "✅",
            titulo: "¡Oferta aprobada!",
            mensaje: `"${oferta.nombre}" ya forma parte del catálogo oficial.`
        });

    } catch (error) {
        console.error("Error al aceptar oferta:", error);
        await mostrarAlerta({
            icono: "❌",
            titulo: "Ocurrió un problema",
            mensaje: error.message
        });
    }
}

/* ==========================================================================
   4. RECHAZAR OFERTA (Se elimina únicamente del JSON)
   ========================================================================== */
async function rechazarOferta(id) {
    const oferta = ofertasCargadas.find(o => String(o.id) === String(id));

    const confirmado = await confirmarAccion({
        icono: "🗑️",
        titulo: "¿Rechazar esta propuesta?",
        mensaje: oferta
            ? `La propuesta "${oferta.nombre}" se eliminará de la lista de pendientes. Esta acción no se puede deshacer.`
            : "La propuesta se eliminará de la lista de pendientes. Esta acción no se puede deshacer.",
        textoConfirmar: "Sí, rechazar",
        peligro: true
    });
    if (!confirmado) return;

    try {
        const response = await fetch(`http://localhost:3000/api/ofertas/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("No se pudo rechazar la oferta.");

        const res = await response.json();

        // Recargamos el listado
        cargarOfertas();
        await mostrarAlerta({
            icono: "🗑️",
            titulo: "Propuesta rechazada",
            mensaje: res.mensaje || "La propuesta fue eliminada de la lista de pendientes."
        });

    } catch (error) {
        console.error("Error al rechazar oferta:", error);
        await mostrarAlerta({
            icono: "❌",
            titulo: "Ocurrió un problema",
            mensaje: "No se pudo descartar la oferta. Intentá de nuevo."
        });
    }
}

/* ==========================================================================
   5. ALERTAS Y CONFIRMACIONES (reemplazan a alert() y confirm())
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

// Reemplazo de confirm(): devuelve true si el admin confirma, false si cancela
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
