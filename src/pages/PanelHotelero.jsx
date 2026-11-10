import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEstilos from "../hooks/useEstilos.js";
import hoteleroCss from "../styles/hotelero.css?inline";
import { useDialogos } from "../context/DialogosContext.jsx";
import { api } from "../services/api.js";

const FORMULARIO_VACIO = {
  nombre: "",
  localizacion: "",
  habitaciones: "",
  precio: "",
  imagen: "",
  descripcion: ""
};

const IconoEdificio = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" />
  </svg>
);

const IconoPin = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
);

const IconoPuerta = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

const IconoPapelera = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

export default function PanelHotelero() {
  useEstilos(hoteleroCss);

  const { alerta, confirmar } = useDialogos();

  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [hoteles, setHoteles] = useState([]);
  const [errorLista, setErrorLista] = useState(false);

  const cargarHoteles = useCallback(async () => {
    try {
      const lista = await api("/api/hoteles");
      setHoteles(lista);
      setErrorLista(false);
    } catch (error) {
      console.error("Error al cargar hoteles:", error);
      setErrorLista(true);
    }
  }, []);

  useEffect(() => {
    cargarHoteles();
  }, [cargarHoteles]);

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function enviarOferta(e) {
    e.preventDefault();
    setEnviando(true);

    const oferta = {
      nombre: form.nombre.trim(),
      localizacion: form.localizacion.trim(),
      cantidad_habitaciones: Number(form.habitaciones),
      precio: Number(form.precio),
      imagen_h: form.imagen.trim() || null,
      descripcion: form.descripcion.trim() || "Sin descripción"
    };

    try {
      await api("/api/ofertas", { metodo: "POST", cuerpo: oferta });
      setForm(FORMULARIO_VACIO);
      alerta({
        icono: "✅",
        titulo: "¡Oferta enviada!",
        mensaje: "Quedó registrada en pendientes para ser evaluada por el administrador."
      });
    } catch (error) {
      console.error("Error al enviar la oferta:", error);
      alerta({
        icono: "❌",
        titulo: "No se pudo enviar la oferta",
        mensaje: "Verificá que el servidor backend esté corriendo e intentá de nuevo."
      });
    } finally {
      setEnviando(false);
    }
  }

  async function eliminarHotel(hotel) {
    const confirmado = await confirmar({
      icono: "🗑️",
      titulo: "¿Retirar este hotel?",
      mensaje: `"${hotel.nombre}" se retirará del catálogo oficial. Esta acción no se puede deshacer.`,
      textoConfirmar: "Sí, retirar",
      peligro: true
    });
    if (!confirmado) return;

    try {
      await api(`/api/hoteles/${hotel.id}`, { metodo: "DELETE" });
      cargarHoteles();
    } catch (error) {
      console.error("Error al eliminar hotel:", error);
      await alerta({
        icono: "❌",
        titulo: "No se pudo retirar el hotel",
        mensaje: "Ocurrió un problema al intentar eliminarlo. Intentá de nuevo."
      });
    }
  }

  const total = hoteles.length;
  const totalHab = hoteles.reduce((suma, h) => suma + Number(h.cantidad_habitaciones || 0), 0);
  const promedio = total > 0 ? Math.round(totalHab / total) : "—";

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div className="page-header-left">
          <div className="logo-mark">
            <IconoEdificio />
          </div>
          <div>
            <h1>Gestión de Hoteles</h1>
            <p>Administrá tus ofertas </p>
          </div>
        </div>
        <Link to="/" className="btn btn-ghost" style={{ marginLeft: "auto", textDecoration: "none" }}>
          Inicio
        </Link>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Hoteles</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="label">Habitaciones</div>
          <div className="value">{totalHab}</div>
        </div>
        <div className="stat-card">
          <div className="label">Promedio hab.</div>
          <div className="value">{promedio}</div>
        </div>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <span className="dot"></span>
          <h2>Nuevo hotel</h2>
        </div>

        <form onSubmit={enviarOferta}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                placeholder="Ej: Hotel Palermo"
                required
                value={form.nombre}
                onChange={cambiar("nombre")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="localizacion">Localización</label>
              <input
                type="text"
                id="localizacion"
                placeholder="Ej: Buenos Aires"
                required
                value={form.localizacion}
                onChange={cambiar("localizacion")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="habitaciones">Habitaciones</label>
              <input
                type="number"
                id="habitaciones"
                placeholder="Ej: 80"
                min="1"
                required
                value={form.habitaciones}
                onChange={cambiar("habitaciones")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="precio">Precio por noche ($)</label>
              <input
                type="number"
                id="precio"
                placeholder="Ej: 45000"
                min="0"
                step="1"
                required
                value={form.precio}
                onChange={cambiar("precio")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="imagen">URL imagen</label>
              <input
                type="text"
                id="imagen"
                placeholder="https://..."
                value={form.imagen}
                onChange={cambiar("imagen")}
              />
            </div>

            <div className="form-group full">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                placeholder="Breve descripción del hotel..."
                value={form.descripcion}
                onChange={cambiar("descripcion")}
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setForm(FORMULARIO_VACIO)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {enviando ? "Enviando oferta..." : "Subir Oferta"}
            </button>
          </div>
        </form>
      </div>

      <div>
        <div className="list-header">
          <h2>Hoteles registrados</h2>
          <span className="count">{total === 1 ? "1 propiedad" : `${total} propiedades`}</span>
        </div>

        <div id="listaHoteles">
          {errorLista && (
            <p style={{ textAlign: "center", color: "#dc2626" }}>Error al conectar con la base de datos.</p>
          )}

          {!errorLista && total === 0 && (
            <div className="empty-state">
              <p>No hay hoteles registrados todavía.</p>
            </div>
          )}

          {!errorLista &&
            hoteles.map((hotel) => (
              <div className="hotel" key={hotel.id}>
                <div className="hotel-icon">
                  <IconoEdificio />
                </div>
                <div className="hotel-body">
                  <h3>{hotel.nombre}</h3>
                  <div className="hotel-meta">
                    <span>
                      <IconoPin /> {hotel.localizacion}
                    </span>
                    <span>
                      <IconoPuerta /> {hotel.cantidad_habitaciones} hab.
                    </span>
                    <span>💵 ${hotel.precio ?? 0} / noche</span>
                  </div>
                </div>
                <span className="badge-active">Activo</span>
                <button
                  type="button"
                  className="btn-delete"
                  title="Eliminar hotel"
                  onClick={() => eliminarHotel(hotel)}
                >
                  <IconoPapelera />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
