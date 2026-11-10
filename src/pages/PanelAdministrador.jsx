import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEstilos from "../hooks/useEstilos.js";
import administradorCss from "../styles/administrador.css?inline";
import { useDialogos } from "../context/DialogosContext.jsx";
import { api, IMAGEN_PREDETERMINADA } from "../services/api.js";

export default function PanelAdministrador() {
  useEstilos(administradorCss);

  const { alerta, confirmar } = useDialogos();

  const [ofertas, setOfertas] = useState([]);
  const [estado, setEstado] = useState("cargando");

  const cargarOfertas = useCallback(async () => {
    try {
      const lista = await api("/api/ofertas");
      setOfertas(lista);
      setEstado("listo");
    } catch (error) {
      console.error("Error al cargar las ofertas:", error);
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    cargarOfertas();
  }, [cargarOfertas]);

  async function aceptarOferta(oferta) {
    const confirmado = await confirmar({
      icono: "🏨",
      titulo: "¿Aprobar esta oferta?",
      mensaje: `"${oferta.nombre}" se agregará al catálogo oficial y se quitará de las ofertas pendientes.`,
      textoConfirmar: "Sí, aprobar"
    });
    if (!confirmado) return;

    try {
      try {
        await api("/api/hoteles", {
          metodo: "POST",
          cuerpo: {
            nombre: oferta.nombre,
            localizacion: oferta.localizacion,
            cantidad_habitaciones: oferta.cantidad_habitaciones,
            imagen_h: oferta.imagen_h,
            descripcion: oferta.descripcion,
            precio: oferta.precio
          }
        });
      } catch (error) {
        console.error("Error devuelto por /api/hoteles:", error);
        throw new Error("No se pudo guardar el hotel en la base de datos.");
      }

      try {
        await api(`/api/ofertas/${oferta.id}`, { metodo: "DELETE" });
      } catch {
        throw new Error(
          "El hotel fue guardado en la BD, pero ocurrió un problema al quitarlo de la lista de pendientes."
        );
      }

      cargarOfertas();
      await alerta({
        icono: "✅",
        titulo: "¡Oferta aprobada!",
        mensaje: `"${oferta.nombre}" ya forma parte del catálogo oficial.`
      });
    } catch (error) {
      console.error("Error al aceptar oferta:", error);
      await alerta({ icono: "❌", titulo: "Ocurrió un problema", mensaje: error.message });
    }
  }

  async function rechazarOferta(oferta) {
    const confirmado = await confirmar({
      icono: "🗑️",
      titulo: "¿Rechazar esta propuesta?",
      mensaje: `La propuesta "${oferta.nombre}" se eliminará de la lista de pendientes. Esta acción no se puede deshacer.`,
      textoConfirmar: "Sí, rechazar",
      peligro: true
    });
    if (!confirmado) return;

    try {
      const respuesta = await api(`/api/ofertas/${oferta.id}`, { metodo: "DELETE" });
      cargarOfertas();
      await alerta({
        icono: "🗑️",
        titulo: "Propuesta rechazada",
        mensaje: respuesta?.mensaje || "La propuesta fue eliminada de la lista de pendientes."
      });
    } catch (error) {
      console.error("Error al rechazar oferta:", error);
      await alerta({
        icono: "❌",
        titulo: "Ocurrió un problema",
        mensaje: "No se pudo descartar la oferta. Intentá de nuevo."
      });
    }
  }

  const total = ofertas.length;
  const totalHab = ofertas.reduce((suma, o) => suma + Number(o.cantidad_habitaciones || 0), 0);
  const promedio = total > 0 ? Math.round(totalHab / total) : "—";

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div className="page-header-left">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" />
            </svg>
          </div>
          <div>
            <h1>Panel de Administrador</h1>
            <p>Revisión y aprobación de ofertas de hoteles</p>
          </div>
        </div>
        <Link to="/" className="btn btn-ghost" style={{ marginLeft: "auto" }}>
          Inicio
        </Link>
      </header>

      <section className="stats-row">
        <div className="stat-card">
          <div className="label">Ofertas Pendientes</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Habitaciones</div>
          <div className="value">{totalHab}</div>
        </div>
        <div className="stat-card">
          <div className="label">Promedio de Habitaciones</div>
          <div className="value">{promedio}</div>
        </div>
      </section>

      <section className="list-section">
        <div className="list-header">
          <h2>Ofertas Recibidas</h2>
          <span className="count">{total === 1 ? "1 oferta" : `${total} ofertas`}</span>
        </div>

        <div id="listaOfertas">
          {estado === "cargando" && (
            <p style={{ textAlign: "center", color: "#9A9A92" }}>Cargando ofertas pendientes...</p>
          )}

          {estado === "error" && (
            <p style={{ textAlign: "center", color: "#dc2626" }}>Error al conectar con el servidor.</p>
          )}

          {estado === "listo" && total === 0 && (
            <div className="empty-state">
              <p>🏨</p>
              <p>No hay ofertas pendientes de revisión.</p>
            </div>
          )}

          {estado === "listo" &&
            ofertas.map((oferta) => (
              <div className="hotel-card" key={oferta.id}>
                <div className="hotel-header">
                  <div className="hotel-title-group">
                    <img
                      className="hotel-thumb"
                      src={oferta.imagen_h || IMAGEN_PREDETERMINADA}
                      alt={oferta.nombre}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = IMAGEN_PREDETERMINADA;
                      }}
                    />
                    <div>
                      <h3>{oferta.nombre}</h3>
                      <div className="hotel-meta">
                        <span>💵 ${oferta.precio?.toLocaleString("es-AR") || "0"} / noche</span>
                        <span>🛏️ {oferta.cantidad_habitaciones} hab.</span>
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-pending">Pendiente</span>
                </div>
                <div className="hotel-actions">
                  <button type="button" className="btn btn-reject" onClick={() => rechazarOferta(oferta)}>
                    Rechazar
                  </button>
                  <button type="button" className="btn btn-accept" onClick={() => aceptarOferta(oferta)}>
                    Aceptar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
