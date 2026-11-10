import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Modal from "../components/Modal.jsx";
import Toast from "../components/Toast.jsx";
import TarjetaHotel from "../components/TarjetaHotel.jsx";
import ModalReserva from "../components/ModalReserva.jsx";
import useEstilos from "../hooks/useEstilos.js";
import catalogoCss from "../styles/catalogo.css?inline";
import { useSesion } from "../context/SesionContext.jsx";
import { api } from "../services/api.js";

export default function Catalogo({ soloFavoritos = false }) {
  useEstilos(catalogoCss);

  const { sesion, cerrar } = useSesion();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [hoteles, setHoteles] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [favoritosIds, setFavoritosIds] = useState(new Set());
  const [expandidaId, setExpandidaId] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);

  const [reserva, setReserva] = useState({ abierto: false, hotelId: null });
  const [confirmacion, setConfirmacion] = useState({ abierto: false, email: "" });
  const [loginRequerido, setLoginRequerido] = useState({
    abierto: false,
    mensaje: "Iniciá sesión o registrate para continuar."
  });

  const [toast, setToast] = useState(null);
  const temporizadorToast = useRef(null);

  const mostrarToast = useCallback((mensaje, error = false) => {
    setToast({ mensaje, error });
    clearTimeout(temporizadorToast.current);
    temporizadorToast.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(temporizadorToast.current), []);

  const irALogin = useCallback(
    () => navigate("/login?next=/favoritos", { replace: true }),
    [navigate]
  );

  const abrirLoginRequerido = useCallback((mensaje) => {
    setLoginRequerido({ abierto: true, mensaje });
  }, []);

  const manejarSesionExpirada = useCallback(() => {
    cerrar();
    if (soloFavoritos) {
      irALogin();
      return;
    }
    setFavoritosIds(new Set());
    abrirLoginRequerido("Tu sesión expiró. Iniciá sesión de nuevo para continuar.");
  }, [cerrar, soloFavoritos, irALogin, abrirLoginRequerido]);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setEstado("cargando");
      setExpandidaId(null);

      if (soloFavoritos) {
        if (!sesion) {
          irALogin();
          return;
        }
        try {
          const favoritos = await api("/api/favoritos", { auth: true });
          if (cancelado) return;
          setFavoritosIds(new Set(favoritos.map((h) => h.id)));
          setHoteles(favoritos);
          setEstado("listo");
        } catch (error) {
          if (cancelado) return;
          if (error.status === 401) {
            cerrar();
            irALogin();
            return;
          }
          console.error("Error:", error);
          setEstado("error");
        }
        return;
      }

      let ids = new Set();
      if (sesion) {
        try {
          const favoritos = await api("/api/favoritos", { auth: true });
          ids = new Set(favoritos.map((h) => h.id));
        } catch (error) {
          if (error.status === 401) cerrar();
          else console.error("No se pudieron cargar los favoritos:", error);
        }
      }

      try {
        const lista = await api("/api/hoteles");
        if (cancelado) return;
        setFavoritosIds(ids);
        setHoteles(lista);
        setEstado("listo");
      } catch (error) {
        if (cancelado) return;
        console.error("Error:", error);
        setEstado("error");
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [soloFavoritos, sesion]);

  async function alternarFavorito(hotelId) {
    if (!sesion) {
      abrirLoginRequerido("Para guardar favoritos necesitás iniciar sesión o registrarte.");
      return;
    }

    const eraFavorito = favoritosIds.has(hotelId);
    setProcesandoId(hotelId);

    try {
      if (eraFavorito) {
        await api(`/api/favoritos/${hotelId}`, { metodo: "DELETE", auth: true });
      } else {
        await api("/api/favoritos", { metodo: "POST", cuerpo: { hotelId }, auth: true });
      }

      setFavoritosIds((previos) => {
        const nuevos = new Set(previos);
        if (eraFavorito) nuevos.delete(hotelId);
        else nuevos.add(hotelId);
        return nuevos;
      });

      if (soloFavoritos && eraFavorito) {
        setHoteles((lista) => lista.filter((h) => h.id !== hotelId));
        mostrarToast("Quitado de favoritos");
        return;
      }

      mostrarToast(eraFavorito ? "Quitado de favoritos" : "♥ Agregado a favoritos");
    } catch (error) {
      if (error.status === 401) {
        manejarSesionExpirada();
        return;
      }
      console.error("Error al actualizar favoritos:", error);
      mostrarToast("❌ No se pudo actualizar tus favoritos.", true);
    } finally {
      setProcesandoId(null);
    }
  }

  function abrirReserva(hotelId) {
    if (!sesion) {
      abrirLoginRequerido("Para reservar un alojamiento necesitás iniciar sesión o registrarte.");
      return;
    }
    setReserva({ abierto: true, hotelId });
  }

  const siguiente = encodeURIComponent(pathname);

  return (
    <>
      <Header activo={soloFavoritos ? "favoritos" : "catalogo"} />

      <main className="catalogo-container">
        <h1 className="catalogo-title">
          {soloFavoritos ? "Mis hoteles favoritos" : "Todos nuestros alojamientos"}
        </h1>

        <div className="cards" id="cards-container">
          {estado === "cargando" && (
            <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#666" }}>
              {soloFavoritos ? "Cargando tus favoritos..." : "Cargando catálogo disponible..."}
            </p>
          )}

          {estado === "error" && (
            <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#ef4444" }}>
              {soloFavoritos
                ? "No se pudieron cargar tus favoritos."
                : "Error al conectar con la base de datos."}
            </p>
          )}

          {estado === "listo" && hoteles.length === 0 && soloFavoritos && (
            <div className="estado-vacio">
              <div className="estado-vacio-icono">💔</div>
              <h2>No tenés ningún hotel en favoritos</h2>
              <p>Abrí la tarjeta de un alojamiento y tocá "Agregar a favoritos" para guardarlo acá.</p>
              <Link to="/catalogo">Ver alojamientos</Link>
            </div>
          )}

          {estado === "listo" && hoteles.length === 0 && !soloFavoritos && (
            <p style={{ gridColumn: "1/-1", textAlign: "center" }}>No hay alojamientos disponibles.</p>
          )}

          {estado === "listo" &&
            hoteles.map((hotel) => (
              <TarjetaHotel
                key={hotel.id}
                hotel={hotel}
                esFavorito={favoritosIds.has(hotel.id)}
                expandida={expandidaId === hotel.id}
                procesando={procesandoId === hotel.id}
                onAlternarExpandida={() => setExpandidaId((id) => (id === hotel.id ? null : hotel.id))}
                onFavorito={() => alternarFavorito(hotel.id)}
                onReservar={() => abrirReserva(hotel.id)}
              />
            ))}
        </div>
      </main>

      <Footer />

      <ModalReserva
        abierto={reserva.abierto}
        hotelId={reserva.hotelId}
        onCerrar={() => setReserva((r) => ({ ...r, abierto: false }))}
        onReservada={(email) => setConfirmacion({ abierto: true, email })}
        onRequiereLogin={abrirLoginRequerido}
        onSesionExpirada={() => {
          setReserva((r) => ({ ...r, abierto: false }));
          manejarSesionExpirada();
        }}
        onError={(mensaje) => mostrarToast(mensaje, true)}
      />

      <Modal
        abierto={confirmacion.abierto}
        centrado
        onCerrar={() => setConfirmacion((c) => ({ ...c, abierto: false }))}
      >
        <div style={{ fontSize: 56, margin: "16px 0" }}>📧</div>
        <h2 style={{ color: "#1a1a2e", margin: "0 0 8px" }}>¡Reserva recibida!</h2>
        <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>
          Te enviamos un correo a<br />
          <strong style={{ color: "#635bff" }}>{confirmacion.email}</strong>
        </p>
        <p style={{ color: "#888", fontSize: 13, margin: "0 0 28px" }}>
          Abrí el mail y hacé clic en <strong>"Completar pago con Stripe"</strong> para finalizar tu reserva.
          <br />
          El enlace es válido por <strong>24 horas</strong>.
        </p>
        <button
          type="button"
          className="btn-submit"
          style={{ background: "#1a1a2e" }}
          onClick={() => setConfirmacion((c) => ({ ...c, abierto: false }))}
        >
          Entendido ✓
        </button>
        <p style={{ color: "#bbb", fontSize: 12, marginTop: 16 }}>¿No lo encontrás? Revisá la carpeta de spam.</p>
      </Modal>

      <Modal
        abierto={loginRequerido.abierto}
        centrado
        onCerrar={() => setLoginRequerido((l) => ({ ...l, abierto: false }))}
      >
        <div style={{ fontSize: 48, margin: "12px 0" }}>🔒</div>
        <h2>Necesitás una cuenta</h2>
        <p className="modal-sub">{loginRequerido.mensaje}</p>
        <Link className="btn-submit btn-link" to={`/login?next=${siguiente}`}>
          Iniciar sesión
        </Link>
        <Link
          className="btn-submit btn-link secundario"
          to={`/registro?next=${siguiente}`}
          style={{ marginTop: 10 }}
        >
          Registrarme
        </Link>
      </Modal>

      <Toast toast={toast} />
    </>
  );
}
