const API_URL = "http://localhost:3000";

const form = document.getElementById("claveForm");
const errorBox = document.getElementById("loginError");
const btnIngresar = document.getElementById("btnIngresar");

if (!form) {
    console.error("No se encontró el formulario con ID 'claveForm'");
}

form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Frenamos la recarga automática de la página

    errorBox.classList.remove("visible");
    btnIngresar.disabled = true;
    btnIngresar.textContent = "Verificando...";

    // Tomamos el valor del input usando id="gmail"
    const inputGmail = document.getElementById("gmail"); 
    const inputPassword = document.getElementById("password");

    if (!inputGmail || !inputPassword) {
        errorBox.textContent = "Error: Faltan los inputs de gmail o contraseña en el HTML.";
        errorBox.classList.add("visible");
        btnIngresar.disabled = false;
        btnIngresar.textContent = "Ingresar";
        return;
    }

    const gmail = inputGmail.value.trim();
    const password = inputPassword.value;

    try {
        const response = await fetch(`${API_URL}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gmail, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorBox.textContent = data.error || "No se pudo verificar el acceso.";
            errorBox.classList.add("visible");
            return;
        }

        // Guardamos el token y el estatus en el almacenamiento local
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("estatus", data.estatus);
        }

        const estatusLimpio = data.estatus ? data.estatus.trim().toLowerCase() : "";

        // Redirección dinámica según el estatus de la base de datos
        if (estatusLimpio === "admin") {
            window.location.href = "administrador.html";
        } else if (estatusLimpio === "hotelero") {
            window.location.href = "admin.html";
        } else {
            errorBox.textContent = `Rol no reconocido: "${data.estatus}"`;
            errorBox.classList.add("visible");
        }

    } catch (error) {
        console.error("Error en el fetch:", error);
        errorBox.textContent = "No se pudo conectar con el servidor.";
        errorBox.classList.add("visible");
    } finally {
        btnIngresar.disabled = false;
        btnIngresar.textContent = "Ingresar";
    }
});