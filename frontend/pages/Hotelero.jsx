import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import css from "../styles/admin.css?inline";
import usePageStyles from "../hooks/usePageStyles.js";
import StatCard from "../components/StatCard.jsx";
import { IconEdificio, IconPin, IconPuerta, IconTrash } from "../components/Icons.jsx";
import { getHoteles, crearOferta, eliminarHotel } from "../services/api.js";

const FORM_INICIAL = {
  nombre: "",
  localizacion: "",
  habitaciones: "",
  precio: "",
  imagen: "",
  descripcion: "",
};

/* Panel del hotelero: envía ofertas (quedan pendientes) y gestiona hoteles publicados */
export default function Hotelero() {
  usePageStyles(css);

  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [hoteles, setHoteles] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | ok | error

  const cargarHoteles = useCallback(async () => {
    try {
      setHoteles(await getHoteles());
      setEstado("ok");
    } catch (error) {
      console.error("Error al cargar hoteles:", error);
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    cargarHoteles();
  }, [cargarHoteles]);

  const setCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const ofertaHotel = {
      nombre: form.nombre.trim(),
      localizacion: form.localizacion.trim(),
      cantidad_habitaciones: Number(form.habitaciones),
      precio: Number(form.precio),
      imagen_h: form.imagen.trim() || null,
      descripcion: form.descripcion.trim() || "Sin descripción",
    };

    try {
      await crearOferta(ofertaHotel);
      alert("¡Oferta enviada exitosamente! Quedó registrada en pendientes para ser evaluada por el administrador.");
      setForm(FORM_INICIAL);
    } catch (error) {
      console.error("Error al enviar la oferta:", error);
      alert("❌ No se pudo enviar la oferta. Verifica que el servidor backend esté corriendo.");
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Deseas retirar este hotel del catálogo oficial?")) return;
    try {
      await eliminarHotel(id);
      cargarHoteles();
    } catch (error) {
      console.error("Error al eliminar hotel:", error);
      alert("❌ Error al intentar eliminar el hotel.");
    }
  };

  // Estadísticas
  const total = hoteles.length;
  const totalHab = hoteles.reduce((sum, h) => sum + Number(h.cantidad_habitaciones || 0), 0);
  const promedio = total > 0 ? Math.round(totalHab / total) : "—";

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div className="page-header-left">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" /></svg>
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
        <StatCard label="Hoteles" value={total} />
        <StatCard label="Habitaciones" value={totalHab} />
        <StatCard label="Promedio hab." value={promedio} />
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <span className="dot"></span>
          <h2>Nuevo hotel</h2>
        </div>

        <form onSubmit={handleSubmit} onReset={() => setForm(FORM_INICIAL)}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input type="text" id="nombre" placeholder="Ej: Hotel Palermo" required value={form.nombre} onChange={setCampo("nombre")} />
            </div>

            <div className="form-group">
              <label htmlFor="localizacion">Localización</label>
              <input type="text" id="localizacion" placeholder="Ej: Buenos Aires" required value={form.localizacion} onChange={setCampo("localizacion")} />
            </div>

            <div className="form-group">
              <label htmlFor="habitaciones">Habitaciones</label>
              <input type="number" id="habitaciones" placeholder="Ej: 80" min="1" required value={form.habitaciones} onChange={setCampo("habitaciones")} />
            </div>

            <div className="form-group">
              <label htmlFor="precio">Precio por noche ($)</label>
              <input type="number" id="precio" placeholder="Ej: 45000" min="0" step="0.01" required value={form.precio} onChange={setCampo("precio")} />
            </div>

            <div className="form-group">
              <label htmlFor="imagen">URL imagen</label>
              <input type="text" id="imagen" placeholder="https://..." value={form.imagen} onChange={setCampo("imagen")} />
            </div>

            <div className="form-group full">
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" placeholder="Breve descripción del hotel..." value={form.descripcion} onChange={setCampo("descripcion")} />
            </div>
          </div>

          <div className="form-actions">
            <button type="reset" className="btn btn-ghost">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? (
                "Enviando oferta..."
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Subir Oferta
                </>
              )}
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
          {estado === "error" && (
            <p style={{ textAlign: "center", color: "#dc2626" }}>Error al conectar con la base de datos.</p>
          )}
          {estado === "ok" && total === 0 && (
            <div className="empty-state"><p>No hay hoteles registrados todavía.</p></div>
          )}
          {hoteles.map((hotel) => (
            <div className="hotel" key={hotel.id}>
              <div className="hotel-icon"><IconEdificio /></div>
              <div className="hotel-body">
                <h3>{hotel.nombre}</h3>
                <div className="hotel-meta">
                  <span><IconPin /> {hotel.localizacion}</span>
                  <span><IconPuerta /> {hotel.cantidad_habitaciones} hab.</span>
                  <span>💵 ${hotel.precio ?? 0} / noche</span>
                </div>
              </div>
              <span className="badge-active">Activo</span>
              <button className="btn-delete" onClick={() => handleEliminar(hotel.id)} title="Eliminar hotel">
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
