/* ==========================================================================
   SESIÓN COMPARTIDA (index, catálogo, favoritos, login)
   Guarda el token y el usuario en localStorage y arma la zona de sesión del
   header: botones Ingresar / Registrarse, o "Bienvenido, correo" + Cerrar sesión.
   Incluir ANTES de los demás scripts de la página.
   ========================================================================== */
const ICLUD_API = "http://localhost:3000";
const SESION_KEY = "iclud_sesion";

function obtenerSesion() {
    try {
        const s = JSON.parse(localStorage.getItem(SESION_KEY));
        return s && s.token && s.usuario ? s : null;
    } catch {
        return null;
    }
}

function guardarSesion(token, usuario) {
    localStorage.setItem(SESION_KEY, JSON.stringify({ token, usuario }));
}

function cerrarSesion() {
    localStorage.removeItem(SESION_KEY);
}

// Headers para llamar a rutas protegidas: cabecerasAuth({ "Content-Type": "application/json" })
function cabecerasAuth(extra = {}) {
    const s = obtenerSesion();
    return s ? { ...extra, Authorization: `Bearer ${s.token}` } : extra;
}

function escaparHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderizarNavSesion() {
    const contenedor = document.getElementById("nav-auth");
    if (!contenedor) return;

    const sesion = obtenerSesion();

    if (!sesion) {
        contenedor.innerHTML = `
            <a href="clave.html" class="btn-login">Ingresar</a>
            <a href="registro.html" class="btn-register">Registrarse</a>`;
        return;
    }

    const gmail = escaparHtml(sesion.usuario.gmail);
    contenedor.innerHTML = `
        <span class="nav-bienvenida" title="${gmail}">Bienvenido, <strong>${gmail}</strong></span>
        <a href="#" class="btn-register" id="btn-logout">Cerrar sesión</a>`;

    document.getElementById("btn-logout").addEventListener("click", (e) => {
        e.preventDefault();
        cerrarSesionYSalir();
    });
}

function cerrarSesionYSalir() {
    cerrarSesion();
    // Si estaba en una página que requiere sesión, vuelve al inicio; si no, recarga como visitante
    if (window.location.pathname.endsWith("favoritos.html")) {
        window.location.href = "index.html";
    } else {
        window.location.reload();
    }
}

document.addEventListener("DOMContentLoaded", renderizarNavSesion);
