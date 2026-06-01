const listaHoteles = document.getElementById("listaHoteles");

const form = document.getElementById("hotelForm");

/*
    Cargar hoteles
*/
async function cargarHoteles() {

    const response = await fetch("/api/hoteles");

    const hoteles = await response.json();

    listaHoteles.innerHTML = "";

    hoteles.forEach(hotel => {

        listaHoteles.innerHTML += `
            <div class="hotel">

                <h3>${hotel.nombre}</h3>

                <p>
                    ${hotel.localizacion}
                </p>

                <p>
                    Habitaciones:
                    ${hotel.cantidad_habitaciones}
                </p>

                <button onclick="eliminarHotel(${hotel.id})">
                    Eliminar
                </button>

            </div>
        `;

    });

}

/*
    Crear hotel
*/
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    await fetch("/api/hoteles", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            nombre: document.getElementById("nombre").value,

            localizacion: document.getElementById("localizacion").value,

            cantidad_habitaciones:
                document.getElementById("habitaciones").value,

            imagen_h:
                document.getElementById("imagen").value,

            descripcion:
                document.getElementById("descripcion").value

        })

    });

    form.reset();

    cargarHoteles();

});

/*
    Eliminar hotel
*/
async function eliminarHotel(id) {

    if (!confirm("¿Eliminar hotel?")) {
        return;
    }

    await fetch(`/api/hoteles/${id}`, {
        method: "DELETE"
    });

    cargarHoteles();

}

cargarHoteles();