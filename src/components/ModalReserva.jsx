import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { useSesion } from "../context/SesionContext.jsx";
import { api } from "../services/api.js";

const FORMULARIO_VACIO = {
  nombre: "",
  email: "",
  huespedes: "",
  llegada: "",
  salida: ""
};

export default function ModalReserva({
  abierto,
  hotelId,
  onCerrar,
  onReservada,
  onRequiereLogin,
  onSesionExpirada,
  onError
}) {
  const { sesion } = useSesion();
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (abierto && sesion && !form.email) {
      setForm((f) => ({ ...f, email: sesion.usuario.gmail }));
    }
  }, [abierto]);

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();

    if (!sesion) {
      onCerrar();
      onRequiereLogin("Para reservar un alojamiento necesitás iniciar sesión o registrarte.");
      return;
    }

    const datosReserva = {
      hotelId,
      nombre_completo: form.nombre,
      gmail: form.email,
      cantidad_huespedes: Number(form.huespedes),
      llegada: form.llegada,
      salida: form.salida
    };

    setEnviando(true);
    try {
      await api("/api/checkout", { metodo: "POST", cuerpo: datosReserva, auth: true });
      onCerrar();
      setForm(FORMULARIO_VACIO);
      onReservada(datosReserva.gmail);
    } catch (error) {
      if (error.status === 401) {
        onSesionExpirada();
      } else {
        console.error("Error al procesar la reserva:", error);
        const detalle = error.status && error.status < 500 ? error.message : "Hubo un problema. Intentalo de nuevo.";
        onError(`❌ ${detalle}`);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <h2>Reservá tu estadía</h2>
      <p className="modal-sub">Completá los datos para proceder al pago seguro</p>
      <form onSubmit={enviar}>
        <div className="form-group">
          <label htmlFor="reserva-nombre">Nombre completo</label>
          <input
            type="text"
            id="reserva-nombre"
            placeholder="Ej: Juan Pérez"
            required
            value={form.nombre}
            onChange={cambiar("nombre")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reserva-email">Correo electrónico</label>
          <input
            type="email"
            id="reserva-email"
            placeholder="tu@email.com"
            required
            value={form.email}
            onChange={cambiar("email")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reserva-huespedes">Cantidad de huéspedes</label>
          <input
            type="number"
            id="reserva-huespedes"
            min="1"
            placeholder="Ej: 2"
            required
            value={form.huespedes}
            onChange={cambiar("huespedes")}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reserva-llegada">Fecha de llegada</label>
            <input
              type="date"
              id="reserva-llegada"
              required
              value={form.llegada}
              onChange={cambiar("llegada")}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reserva-salida">Fecha de salida</label>
            <input
              type="date"
              id="reserva-salida"
              required
              value={form.salida}
              onChange={cambiar("salida")}
            />
          </div>
        </div>
        <button type="submit" className="btn-submit" disabled={enviando}>
          {enviando ? "Enviando reserva... 🔄" : "Confirmar reserva 📩"}
        </button>
      </form>
    </Modal>
  );
}
