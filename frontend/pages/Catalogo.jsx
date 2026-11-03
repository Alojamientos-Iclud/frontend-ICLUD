import { useEffect, useState } from "react";
import css from "../styles/catalogo.css?inline";
import usePageStyles from "../hooks/usePageStyles.js";
import useToast from "../hooks/useToast.js";
import Modal from "../components/Modal.jsx";
import Toast from "../components/Toast.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { getHoteles, checkout } from "../services/api.js";

const IMG_DEFAULT = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200";

const RESERVA_INICIAL = {
  nombre: "",
  email: "",
  huespedes: "",
  llegada: "",
  salida: "",
};

export default function Catalogo() {
  usePageStyles(css);

  const [hoteles, setHoteles] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | ok | error
  const [expandido, setExpandido] = useState(null); // id de la tarjeta abierta
  const [modal, setModal] = useState(null); // null | "reserva" | "confirmacion"
  const [hotelId, setHotelId] = useState("");
  const [reserva, setReserva] = useState(RESERVA_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [emailConfirmado, setEmailConfirmado] = useState("");
  const { toast, showToast } = useToast(4000);

  useEffect(() => {
    getHoteles()
      .then((data) => {
        setHoteles(data);
        setEstado("ok");
      })
      .catch((err) => {
        console.error("Error:", err);
        setEstado("error");
      });
  }, []);

  const abrirReserva = (id) => {
    setHotelId(id);
    setModal("reserva");
  };

  const handleReserva = async (e) => {
    e.preventDefault();
    const datos = {
      hotelId,
      nombre_completo: reserva.nombre,
      gmail: reserva.email,
      cantidad_huespedes: Number(reserva.huespedes),
      llegada: reserva.llegada,
      salida: reserva.salida,
    };

    setEnviando(true);
    try {
      await checkout(datos);
      setModal("confirmacion");
      setEmailConfirmado(datos.gmail);
      setReserva(RESERVA_INICIAL);
    } catch (error) {
      console.error("Error al procesar la reserva:", error);
      showToast("❌ Hubo un problema. Intentalo de nuevo.", "error");
    } finally {
      setEnviando(false);
    }
  };

  const setCampo = (campo) => (e) => setReserva({ ...reserva, [campo]: e.target.value });

  return (
    <>
      <SiteHeader
        links={[
          { to: "/", label: "Inicio" },
          { label: "Alojamientos", active: true },
          { label: "Explorar" },
          { label: "Ofertas" },
        ]}
      />

      <main className="catalogo-container">
        <h1 className="catalogo-title">Todos nuestros alojamientos</h1>

        <div className="cards" id="cards-container">
          {estado === "cargando" && (
            <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#666" }}>
              Cargando catálogo disponible...
            </p>
          )}
          {estado === "error" && (
            <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#ef4444" }}>
              Error al conectar con la base de datos.
            </p>
          )}
          {estado === "ok" && hoteles.length === 0 && (
            <p style={{ gridColumn: "1/-1", textAlign: "center" }}>No hay alojamientos disponibles.</p>
          )}

          {hoteles.map((hotel) => (
            <div
              key={hotel.id}
              className={`card${expandido === hotel.id ? " expanded" : ""}`}
              onClick={() => setExpandido(expandido === hotel.id ? null : hotel.id)}
            >
              <img src={hotel.imagen_h || IMG_DEFAULT} alt={hotel.nombre} />
              <div className="card-content">
                <h3>{hotel.nombre}</h3>
                <p>📍 {hotel.localizacion}</p>
                <p>🛏️ {hotel.cantidad_habitaciones} Hab.</p>
                <p className="hotel-desc">{hotel.descripcion || "Sin descripción disponible."}</p>
                <div className="price">
                  ${hotel.precio?.toLocaleString("es-AR") || "---"} ARS / noche
                </div>
                <button
                  className="btn-reservar"
                  style={{ marginTop: 10, width: "100%" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirReserva(hotel.id);
                  }}
                >
                  Reservar ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />

      {/* MODAL RESERVA */}
      <Modal open={modal === "reserva"} onClose={() => setModal(null)}>
        <h2>Reservá tu estadía</h2>
        <p className="modal-sub">Completá los datos para proceder al pago seguro</p>
        <form onSubmit={handleReserva}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input type="text" placeholder="Ej: Juan Pérez" required value={reserva.nombre} onChange={setCampo("nombre")} />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="tu@email.com" required value={reserva.email} onChange={setCampo("email")} />
          </div>
          <div className="form-group">
            <label>Cantidad de huéspedes</label>
            <input type="number" min="1" placeholder="Ej: 2" required value={reserva.huespedes} onChange={setCampo("huespedes")} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha de llegada</label>
              <input type="date" required value={reserva.llegada} onChange={setCampo("llegada")} />
            </div>
            <div className="form-group">
              <label>Fecha de salida</label>
              <input type="date" required value={reserva.salida} onChange={setCampo("salida")} />
            </div>
          </div>
          <button type="submit" className="btn-submit" disabled={enviando}>
            {enviando ? "Enviando reserva... 🔄" : "Confirmar reserva 📩"}
          </button>
        </form>
      </Modal>

      {/* MODAL CONFIRMACIÓN DE MAIL */}
      <Modal open={modal === "confirmacion"} onClose={() => setModal(null)} style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, margin: "16px 0" }}>📧</div>
        <h2 style={{ color: "#1a1a2e", margin: "0 0 8px" }}>¡Reserva recibida!</h2>
        <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>
          Te enviamos un correo a<br />
          <strong style={{ color: "#635bff" }}>{emailConfirmado}</strong>
        </p>
        <p style={{ color: "#888", fontSize: 13, margin: "0 0 28px" }}>
          Abrí el mail y hacé clic en <strong>"Completar pago con Stripe"</strong> para finalizar tu reserva.<br />
          El enlace es válido por <strong>24 horas</strong>.
        </p>
        <button className="btn-submit" onClick={() => setModal(null)} style={{ background: "#1a1a2e" }}>
          Entendido ✓
        </button>
        <p style={{ color: "#bbb", fontSize: 12, marginTop: 16 }}>¿No lo encontrás? Revisá la carpeta de spam.</p>
      </Modal>

      <Toast toast={toast} />
    </>
  );
}
