const API_URL = "http://localhost:3000";

const form = document.getElementById("registroForm");
const errorBox = document.getElementById("loginError");
const btnRegistrar = document.getElementById("btnRegistrar");

function mostrarError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add("visible");
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorBox.classList.remove("visible");

    const gmail = document.getElementById("gmail").value.trim();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    if (password.length < 6) {
        return mostrarError("La contraseña debe tener al menos 6 caracteres.");
    }
    if (password !== password2) {
        return mostrarError("Las contraseñas no coinciden.");
    }

    btnRegistrar.disabled = true;
    btnRegistrar.textContent = "Creando cuenta...";

    try {
        // El rol NO se envía: el backend siempre asigna "usuario"
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gmail, password })
        });

        const data = await response.json();

        if (!response.ok) {
            return mostrarError(data.error || "No se pudo crear la cuenta.");
        }

        alert("¡Cuenta creada! Ahora podés iniciar sesión.");
        window.location.href = "clave.html";

    } catch (error) {
        console.error(error);
        mostrarError("No se pudo conectar con el servidor.");
    } finally {
        btnRegistrar.disabled = false;
        btnRegistrar.textContent = "Crear cuenta";
    }
});
