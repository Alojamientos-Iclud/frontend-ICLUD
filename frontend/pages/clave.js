const API_URL = "http://localhost:3000";

const form = document.getElementById("claveForm");
const errorBox = document.getElementById("loginError");
const btnIngresar = document.getElementById("btnIngresar");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorBox.classList.remove("visible");
    btnIngresar.disabled = true;
    btnIngresar.textContent = "Verificando...";

    const gmail = document.getElementById("gmail").value.trim();
    const password = document.getElementById("password").value;

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

        if (data.estatus === "hotelero"){
        window.location.href = "admin.html";
        } else if (data.estatus === "admin") {
            window.location.href = "administrador.html";
        }

    } catch (error) {
        console.error(error);
        errorBox.textContent = "No se pudo conectar con el servidor.";
        errorBox.classList.add("visible");
    } finally {
        btnIngresar.disabled = false;
        btnIngresar.textContent = "Ingresar";
    }
});