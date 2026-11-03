import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import css from "../styles/administrador.css?inline";
import usePageStyles from "../hooks/usePageStyles.js";
import StatCard from "../components/StatCard.jsx";
import { getOfertas, crearHotel, eliminarOferta } from "../services/api.js";

/* Panel del administrador: revisión y aprobación de ofertas pendientes */
export default function Administrador() {
  usePageStyles(css);

  const [ofertas, setOfertas] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | ok | error

  const cargarOfertas = useCallback(async () => {
    try {
      setOfertas(await getOfertas());
      setEstado("ok");
    } catch (error) {
      console.error("Error al cargar las ofertas:", error);
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    cargarOfertas();
  }, [cargarOfertas]);

  // Aceptar: sube el hotel a la BD (/api/hoteles) y la quita de pendientes
  const aceptar = async (id) => {
    if (!confirm("¿Deseas aprobar esta oferta y agregarla al catálogo oficial?")) return;

    const oferta = ofertas.find((o) => String(o.id) === String(id));
    if (!oferta) {
      alert("❌ No se encontró la información de la oferta en memoria.");
      return;
    }

    try {
      await crearHotel({
        nombre: oferta.nombre,
        localizacion: oferta.localizacion,
        cantidad_habitaciones: oferta.cantidad_habitaciones,
        imagen_h: oferta.imagen_h,
        descripcion: oferta.descripcion,
        precio: oferta.precio,
      });

      try {
        await eliminarOferta(id);
      } catch {
        throw new Error("El hotel fue guardado en la BD, pero ocurrió un problema al quitarlo de la lista de pendientes.");
      }

      alert("✅ Oferta aprobada e ingresada al catálogo correctamente.");
      cargarOfertas();
    } catch (error) {
      console.error("Error al aceptar oferta:", error);
      alert("❌ Error: " + error.message);
    }
  };

  // Rechazar: solo se elimina de pendientes
  const rechazar = async (id) => {
    if (!confirm("¿Deseas rechazar y eliminar esta propuesta?")) return;

    try {
      const res = await eliminarOferta(id);
      alert("🗑️ " + (res.mensaje ?? "Oferta eliminada."));
      cargarOfertas();
    } catch (error) {
      console.error("Error al rechazar oferta:", error);
      alert("❌ Ocurrió un problema al descartar la oferta.");
    }
  };

  // Estadísticas
  const total = ofertas.length;
  const totalHab = ofertas.reduce((sum, o) => sum + Number(o.cantidad_habitaciones || 0), 0);
  const promedio = total > 0 ? Math.round(totalHab / total) : "—";

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div className="page-header-left">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" /></svg>
          </div>
          <div>
            <h1>Panel de Administrador</h1>
            <p>Revisión y aprobación de ofertas de hoteles</p>
          </div>
        </div>
        <Link to="/" className="btn btn-ghost" style={{ marginLeft: "auto", textDecoration: "none" }}>
          Inicio
        </Link>
      </header>

      <section className="stats-row">
        <StatCard label="Ofertas Pendientes" value={total} />
        <StatCard label="Total Habitaciones" value={totalHab} />
        <StatCard label="Promedio de Habitaciones" value={promedio} />
      </section>

      <section className="list-section">
        <div className="list-header">
          <h2>Ofertas Recibidas</h2>
          <span className="count">{total === 1 ? "1 oferta" : `${total} ofertas`}</span>
        </div>

        <div id="listaHoteles">
          {estado === "cargando" && (
            <p style={{ textAlign: "center", color: "#9A9A92" }}>Cargando ofertas pendientes...</p>
          )}
          {estado === "error" && (
            <p style={{ textAlign: "center", color: "#dc2626" }}>Error al conectar con el servidor.</p>
          )}
          {estado === "ok" && total === 0 && (
            <div className="empty-state">
              <p>🏨</p>
              <p>No hay ofertas pendientes de revisión.</p>
            </div>
          )}

          {ofertas.map((oferta) => (
            <div className="hotel" key={oferta.id}>
              <div className="hotel-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" />
                </svg>
              </div>
              <div className="hotel-body">
                <h3>{oferta.nombre}</h3>
                <div className="hotel-meta">
                  <span>💵 ${oferta.precio?.toLocaleString("es-AR") || "0"} / noche</span>
                  <span>🛏️ {oferta.cantidad_habitaciones} hab.</span>
                </div>
              </div>
              <div className="hotel-actions" style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={() => aceptar(oferta.id)}>Aceptar</button>
                <button
                  className="btn btn-ghost"
                  onClick={() => rechazar(oferta.id)}
                  style={{ color: "#dc2626", borderColor: "#fecaca" }}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
